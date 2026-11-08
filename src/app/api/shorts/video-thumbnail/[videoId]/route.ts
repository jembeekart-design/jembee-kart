import { NextResponse } from "next/server";
import { getAdminDb } from "@/firebase/admin";
import { getDriveFileMetadata } from "@/services/googleDriveService";
import { playbackCookieName, verifyPlaybackToken } from "@/lib/payments/cashfreeServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  context: { params: Promise<{ videoId: string }> }
) {
  try {
    const { videoId } = await context.params;

    if (!videoId || videoId.length > 200 || videoId.includes("/")) {
      return new NextResponse("Invalid video ID", { status: 400 });
    }

    const snapshot = await getAdminDb()
      .collection("watchEarnVideos")
      .doc(videoId)
      .get();

    if (!snapshot.exists) {
      return new NextResponse("Video not found", { status: 404 });
    }

    const data = snapshot.data();

    if (
      data?.status !== "approved" ||
      data?.active !== true ||
      data?.moderation !== "safe" ||
      data?.paidVideoStatus === "payment_integration_pending" ||
      typeof data?.driveFileId !== "string" ||
      !data.driveFileId.trim()
    ) {
      return new NextResponse("Thumbnail unavailable", { status: 404 });
    }

    // Paid thumbnails use the same short-lived, video-scoped playback cookie
    // as the stream endpoint. Never expose Drive thumbnail URLs to unpaid users.
    if (data?.videoAccess === "paid") {
      const cookieName = playbackCookieName(videoId);
      const cookieHeader = req.headers.get("cookie") || "";
      const cookie = cookieHeader
        .split(";")
        .map((part) => part.trim())
        .find((part) => part.startsWith(`${cookieName}=`));
      const token = cookie
        ? decodeURIComponent(cookie.slice(cookieName.length + 1))
        : "";

      if (!token || !verifyPlaybackToken(token, videoId)) {
        return new NextResponse("Playback session required", {
          status: 401,
          headers: { "Cache-Control": "private, no-store" },
        });
      }

      let payload: { uid?: string };
      try {
        payload = JSON.parse(
          Buffer.from(token.split(".")[0], "base64url").toString("utf8")
        ) as { uid?: string };
      } catch {
        return new NextResponse("Invalid playback session", {
          status: 401,
          headers: { "Cache-Control": "private, no-store" },
        });
      }

      if (!payload.uid) {
        return new NextResponse("Invalid playback session", {
          status: 401,
          headers: { "Cache-Control": "private, no-store" },
        });
      }

      const purchase = await getAdminDb()
        .collection("watchVideoPurchases")
        .doc(`${videoId}_${payload.uid}`)
        .get();
      const purchaseData = purchase.data();

      if (
        !purchase.exists ||
        purchaseData?.status !== "paid" ||
        purchaseData?.accessRevoked === true ||
        purchaseData?.userId !== payload.uid ||
        purchaseData?.videoId !== videoId
      ) {
        return new NextResponse("Purchase required", {
          status: 403,
          headers: { "Cache-Control": "private, no-store" },
        });
      }
    }

    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID?.trim();

    if (!folderId) {
      console.error("GOOGLE_DRIVE_FOLDER_ID is not configured");
      return new NextResponse("Server configuration error", { status: 500 });
    }

    const metadata = await getDriveFileMetadata(data.driveFileId.trim());

    if (!metadata.parents.includes(folderId)) {
      return new NextResponse("Thumbnail access denied", { status: 403 });
    }

    if (!metadata.mimeType.startsWith("video/")) {
      return new NextResponse("Invalid video file", { status: 415 });
    }

    if (!metadata.thumbnailLink) {
      return new NextResponse("Drive thumbnail not available", { status: 404 });
    }

    // Keep thumbnail retrieval bounded and restrict redirects/hosts. Drive's
    // thumbnailLink is provider-controlled metadata; do not blindly follow it.
    const thumbnailUrl = new URL(metadata.thumbnailLink);
    const allowedHosts = new Set(["drive.google.com", "lh3.googleusercontent.com", "googleusercontent.com"]);
    if (thumbnailUrl.protocol !== "https:" || ![...allowedHosts].some((host) => thumbnailUrl.hostname === host || thumbnailUrl.hostname.endsWith(`.${host}`))) {
      return new NextResponse("Invalid thumbnail host", { status: 502 });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    let thumbnailResponse: Response;
    try {
      thumbnailResponse = await fetch(thumbnailUrl, {
        cache: "no-store",
        redirect: "error",
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!thumbnailResponse.ok || !thumbnailResponse.body) {
      return new NextResponse("Drive thumbnail unavailable", { status: 502 });
    }

    const contentType = (thumbnailResponse.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
    const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
    const declaredLength = Number(thumbnailResponse.headers.get("content-length") || 0);
    const MAX_THUMBNAIL_BYTES = 5 * 1024 * 1024;
    if (!allowedTypes.has(contentType) || (declaredLength > 0 && declaredLength > MAX_THUMBNAIL_BYTES)) {
      await thumbnailResponse.body.cancel().catch(() => undefined);
      return new NextResponse("Invalid thumbnail response", { status: 502 });
    }

    const reader = thumbnailResponse.body.getReader();
    const chunks: Uint8Array[] = [];
    let total = 0;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        total += value.byteLength;
        if (total > MAX_THUMBNAIL_BYTES) {
          await reader.cancel();
          return new NextResponse("Thumbnail too large", { status: 502 });
        }
        chunks.push(value);
      }
    } finally {
      reader.releaseLock();
    }
    const bytes = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }

    const isPaid = data?.videoAccess === "paid";
    return new NextResponse(bytes, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(bytes.byteLength),
        // Publicly reusable URLs are never exposed. Free thumbnails may be
        // cached in the signed-in browser briefly; paid thumbnails stay no-store.
        "Cache-Control": isPaid ? "private, no-store" : "private, max-age=300, stale-while-revalidate=600",
        "Vary": "Cookie",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Drive thumbnail request failed:", error);
    return new NextResponse("Thumbnail unavailable", { status: 500 });
  }
}
