import { readBoundedJson } from "@/lib/server/readBoundedJson";
import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";
import { createResumableUploadSession } from "@/services/googleDriveService";

export const runtime = "nodejs";

const MAX_VIDEO_SIZE = 500 * 1024 * 1024;

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader) {
  }

  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json(
      { success: false, message: "कृपया लॉगिन करें।" },
      { status: 401 }
    );
  }

  const token = authHeader.slice("Bearer ".length).trim();
  let creatorId: string;

  try {
    const decodedToken = await getAdminAuth().verifyIdToken(token);
    creatorId = decodedToken.uid;
  } catch (err) {
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
    hashtags?: unknown;
    music?: unknown;
    sponsor?: unknown;
    originalVideoId?: unknown;
    originalAudioId?: unknown;
    isEnhanced?: unknown;
  };
  const parsedBody = await readBoundedJson(req, 16384);
  if (!parsedBody.ok) {
    return NextResponse.json({ success: false, message: parsedBody.message }, { status: parsedBody.status });
  }
  if (!parsedBody.value || typeof parsedBody.value !== "object" || Array.isArray(parsedBody.value)) {
    return NextResponse.json({ success: false, message: "Request body must be a JSON object" }, { status: 400 });
  }
  body = parsedBody.value as typeof body;

  const filename = typeof body.filename === "string" ? body.filename.trim() : "";
  const mimeType = typeof body.mimeType === "string" ? body.mimeType.trim() : "";
  const fileSize = typeof body.fileSize === "number" ? body.fileSize : 0;

  const { displayName, photoURL, username, caption, hashtags, music, sponsor, originalVideoId, originalAudioId, isEnhanced } = body;
  const videoAccess = body.videoAccess === "paid" ? "paid" : "free";
  const videoPrice = typeof body.videoPrice === "number" ? body.videoPrice : 0;
  if (videoAccess === "paid" && (!Number.isFinite(videoPrice) || videoPrice < 1 || videoPrice > 100000)) {
    return NextResponse.json({ success: false, message: "Paid वीडियो की कीमत ₹1 से ₹100000 के बीच होनी चाहिए।" }, { status: 400 });
  }

  if (!filename || !mimeType || !Number.isFinite(fileSize) || fileSize <= 0) {
    return NextResponse.json(
      { success: false, message: "कुछ आवश्यक जानकारी उपलब्ध नहीं है। कृपया विवरण जाँचें।" },
      { status: 400 }
    );
  }

  if (!mimeType.toLowerCase().startsWith("video/")) {
    return NextResponse.json(
      { success: false, message: "कृपया मान्य वीडियो फ़ाइल चुनें।" },
      { status: 400 }
    );
  }

  if (fileSize > MAX_VIDEO_SIZE) {
    return NextResponse.json(
      { success: false, message: "वीडियो का आकार 500 MB से अधिक नहीं होना चाहिए।" },
      { status: 400 }
    );
  }

  const submissionId = crypto.randomUUID();

  try {

    const uploadUrl = await createResumableUploadSession(
      `moderation_${submissionId}`,
      mimeType,
      fileSize
    );

    const adminDb = getAdminDb();
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
        videoPrice: videoAccess === "paid" ? videoPrice : 0,
        paidVideoStatus: videoAccess === "paid" ? "payment_integration_pending" : "free",
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

    console.error("Failed to start drive upload session:", error);
    return NextResponse.json(
      { success: false, message: "वीडियो अपलोड शुरू नहीं हो सका। कृपया पुनः प्रयास करें।" },
      { status: 500 }
    );
  }
}
