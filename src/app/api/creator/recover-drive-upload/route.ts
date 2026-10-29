import { readBoundedJson } from "@/lib/server/readBoundedJson";
import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";
import { getResumableUploadStatus } from "@/services/googleDriveService";

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
    const decodedToken = await getAdminAuth().verifyIdToken(token);
    creatorId = decodedToken.uid;
  } catch {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }


  const parsedBody = await readBoundedJson(req, 8192);
  if (!parsedBody.ok) {
    return NextResponse.json({ success: false, message: parsedBody.message }, { status: parsedBody.status });
  }
  if (!parsedBody.value || typeof parsedBody.value !== "object" || Array.isArray(parsedBody.value)) {
    return NextResponse.json({ success: false, message: "Request body must be a JSON object" }, { status: 400 });
  }
  const body = parsedBody.value as { submissionId?: unknown };

  const submissionId =
    typeof body.submissionId === "string"
      ? body.submissionId.trim()
      : "";

  if (!submissionId) {
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

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to recover Drive upload",
      },
      { status: 500 }
    );
  }
}
