import { NextResponse } from "next/server";
import { Readable } from "node:stream";
import { getAdminDb } from "@/firebase/admin";
import { playbackCookieName, verifyPlaybackToken } from "@/lib/payments/cashfreeServer";
import { getDriveFileMetadata, getDriveFileStream } from "@/services/googleDriveService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parseRange(value: string, size: number) {
  const match = /^bytes=(\d*)-(\d*)$/.exec(value.trim());
  if (!match || (!match[1] && !match[2])) return null;

  let start: number;
  let end: number;

  if (!match[1]) {
    const suffix = Number(match[2]);
    if (!Number.isSafeInteger(suffix) || suffix <= 0) return null;
    start = Math.max(0, size - suffix);
    end = size - 1;
  } else {
    start = Number(match[1]);
    end = match[2] ? Number(match[2]) : size - 1;
  }

  if (
    !Number.isSafeInteger(start) ||
    !Number.isSafeInteger(end) ||
    start < 0 ||
    start >= size ||
    end < start
  ) {
    return null;
  }

  return { start, end: Math.min(end, size - 1) };
}

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

    // Paid playback uses a short-lived, HttpOnly, video-scoped cookie because
    // native HTML video elements cannot attach Firebase Authorization headers.
    if (data?.videoAccess === "paid") {
      const cookieName = playbackCookieName(videoId);
      const cookieHeader = req.headers.get("cookie") || "";
      const cookie = cookieHeader.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${cookieName}=`));
      const token = cookie ? decodeURIComponent(cookie.slice(cookieName.length + 1)) : "";
      if (!token || !verifyPlaybackToken(token, videoId)) {
        return new NextResponse("Playback session required", { status: 401, headers: { "Cache-Control": "no-store" } });
      }
      const payload = JSON.parse(Buffer.from(token.split(".")[0], "base64url").toString("utf8")) as { uid: string };
      const purchase = await getAdminDb().collection("watchVideoPurchases").doc(`${videoId}_${payload.uid}`).get();
      const purchaseData = purchase.data();
      if (!purchase.exists || purchaseData?.status !== "paid" || purchaseData?.accessRevoked === true || purchaseData?.userId !== payload.uid || purchaseData?.videoId !== videoId) {
        return new NextResponse("Purchase required", { status: 403, headers: { "Cache-Control": "no-store" } });
      }
    }

    // Legacy records without videoAccess remain on the existing free-video path.
    // Explicitly pending paid records always fail closed.
    if (data?.paidVideoStatus === "payment_integration_pending") {
      return new NextResponse("Paid video playback is not enabled yet", {
        status: 403,
        headers: { "Cache-Control": "no-store" },
      });
    }

    if (
      data?.status !== "approved" ||
      data?.active !== true ||
      data?.moderation !== "safe" ||
      typeof data?.driveFileId !== "string" ||
      !data.driveFileId.trim()
    ) {
      return new NextResponse("Video unavailable", { status: 404 });
    }

    const driveFileId = data.driveFileId.trim();
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID?.trim();

    if (!folderId) {
      console.error("GOOGLE_DRIVE_FOLDER_ID is not configured");
      return new NextResponse("Server configuration error", { status: 500 });
    }

    const metadata = await getDriveFileMetadata(driveFileId);

    if (!metadata.parents.includes(folderId)) {
      return new NextResponse("Video access denied", { status: 403 });
    }

    if (!metadata.mimeType.startsWith("video/") || metadata.size <= 0) {
      return new NextResponse("Invalid video file", { status: 415 });
    }

    const rangeHeader = req.headers.get("range");
    const MAX_STREAM_CHUNK_BYTES = 8 * 1024 * 1024;
    const headers = new Headers({
      "Content-Type": metadata.mimeType,
      "Accept-Ranges": "bytes",
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    });

    if (!rangeHeader) {
      if (metadata.size > MAX_STREAM_CHUNK_BYTES) {
        return new NextResponse("A bounded byte range is required", {
          status: 416,
          headers: { "Content-Range": `bytes */${metadata.size}`, "Accept-Ranges": "bytes" },
        });
      }
      const { stream } = await getDriveFileStream(driveFileId);
      headers.set("Content-Length", String(metadata.size));

      return new NextResponse(
        Readable.toWeb(stream) as unknown as BodyInit,
        { status: 200, headers }
      );
    }

    const range = parseRange(rangeHeader, metadata.size);

    if (!range) {
      return new NextResponse("Range Not Satisfiable", {
        status: 416,
        headers: { "Content-Range": `bytes */${metadata.size}` },
      });
    }

    const start = range.start;
    const end = Math.min(
      range.end,
      start + MAX_STREAM_CHUNK_BYTES - 1
    );

    const { stream } = await getDriveFileStream(
      driveFileId,
      `bytes=${start}-${end}`
    );

    headers.set("Content-Length", String(end - start + 1));
    headers.set("Content-Range", `bytes ${start}-${end}/${metadata.size}`);

    return new NextResponse(
      Readable.toWeb(stream) as unknown as BodyInit,
      { status: 206, headers }
    );
  } catch (error) {
    console.error("Approved video stream failed:", error);
    return new NextResponse("Video stream unavailable", { status: 500 });
  }
}
