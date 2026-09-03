import { NextResponse } from "next/server";
import { Readable } from "node:stream";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";
import { getDriveFileMetadata, getDriveFileStream } from "@/services/googleDriveService";
import { generatePreviewToken, verifyPreviewToken } from "@/lib/previewToken";

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

/**
 * Strictly validate that a string contains only digits.
 */
function isStrictDigits(s: string): boolean {
  return s.length > 0 && /^\d+$/.test(s);
}

/**
 * Parse HTTP Range header with strict numeric validation.
 * Supports:
 *   bytes=0-499      (first 500 bytes, inclusive)
 *   bytes=500-       (from byte 500 to end)
 *   bytes=-500       (last 500 bytes suffix-range)
 *
 * Rejects:
 *   bytes=500abc-    (non-digit characters)
 *   bytes=abc-500    (non-digit characters)
 *   bytes=1-2-3      (multiple dashes)
 *   bytes=-           (no suffix length)
 *   bytes=-abc       (non-digit suffix)
 *   bytes=500-600,700-800  (multi-range)
 *
 * Returns { start, end } or null if invalid.
 */
function parseRange(rangeHeader: string, fileSize: number): { start: number; end: number } | null {
  const trimmed = rangeHeader.trim();

  if (!trimmed.startsWith("bytes=")) {
    return null;
  }

  const rangeSpec = trimmed.slice("bytes=".length);

  // Reject multi-range requests (contain comma)
  if (rangeSpec.includes(",")) {
    return null;
  }

  // Check for suffix-range (bytes=-N)
  if (rangeSpec.startsWith("-")) {
    const suffixStr = rangeSpec.slice(1);

    // Reject empty suffix or non-digits
    if (!isStrictDigits(suffixStr)) {
      return null;
    }

    const suffixLength = parseInt(suffixStr, 10);

    // Reject suffix length of 0 (unsatisfiable)
    if (suffixLength === 0) {
      return null;
    }

    // Last N bytes: start = max(0, fileSize - N), end = fileSize - 1
    const start = Math.max(0, fileSize - suffixLength);
    const end = fileSize - 1;

    // If start > end, unsatisfiable
    if (start > end) {
      return null;
    }

    return { start, end };
  }

  // Split on the first dash only
  const dashIndex = rangeSpec.indexOf("-");
  if (dashIndex === -1) {
    return null; // No dash found
  }

  const startStr = rangeSpec.slice(0, dashIndex);
  const endStr = rangeSpec.slice(dashIndex + 1);

  // bytes=N- (open-ended range)
  if (startStr && !endStr) {
    // Validate strict digits
    if (!isStrictDigits(startStr)) {
      return null;
    }

    const start = parseInt(startStr, 10);

    // fileSize must be > 0
    if (fileSize <= 0) {
      return null;
    }

    const end = fileSize - 1;

    if (start > end) {
      return null; // Unsatisfiable
    }

    return { start, end };
  }

  // bytes=N-M (closed range)
  if (startStr && endStr) {
    // Validate strict digits
    if (!isStrictDigits(startStr) || !isStrictDigits(endStr)) {
      return null;
    }

    const start = parseInt(startStr, 10);
    const end = parseInt(endStr, 10);

    if (start > end) {
      return null;
    }

    // fileSize must be > 0
    if (fileSize <= 0) {
      return null;
    }

    // Clamp end to fileSize - 1
    const clampedEnd = Math.min(end, fileSize - 1);

    if (start > clampedEnd) {
      return null; // Unsatisfiable
    }

    return { start, end: clampedEnd };
  }

  return null;
}

/**
 * POST /api/admin/moderation-video
 * Generate a short-lived preview token for a video.
 * Request body: { driveFileId: string }
 * Response: { token: string }
 */
