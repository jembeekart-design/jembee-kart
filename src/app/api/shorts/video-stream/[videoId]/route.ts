import { NextResponse } from "next/server";
import { Readable } from "node:stream";
import { getAdminDb } from "@/firebase/admin";
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

    if (
      data?.status !== "approved" ||
      data?.active !== true ||
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
    const headers = new Headers({
      "Content-Type": metadata.mimeType,
      "Accept-Ranges": "bytes",
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    });

    if (!rangeHeader) {
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

    const { start, end } = range;
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
