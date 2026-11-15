import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";
import { getResumableUploadStatus } from "@/services/googleDriveService";
import { classifyGoogleDriveError, googleDriveClientMessage, googleDriveErrorHttpStatus } from "@/lib/googleDriveErrors";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const token = authHeader.slice("Bearer ".length).trim();

  let creatorId: string;

  try {
    const decodedToken = await getAdminAuth().verifyIdToken(token, true);
    creatorId = decodedToken.uid;
  } catch {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  let body: { submissionId?: unknown };

  try {
    const contentLength = Number(req.headers.get("content-length") || 0);
    if (contentLength > 4 * 1024) {
      return NextResponse.json({ success: false, message: "Request body is too large" }, { status: 413 });
    }
    const rawBody = await req.text();
    if (new TextEncoder().encode(rawBody).byteLength > 4 * 1024) {
      return NextResponse.json({ success: false, message: "Request body is too large" }, { status: 413 });
    }
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid JSON" },
      { status: 400 }
    );
  }

  const submissionId =
    typeof body.submissionId === "string"
      ? body.submissionId.trim()
      : "";

  if (!/^[A-Za-z0-9_-]{3,128}$/.test(submissionId)) {
    return NextResponse.json(
      { success: false, message: "Submission ID is required" },
      { status: 400 }
    );
  }

  try {
    const adminDb = getAdminDb();
    const submissionRef = adminDb
      .collection("videoModerationSubmissions")
      .doc(submissionId);

    const submissionDoc = await submissionRef.get();

    if (!submissionDoc.exists) {
      return NextResponse.json(
        { success: false, message: "Submission not found" },
        { status: 404 }
      );
    }

    const submission = submissionDoc.data()!;

    if (submission.creatorId !== creatorId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    // If completion was committed but its response was lost, report the
    // persisted completed submission so the client can safely retry completion.
    if (
      submission.status === "pending" &&
      typeof submission.driveFileId === "string" &&
      submission.driveFileId.trim()
    ) {
      const completedFileSize =
        typeof submission.fileSize === "number" &&
        Number.isFinite(submission.fileSize) &&
        submission.fileSize > 0
          ? submission.fileSize
          : 0;
      return NextResponse.json({
        success: true,
        submissionId,
        uploadedBytes: completedFileSize,
        driveFileId: submission.driveFileId.trim(),
        completed: true,
      });
    }

    if (submission.status !== "uploading") {
      return NextResponse.json(
        { success: false, message: "Invalid upload status" },
        { status: 409 }
      );
    }

    const uploadUrl =
      typeof submission.uploadUrl === "string"
        ? submission.uploadUrl.trim()
        : "";

    const fileSize =
      typeof submission.fileSize === "number"
        ? submission.fileSize
        : 0;

    if (!uploadUrl || !Number.isFinite(fileSize) || fileSize <= 0) {
      return NextResponse.json(
        { success: false, message: "Upload session data is missing" },
        { status: 400 }
      );
    }

    const status = await getResumableUploadStatus(
      uploadUrl,
      fileSize
    );

    return NextResponse.json({
      success: true,
      submissionId,
      uploadedBytes: status.uploadedBytes,
      driveFileId: status.driveFileId || null,
      completed: !!status.driveFileId,
    });
  } catch (error) {
    const code = classifyGoogleDriveError(error);
    console.error("Drive upload recovery failed:", code);
    return NextResponse.json(
      { success: false, code, message: googleDriveClientMessage(code) },
      { status: googleDriveErrorHttpStatus(code) }
    );
  }
}