export async function POST(req: Request) {
  try {
    // Verify GOOGLE_DRIVE_FOLDER_ID is mandatory
    const moderationFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID?.trim();
    if (!moderationFolderId) {
      console.error("GOOGLE_DRIVE_FOLDER_ID is not configured");
      return new NextResponse(JSON.stringify({ error: "Server configuration error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const uid = await verifyAdmin(req);

    const body = await req.json();
    const { driveFileId } = body;

    if (!driveFileId || typeof driveFileId !== "string") {
      return new NextResponse(JSON.stringify({ error: "Missing or invalid driveFileId" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate the file exists, is a video, and is in the moderation folder
    const metadata = await getDriveFileMetadata(driveFileId);

    if (!metadata.mimeType.startsWith("video/")) {
      return new NextResponse(JSON.stringify({ error: "Invalid file type" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!metadata.parents.includes(moderationFolderId)) {
      return new NextResponse(JSON.stringify({ error: "Access denied" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Generate and return token
    const previewToken = generatePreviewToken(uid, driveFileId);

    return new NextResponse(JSON.stringify({ token: previewToken }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Preview token generation error:", error);
    if (error instanceof Error) {
      if (error.message === "UNAUTHORIZED") {
        return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }
      if (error.message === "FORBIDDEN") {
        return new NextResponse(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      }
    }
    return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function GET(req: Request) {
  try {
    // Verify GOOGLE_DRIVE_FOLDER_ID is mandatory
    const moderationFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID?.trim();
    if (!moderationFolderId) {
      console.error("GOOGLE_DRIVE_FOLDER_ID is not configured");
      return new NextResponse("Server configuration error", { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return new NextResponse("Missing preview token", { status: 400 });
    }

    // Verify and decode token
    let payload;
    try {
      payload = verifyPreviewToken(token);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Invalid token";
      console.warn("Token verification failed:", message);
      return new NextResponse("Invalid or expired token", { status: 401 });
    }

    const { driveFileId } = payload;

    // Re-validate the file exists, is a video, and is in the moderation folder
    const metadata = await getDriveFileMetadata(driveFileId);

    if (!metadata.mimeType.startsWith("video/")) {
      return new NextResponse("Invalid file type", { status: 400 });
    }

    if (!metadata.parents.includes(moderationFolderId)) {
      return new NextResponse("Access denied", { status: 403 });
    }

    const fileSize = metadata.size;

    // Handle invalid file sizes
    if (fileSize <= 0) {
      return new NextResponse("Invalid file size", { status: 400 });
    }

    const rangeHeader = req.headers.get("range");

    // If no Range header, return full file
    if (!rangeHeader) {
      const { stream, mimeType } = await getDriveFileStream(driveFileId);

      const headers = new Headers();
      headers.set("Content-Type", mimeType);
      headers.set("Accept-Ranges", "bytes");
      headers.set("Content-Length", fileSize.toString());
      headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
      headers.set("Pragma", "no-cache");
      headers.set("Expires", "0");

      return new NextResponse(stream as Readable, {
        status: 200,
        headers,
      });
    }

    // Parse and validate Range header
    const range = parseRange(rangeHeader, fileSize);
    if (!range) {
      // Unsatisfiable range
      return new NextResponse("Range Not Satisfiable", {
        status: 416,
        headers: {
          "Content-Range": `bytes */${fileSize}`,
          "Content-Type": "text/plain",
        },
      });
    }

    const { start, end } = range;
    const chunkSize = end - start + 1;

    // Forward validated range to Google Drive
    const rangeToGoogle = `bytes=${start}-${end}`;
    const { stream, mimeType } = await getDriveFileStream(driveFileId, rangeToGoogle);

    const headers = new Headers();
    headers.set("Content-Type", mimeType);
    headers.set("Accept-Ranges", "bytes");
    headers.set("Content-Range", `bytes ${start}-${end}/${fileSize}`);
    headers.set("Content-Length", chunkSize.toString());
    headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
    headers.set("Pragma", "no-cache");
    headers.set("Expires", "0");

    return new NextResponse(stream as Readable, {
      status: 206,
      headers,
    });
  } catch (error) {
    console.error("Moderation video preview error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
