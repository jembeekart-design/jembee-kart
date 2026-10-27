import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";
import { getDriveFileMetadata } from "@/services/googleDriveService";

export const runtime = "nodejs";

const MAX_VIDEO_SIZE = 500 * 1024 * 1024;

export async function POST(req: Request) {
  const moderationFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID?.trim();
  if (!moderationFolderId) {
    return NextResponse.json(
      { success: false, message: "वीडियो अपलोड सेवा अभी उपलब्ध नहीं है। कृपया बाद में पुनः प्रयास करें।" },
      { status: 500 }
    );
  }

  const authHeader = req.headers.get("authorization");
  
  console.log("[AuthDiagnostic] Complete Upload - Auth Header:", authHeader ? "Present" : "Missing");
  if (authHeader) {
      console.log("[AuthDiagnostic] Complete Upload - Bearer Prefix:", authHeader.startsWith("Bearer ") ? "Present" : "Missing");
  }

  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ success: false, message: "कृपया लॉगिन करें।" }, { status: 401 });
  }

  const token = authHeader.slice("Bearer ".length).trim();
  let creatorId: string;
  try {
    const decodedToken = await getAdminAuth().verifyIdToken(token);
    creatorId = decodedToken.uid;
    console.log("[AuthDiagnostic] Complete Upload - Token Verified. UID:", creatorId);
  } catch (err) {
    console.error("[AuthDiagnostic] Complete Upload - Token Verification Failed:", err);
    return NextResponse.json({ success: false, message: "कृपया लॉगिन करें।" }, { status: 401 });
  }

  let body: {
    submissionId?: unknown;
    driveFileId?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, message: "अनुरोध की जानकारी सही नहीं है।" }, { status: 400 });
  }

  const submissionId =
    typeof body.submissionId === "string" ? body.submissionId.trim() : "";
  const driveFileId =
    typeof body.driveFileId === "string" ? body.driveFileId.trim() : "";

  if (!submissionId || !driveFileId) {
    return NextResponse.json(
      { success: false, message: "कुछ आवश्यक जानकारी उपलब्ध नहीं है। कृपया विवरण जाँचें।" },
      { status: 400 }
    );
  }

  try {
    console.log("[UPLOAD_DEBUG_SERVER] COMPLETE_BEGIN", {
      creatorId,
      submissionId,
      driveFileId,
    });

    const adminDb = getAdminDb();
    const submissionRef = adminDb.collection("videoModerationSubmissions").doc(submissionId);
    const submissionDoc = await submissionRef.get();

    if (!submissionDoc.exists) {
      return NextResponse.json({ success: false, message: "वीडियो अपलोड का रिकॉर्ड नहीं मिला। कृपया पुनः प्रयास करें।" }, { status: 404 });
    }

    const submission = submissionDoc.data()!;
    if (submission.creatorId !== creatorId) {
      return NextResponse.json({ success: false, message: "कृपया लॉगिन करें।" }, { status: 403 });
    }

    // Make completion idempotent if Firestore was updated but the client lost
    // the HTTP response and retries the same completion request.
    if (
      submission.status === "pending" &&
      submission.driveFileId === driveFileId
    ) {
      return NextResponse.json({ success: true, submissionId, status: "pending" });
    }

    if (submission.status !== "uploading") {
      return NextResponse.json({ success: false, message: "वीडियो की स्थिति मान्य नहीं है।" }, { status: 409 });
    }

    console.log("[UPLOAD_DEBUG_SERVER] SUBMISSION_VERIFIED", {
      submissionId,
      creatorId,
      status: submission.status,
    });

    console.log("[UPLOAD_DEBUG_SERVER] DRIVE_METADATA_BEGIN", {
      driveFileId,
    });

    // Verify Drive File
    const metadata = await getDriveFileMetadata(driveFileId);

    console.log("[UPLOAD_DEBUG_SERVER] DRIVE_METADATA_RESULT", metadata);

    if (!metadata.mimeType.startsWith("video/")) {
      return NextResponse.json({ success: false, message: "कृपया मान्य वीडियो फ़ाइल चुनें।" }, { status: 400 });
    }
    if (metadata.size > MAX_VIDEO_SIZE) {
      return NextResponse.json({ success: false, message: "फ़ाइल का आकार 500 MB से अधिक नहीं होना चाहिए।" }, { status: 400 });
    }
    if (!metadata.parents.includes(moderationFolderId)) {
      return NextResponse.json({ success: false, message: "वीडियो फ़ाइल की जानकारी सत्यापित नहीं हो सकी।" }, { status: 403 });
    }
    if (metadata.name !== `moderation_${submissionId}`) {
      return NextResponse.json({ success: false, message: "वीडियो फ़ाइल का नाम मान्य नहीं है।" }, { status: 400 });
    }

    await submissionRef.update({
      driveFileId: driveFileId,
      status: "pending",
    });

    return NextResponse.json({ success: true, submissionId, status: "pending" });
  } catch (error) {
    console.error("[UPLOAD_DEBUG_SERVER] COMPLETE_ERROR", {
      name: error instanceof Error ? error.name : typeof error,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      submissionId,
      driveFileId,
    });

    console.error("Failed to complete drive upload:", error);
    return NextResponse.json({ success: false, message: "वीडियो अपलोड पूरा नहीं हो सका। कृपया पुनः प्रयास करें।" }, { status: 500 });
  }
}
