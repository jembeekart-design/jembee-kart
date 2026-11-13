import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";
import { createResumableUploadSession } from "@/services/googleDriveService";
import { classifyGoogleDriveError, googleDriveClientMessage, googleDriveErrorHttpStatus } from "@/lib/googleDriveErrors";
import { validateVideoUpload } from "@/schemas/media/videoUpload";
import { validateUploadMetadata } from "@/modules/media/uploadMetadata";

export const runtime = "nodejs";


export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json(
      { success: false, message: "कृपया लॉगिन करें।" },
      { status: 401 }
    );
  }

  const token = authHeader.slice("Bearer ".length).trim();
  let creatorId: string;

  try {
    const decodedToken = await getAdminAuth().verifyIdToken(token, true);
    creatorId = decodedToken.uid;
  } catch (err) {
    console.error("Creator upload authentication failed");
    return NextResponse.json(
      { success: false, message: "कृपया लॉगिन करें।" },
      { status: 401 }
    );
  }

  let body: {
    filename?: unknown;
    mimeType?: unknown;
    fileSize?: unknown;
    displayName?: unknown;
    photoURL?: unknown;
    username?: unknown;
    caption?: unknown;
    videoAccess?: unknown;
    videoPrice?: unknown;
    videoFormat?: unknown;
    durationSeconds?: unknown;
    hashtags?: unknown;
    music?: unknown;
    sponsor?: unknown;
    originalVideoId?: unknown;
    originalAudioId?: unknown;
    isEnhanced?: unknown;
  };
  try {
    const contentLength = Number(req.headers.get("content-length") || 0);
    if (contentLength > 16 * 1024) {
      return NextResponse.json({ success: false, message: "अनुरोध की जानकारी बहुत बड़ी है।" }, { status: 413 });
    }
    const rawBody = await req.text();
    if (new TextEncoder().encode(rawBody).byteLength > 16 * 1024) {
      return NextResponse.json({ success: false, message: "अनुरोध की जानकारी बहुत बड़ी है।" }, { status: 413 });
    }
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json(
      { success: false, message: "अनुरोध की जानकारी सही नहीं है।" },
      { status: 400 }
    );
  }

  const upload = validateVideoUpload(body);
  if (!upload.ok) {
    const message = upload.reason === "invalid_mime"
      ? "कृपया मान्य वीडियो फ़ाइल चुनें।"
      : upload.reason === "too_large"
        ? "वीडियो का आकार 500 MB से अधिक नहीं होना चाहिए।"
        : "कुछ आवश्यक जानकारी उपलब्ध नहीं है। कृपया विवरण जाँचें।";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
  const { filename, mimeType, fileSize } = upload;
  const metadata = validateUploadMetadata(body);
  if (!metadata) {
    return NextResponse.json({ success: false, message: "वीडियो का विवरण मान्य नहीं है। कृपया caption, hashtags और अन्य जानकारी जाँचें।" }, { status: 400 });
  }
  const { displayName, photoURL, username, caption, hashtags, music, sponsor, originalVideoId, originalAudioId, isEnhanced } = metadata;
  const videoAccess = body.videoAccess === "paid" ? "paid" : "free";
  if (videoAccess === "paid") {
    return NextResponse.json({ success: false, message: "Paid video publishing is temporarily disabled until verified purchase access is available." }, { status: 409 });
  }
  const { videoFormat, durationSeconds } = metadata;


  const submissionId = crypto.randomUUID();

  try {
    const adminDb = getAdminDb();
    const activeSessions = await adminDb.collection("videoModerationSubmissions")
      .where("creatorId", "==", creatorId)
      .where("status", "in", ["uploading", "completing"])
      .limit(3).get();
    if (activeSessions.size >= 2) {
      return NextResponse.json({ success: false, message: "एक समय में अधिकतम 2 वीडियो upload session ही सक्रिय रख सकते हैं।" }, { status: 429 });
    }
    const cooldownRef = adminDb.collection("creatorUploadRateLimits").doc(creatorId);
    const allowed = await adminDb.runTransaction(async (tx) => {
      const snap = await tx.get(cooldownRef);
      const last = Number(snap.data()?.lastStartedAtMs || 0);
      if (Date.now() - last < 30000) return false;
      tx.set(cooldownRef, { lastStartedAtMs: Date.now(), updatedAt: new Date() }, { merge: true });
      return true;
    });
    if (!allowed) return NextResponse.json({ success: false, message: "कृपया नया upload शुरू करने से पहले 30 सेकंड प्रतीक्षा करें।" }, { status: 429 });

    const uploadUrl = await createResumableUploadSession(
      `moderation_${submissionId}`,
      mimeType,
      fileSize
    );

    console.log("[UPLOAD_DEBUG_SERVER] DRIVE_SESSION_CREATED", {
      submissionId,
      uploadUrlPresent: !!uploadUrl,
    });

    await adminDb
      .collection("videoModerationSubmissions")
      .doc(submissionId)
      .set({
        submissionId,
        creatorId,
        driveFileId: "",
        uploadUrl,
        fileSize,
        status: "uploading",
        displayName: displayName || "",
        photoURL: photoURL || "",
        username: username || "",
        caption: caption || "",
        videoAccess,
        videoPrice: 0,
        videoFormat,
        durationSeconds,
        paidVideoStatus: "free",
        hashtags: Array.isArray(hashtags) ? hashtags : [],
        music: music || "",
        sponsor: sponsor === true,
        originalVideoId: originalVideoId || "",
        originalAudioId: originalAudioId || "",
        isEnhanced: isEnhanced === true,
        createdAt: new Date(),
      });

    return NextResponse.json({
      success: true,
      submissionId,
      uploadUrl,
    });
  } catch (error) {
    const code = classifyGoogleDriveError(error);
    console.error("Drive upload session creation failed:", code);
    return NextResponse.json(
      { success: false, code, message: googleDriveClientMessage(code) },
      { status: googleDriveErrorHttpStatus(code) }
    );
  }
}
