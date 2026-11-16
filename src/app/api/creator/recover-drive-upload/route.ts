import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";
import { getResumableUploadStatus } from "@/services/googleDriveService";
import { readBoundedJson } from "@/lib/server/readBoundedJson";
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
  if (!token || token.length > 10_000) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

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

  const parsed = await readBoundedJson(req, 4 * 1024);
  if (!parsed.ok) {
    return NextResponse.json({ success: false, message: parsed.message }, { status: parsed.status });
  }
  const body = parsed.value as { submissionId?: unknown };

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

    console.log("[UPLOAD_DEBUG_SERVER] RECOVERY_BEGIN", {
      submissionId,
      creatorId,
      fileSize,
    });

    const status = await getResumableUploadStatus(
      uploadUrl,
      fileSize
    );

    console.log("[UPLOAD_DEBUG_SERVER] RECOVERY_RESULT", {
      submissionId,
      uploadedBytes: status.uploadedBytes,
      completed: !!status.driveFileId,
    });

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
