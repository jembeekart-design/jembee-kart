import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";
import { createResumableUploadSession } from "@/services/googleDriveService";

export const runtime = "nodejs";

const MAX_VIDEO_SIZE = 100 * 1024 * 1024;

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

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid JSON" },
      { status: 400 }
    );
  }

  const { filename, mimeType, fileSize, displayName, photoURL, username, caption, hashtags, music, sponsor, originalVideoId, originalAudioId, isEnhanced } = body;

  if (!filename || !mimeType || !fileSize) {
    return NextResponse.json(
      { success: false, message: "Missing required fields" },
      { status: 400 }
    );
  }

  if (!mimeType.toLowerCase().startsWith("video/")) {
    return NextResponse.json(
      { success: false, message: "Only video MIME types are allowed" },
      { status: 400 }
    );
  }

  if (fileSize > MAX_VIDEO_SIZE) {
    return NextResponse.json(
      { success: false, message: "Video exceeds the 100MB limit" },
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
        status: "uploading",
        displayName: displayName || "",
        photoURL: photoURL || "",
        username: username || "",
        caption: caption || "",
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
      { success: false, message: "Failed to initialize upload" },
      { status: 500 }
    );
  }
}
