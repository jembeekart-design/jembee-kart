import { NextResponse } from "next/server";
import { getAdminDb } from "@/firebase/admin";
import { getDriveFileMetadata } from "@/services/googleDriveService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const MAX_THUMBNAIL_BYTES = 5 * 1024 * 1024;
const ALLOWED_HOSTS = new Set(["lh3.googleusercontent.com", "drive.google.com", "drive.usercontent.google.com"]);

async function fetchBoundedDriveImage(initialUrl: string): Promise<{ bytes: Uint8Array; contentType: string } | null> {
  let current = new URL(initialUrl);
  for (let redirects = 0; redirects <= 3; redirects++) {
    if (current.protocol !== "https:" || !ALLOWED_HOSTS.has(current.hostname)) return null;
    const response = await fetch(current, { cache: "no-store", redirect: "manual", signal: AbortSignal.timeout(10000) });
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get("location");
      if (!location || redirects === 3) return null;
      current = new URL(location, current);
      continue;
    }
    if (!response.ok || !response.body) return null;
    const contentType = (response.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(contentType)) return null;
    const length = Number(response.headers.get("content-length") || 0);
    if (length > MAX_THUMBNAIL_BYTES) return null;
    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let total = 0;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        total += value.byteLength;
        if (total > MAX_THUMBNAIL_BYTES) {
          await reader.cancel();
          return null;
        }
        chunks.push(value);
      }
    } finally {
      reader.releaseLock();
    }
    const bytes = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    return { bytes, contentType };
  }
  return null;
}

export async function GET(
  _req: Request,
  context: { params: Promise<{ videoId: string }> }
) {
  try {
    const { videoId } = await context.params;
    if (!videoId || videoId.length > 200 || videoId.includes("/")) return new NextResponse("Invalid video ID", { status: 400 });
    const snapshot = await getAdminDb().collection("watchEarnVideos").doc(videoId).get();
    if (!snapshot.exists) return new NextResponse("Video not found", { status: 404 });
    const data = snapshot.data();
    if (data?.status !== "approved" || data?.active !== true || data?.videoAccess === "paid" || typeof data?.driveFileId !== "string" || !data.driveFileId.trim()) {
      return new NextResponse("Thumbnail unavailable", { status: 404 });
    }
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID?.trim();
    if (!folderId) return new NextResponse("Server configuration error", { status: 500 });
    const metadata = await getDriveFileMetadata(data.driveFileId.trim());
    if (!metadata.parents.includes(folderId)) return new NextResponse("Thumbnail access denied", { status: 403 });
    if (!metadata.mimeType.startsWith("video/") || !metadata.thumbnailLink) return new NextResponse("Drive thumbnail not available", { status: 404 });
    const image = await fetchBoundedDriveImage(metadata.thumbnailLink);
    if (!image) return new NextResponse("Drive thumbnail unavailable", { status: 502 });
    const imageBody = new ArrayBuffer(image.bytes.byteLength);
    new Uint8Array(imageBody).set(image.bytes);
    return new NextResponse(imageBody, { status: 200, headers: { "Content-Type": image.contentType, "Content-Length": String(image.bytes.byteLength), "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } });
  } catch (error) {
    console.error("Drive thumbnail request failed:", error);
    return new NextResponse("Thumbnail unavailable", { status: 500 });
  }
}
