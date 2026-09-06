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

  let body: { submissionId?: unknown };

  try {
    body = await req.json();
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

    if (submission.status !== "uploading") {
      return NextResponse.json(
        { success: false, message: "Invalid upload status" },
        { status: 400 }
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
    console.error("[UPLOAD_DEBUG_SERVER] RECOVERY_ERROR", {
      name: error instanceof Error ? error.name : typeof error,
      message: error instanceof Error ? error.message : String(error),
      submissionId,
      creatorId,
    });

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
