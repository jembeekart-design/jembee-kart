import { getAuth } from "firebase/auth";
import { submitVideoForModeration } from "./submitVideoForModeration";

interface UploadWatchVideoData {
  file: File;
  creatorId?: string;
  displayName?: string;
  photoURL?: string;
  username: string;
  caption: string;
  hashtags: string[];
  music: string;
  sponsor?: boolean;
  originalVideoId?: string;
  originalAudioId?: string;
  isEnhanced?: boolean;
}

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

export async function uploadWatchVideo({
  file,
  displayName,
  photoURL,
  username,
  caption,
  hashtags,
  music,
  sponsor,
  originalVideoId,
  originalAudioId,
  isEnhanced,
}: UploadWatchVideoData) {
  try {
    // ==================================================
    // AUTHENTICATION
    // ==================================================

    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      return {
        success: false,
        message: "Please login first",
      };
    }

    const authenticatedUserId = currentUser.uid;

    if (!authenticatedUserId) {
      return {
        success: false,
        message: "User UID not found",
      };
    }

    // ==================================================
    // FILE CHECK
    // ==================================================

    if (!file) {
      return {
        success: false,
        message: "Video file required",
      };
    }

    if (!file.type.startsWith("video/")) {
      return {
        success: false,
        message: "Only video upload allowed",
      };
    }

    const maxSize = 100 * 1024 * 1024;

    if (file.size > maxSize) {
      return {
        success: false,
        message: "Video too large. Maximum size is 100MB",
      };
    }

    // ==================================================
    // DRIVE-FIRST MODERATION
    // ==================================================
    //
    // IMPORTANT:
    // DO NOT upload to Cloudinary here.
    //
    // The video goes to Google Drive moderation first.
    // Cloudinary upload will happen ONLY after admin approval.
    // ==================================================

    const metadata: ModerationSubmissionMetadata = {
      displayName,
      photoURL,
      username,
      caption,
      hashtags,
      music,
      sponsor: sponsor === true,
      originalVideoId,
      originalAudioId,
      isEnhanced: isEnhanced === true,
    };

    const result = await submitVideoForModeration(
      file,
      metadata
    );

    if (!result.success) {
      return {
        success: false,
        message:
          result.message ||
          "Video moderation submission failed",
      };
    }

    console.log(
      "VIDEO SENT TO DRIVE MODERATION:",
      result.submissionId
    );

    return {
      success: true,
      moderationPending: true,
      submissionId: result.submissionId,
      message:
        "Video submitted for moderation. It will be published after approval.",
    };
  } catch (error) {
    console.error(
      "WATCH VIDEO MODERATION SUBMISSION ERROR:",
      error
    );

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Video submission failed",
    };
  }
}
