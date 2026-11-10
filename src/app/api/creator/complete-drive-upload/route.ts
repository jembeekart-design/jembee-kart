import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";
import { getDriveFileMetadata } from "@/services/googleDriveService";
import { classifyGoogleDriveError, googleDriveClientMessage, googleDriveErrorHttpStatus } from "@/lib/googleDriveErrors";

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
  } catch {
    console.warn("Complete upload authentication failed: FIREBASE_ID_TOKEN_REJECTED");
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

    console.log("[UPLOAD_DEBUG_SERVER] DRIVE_METADATA_RESULT", {
      mimeType: metadata.mimeType,
      size: metadata.size,
      parentCount: metadata.parents.length,
      thumbnailAvailable: !!metadata.thumbnailLink,
    });

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

    // Claim only after Drive validation; cancellation and completion then race on one state transition.
    const claimed = await adminDb.runTransaction(async (tx) => {
      const current = await tx.get(submissionRef);
      if (!current.exists || current.data()?.creatorId !== creatorId || current.data()?.status !== "uploading") return false;
      tx.update(submissionRef, { status: "completing", completionStartedAt: new Date(), completionDriveFileId: driveFileId });
      return true;
    });
    if (!claimed) return NextResponse.json({ success: false, message: "वीडियो पहले से complete/cancel हो रहा है।" }, { status: 409 });

    await adminDb.runTransaction(async (tx) => {
      const current = await tx.get(submissionRef);
      if (!current.exists || current.data()?.status !== "completing" || current.data()?.completionDriveFileId !== driveFileId) throw new Error("Upload completion claim was lost");
      tx.update(submissionRef, { driveFileId, status: "pending", completedAt: new Date(), completionDriveFileId: null });
    });

    return NextResponse.json({ success: true, submissionId, status: "pending" });
  } catch (error) {
    const driveErrorCode = classifyGoogleDriveError(error);
    console.error("Drive upload completion failed:", driveErrorCode);
    if (submissionId) {
      const recoveryRef = getAdminDb().collection("videoModerationSubmissions").doc(submissionId);
      await getAdminDb().runTransaction(async (tx) => {
        const current = await tx.get(recoveryRef);
        if (current.exists && current.data()?.status === "completing") tx.update(recoveryRef, { status: "uploading", completionDriveFileId: null, completionLastErrorAt: new Date() });
      }).catch(() => undefined);
    }
    return NextResponse.json(
      { success: false, code: driveErrorCode, message: googleDriveClientMessage(driveErrorCode) },
      { status: googleDriveErrorHttpStatus(driveErrorCode) }
    );
  }
}
