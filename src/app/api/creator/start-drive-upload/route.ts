import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";
import { createResumableUploadSession } from "@/services/googleDriveService";

export const runtime = "nodejs";

const MAX_VIDEO_SIZE = 100 * 1024 * 1024;

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");

  console.log("[AuthDiagnostic] Start Upload - Auth Header:", authHeader ? "Present" : "Missing");
  if (authHeader) {
      console.log("[AuthDiagnostic] Start Upload - Bearer Prefix:", authHeader.startsWith("Bearer ") ? "Present" : "Missing");
  }

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
    console.log("[AuthDiagnostic] Start Upload - Token Verified. UID:", creatorId);
  } catch (err) {
    console.error("[AuthDiagnostic] Start Upload - Token Verification Failed:", err);
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
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
    hashtags?: unknown;
    music?: unknown;
    sponsor?: unknown;
    originalVideoId?: unknown;
    originalAudioId?: unknown;
    isEnhanced?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid JSON" },
      { status: 400 }
    );
  }

  const filename = typeof body.filename === "string" ? body.filename.trim() : "";
  const mimeType = typeof body.mimeType === "string" ? body.mimeType.trim() : "";
  const fileSize = typeof body.fileSize === "number" ? body.fileSize : 0;

  const { displayName, photoURL, username, caption, hashtags, music, sponsor, originalVideoId, originalAudioId, isEnhanced } = body;

  if (!filename || !mimeType || !Number.isFinite(fileSize) || fileSize <= 0) {
    return NextResponse.json(
      { success: false, message: "Missing or invalid required fields" },
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
    console.log("[UPLOAD_DEBUG_SERVER] START_BEGIN", {
      creatorId,
      filename,
      mimeType,
      fileSize,
      submissionId,
    });

    const uploadUrl = await createResumableUploadSession(
      `moderation_${submissionId}`,
      mimeType,
      fileSize
    );

    console.log("[UPLOAD_DEBUG_SERVER] DRIVE_SESSION_CREATED", {
      submissionId,
      uploadUrlPresent: !!uploadUrl,
    });

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
    console.error("[UPLOAD_DEBUG_SERVER] START_ERROR", {
      name: error instanceof Error ? error.name : typeof error,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      creatorId,
      submissionId,
    });

    console.error("Failed to start drive upload session:", error);
    return NextResponse.json(
      { success: false, message: "Failed to initialize upload" },
      { status: 500 }
    );
  }
}
