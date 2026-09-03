import { NextResponse } from "next/server";
import { Readable } from "node:stream";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";
import { getDriveFileMetadata, getDriveFileStream } from "@/services/googleDriveService";

export const runtime = "nodejs";

async function verifyAdmin(req: Request) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("UNAUTHORIZED");
  }

  const token = authHeader.slice("Bearer ".length).trim();
  const decodedToken = await getAdminAuth().verifyIdToken(token);

  const snapshot = await getAdminDb()
    .collection("users")
    .where("uid", "==", decodedToken.uid)
    .limit(1)
    .get();

  const userDoc = snapshot.docs[0];

  if (!userDoc || (userDoc.data()?.role !== "admin" && userDoc.data()?.role !== "super_admin")) {
    throw new Error("FORBIDDEN");
  }

  return decodedToken.uid;
}

export async function GET(req: Request) {
  try {
    await verifyAdmin(req);

    const { searchParams } = new URL(req.url);
    const driveFileId = searchParams.get("id");

    if (!driveFileId) {
      return new NextResponse("Missing file ID", { status: 400 });
    }

    const moderationFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID?.trim();
    const metadata = await getDriveFileMetadata(driveFileId);

    if (!metadata.mimeType.startsWith("video/")) {
      return new NextResponse("Invalid file type", { status: 400 });
    }
    if (moderationFolderId && !metadata.parents.includes(moderationFolderId)) {
      return new NextResponse("Access denied", { status: 403 });
    }

    const range = req.headers.get("range") || undefined;
    const { stream, mimeType, size } = await getDriveFileStream(driveFileId, range);

    const headers = new Headers();
    headers.set("Content-Type", mimeType);
    headers.set("Accept-Ranges", "bytes");

    if (range) {
      // Basic range parsing to set correct headers
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : size - 1;
      const chunksize = (end - start) + 1;

      headers.set("Content-Range", `bytes ${start}-${end}/${size}`);
      headers.set("Content-Length", chunksize.toString());
      
      return new NextResponse(stream as Readable, {
        status: 206,
        headers,
      });
    }

    headers.set("Content-Length", size.toString());
    return new NextResponse(stream as Readable, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Moderation video preview error:", error);
    if (error instanceof Error) {
      if (error.message === "UNAUTHORIZED") return new NextResponse("Unauthorized", { status: 401 });
      if (error.message === "FORBIDDEN") return new NextResponse("Forbidden", { status: 403 });
    }
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
