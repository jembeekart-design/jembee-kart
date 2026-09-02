import { auth } from "@/firebase/config";
import { uploadVideoToDrive } from "./uploadVideoToDrive";

export interface ModerationSubmissionMetadata {
  displayName?: string;
  photoURL?: string;
  username: string;
  caption: string;
  hashtags: string[];
  music: string;
  sponsor: boolean;
  originalVideoId?: string;
  originalAudioId?: string;
  isEnhanced: boolean;
}

export interface ModerationSubmissionResult {
  success: boolean;
  submissionId?: string;
  driveFileId?: string;
  message?: string;
}

export async function submitVideoForModeration(
  file: File,
  metadata: ModerationSubmissionMetadata,
  onProgress?: (uploadedBytes: number, totalBytes: number) => void
): Promise<ModerationSubmissionResult> {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    return {
      success: false,
      message: "Please login first",
    };
  }

  if (!file) {
    return {
      success: false,
      message: "Video file is required",
    };
  }

  if (!file.type.startsWith("video/")) {
    return {
      success: false,
      message: "Only video files are allowed",
    };
  }

  if (file.size > 100 * 1024 * 1024) {
    return {
      success: false,
      message: "Video exceeds the 100MB limit",
    };
  }

  const token = await currentUser.getIdToken();

  // 1. Initialize Drive Upload
  const startResponse = await fetch("/api/creator/start-drive-upload", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      filename: file.name,
      mimeType: file.type,
      fileSize: file.size,
      ...metadata,
    }),
  });

  const startData = await startResponse.json();
  if (!startResponse.ok || !startData.success || !startData.submissionId || !startData.uploadUrl) {
    return {
      success: false,
      message: startData.message || "Failed to initialize upload",
    };
  }

  const { submissionId, uploadUrl } = startData;

  // 2. Direct-to-Drive Upload
  try {
    const driveFileId = await uploadVideoToDrive(file, uploadUrl, onProgress);

    // 3. Complete Submission
    const completeResponse = await fetch("/api/creator/complete-drive-upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        submissionId,
        driveFileId,
      }),
    });

    const completeData = await completeResponse.json().catch(() => null);

    if (!completeResponse.ok || !completeData || completeData.success !== true) {
      throw new Error(
        typeof completeData?.message === "string"
          ? completeData.message
          : "Failed to complete submission"
      );
    }

    return {
      success: true,
      submissionId,
      driveFileId,
    };
  } catch (error) {
    // Cleanup on failure
    await fetch("/api/creator/cancel-video-moderation", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ submissionId }),
    });

    return {
      success: false,
      message: error instanceof Error ? error.message : "Video submission failed",
    };
  }
}
