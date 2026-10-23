import { NextResponse } from "next/server";
import { getAdminDb } from "@/firebase/admin";
import { getDriveFileMetadata } from "@/services/googleDriveService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
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
      return new NextResponse("Thumbnail unavailable", { status: 404 });
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

    const thumbnailResponse = await fetch(metadata.thumbnailLink, {
      cache: "no-store",
      redirect: "follow",
    });

    if (!thumbnailResponse.ok || !thumbnailResponse.body) {
      return new NextResponse("Drive thumbnail unavailable", { status: 502 });
    }

    const contentType = thumbnailResponse.headers.get("content-type") || "";

    if (!contentType.startsWith("image/")) {
      return new NextResponse("Invalid thumbnail response", { status: 502 });
    }

    return new NextResponse(thumbnailResponse.body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Drive thumbnail request failed:", error);
    return new NextResponse("Thumbnail unavailable", { status: 500 });
  }
}
