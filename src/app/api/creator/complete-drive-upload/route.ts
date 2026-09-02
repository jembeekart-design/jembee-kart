import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";
import { getDriveFileMetadata } from "@/services/googleDriveService";

export const runtime = "nodejs";

const MAX_VIDEO_SIZE = 100 * 1024 * 1024;

export async function POST(req: Request) {
  const moderationFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID?.trim();
  if (!moderationFolderId) {
    return NextResponse.json(
      { success: false, message: "Google Drive moderation folder is not configured" },
      { status: 500 }
    );
  }

  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.slice("Bearer ".length).trim();
  let creatorId: string;
  try {
    const decodedToken = await getAdminAuth().verifyIdToken(token);
    creatorId = decodedToken.uid;
  } catch {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON" }, { status: 400 });
  }

  const { submissionId, driveFileId } = body;
  if (!submissionId || !driveFileId) {
    return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
  }

  try {
    const adminDb = getAdminDb();
    const submissionRef = adminDb.collection("videoModerationSubmissions").doc(submissionId);
    const submissionDoc = await submissionRef.get();

    if (!submissionDoc.exists) {
      return NextResponse.json({ success: false, message: "Submission not found" }, { status: 404 });
    }

    const submission = submissionDoc.data()!;
    if (submission.creatorId !== creatorId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    if (submission.status !== "uploading") {
      return NextResponse.json({ success: false, message: "Invalid status" }, { status: 400 });
    }

    // Verify Drive File
    const metadata = await getDriveFileMetadata(driveFileId);

    if (!metadata.mimeType.startsWith("video/")) {
      return NextResponse.json({ success: false, message: "Invalid file type" }, { status: 400 });
    }
    if (metadata.size > MAX_VIDEO_SIZE) {
      return NextResponse.json({ success: false, message: "File exceeds 100MB" }, { status: 400 });
    }
    if (!metadata.parents.includes(moderationFolderId)) {
      return NextResponse.json({ success: false, message: "Invalid file location" }, { status: 403 });
    }
    if (metadata.name !== `moderation_${submissionId}`) {
      return NextResponse.json({ success: false, message: "Invalid file name" }, { status: 400 });
    }

    await submissionRef.update({
      driveFileId: driveFileId,
      status: "pending",
    });

    return NextResponse.json({ success: true, submissionId, status: "pending" });
  } catch (error) {
    console.error("Failed to complete drive upload:", error);
    return NextResponse.json({ success: false, message: "Failed to finalize upload" }, { status: 500 });
  }
}
