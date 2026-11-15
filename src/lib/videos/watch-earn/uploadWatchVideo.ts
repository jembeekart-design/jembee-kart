import { auth } from "@/firebase/config";
import { onAuthStateChanged, type User } from "firebase/auth";
import { submitVideoForModeration } from "./submitVideoForModeration";
import type { UploadControl } from "./uploadVideoToDrive";

interface UploadWatchVideoData {
  file: File;
  creatorId?: string;
  displayName?: string;
  photoURL?: string;
  username: string;
  caption: string;
  videoAccess?: "free" | "paid";
  videoPrice?: number;
  videoFormat?: "short" | "long";
  durationSeconds?: number;
  categoryId?: string;
  categoryName?: string;
  categoryTopic?: string;
  schoolBoardId?: string;
  schoolId?: string;
  schoolClassId?: string;
  schoolSubjectId?: string;
  schoolBookId?: string;
  schoolChapterId?: string;
  schoolQuestionId?: string;
  hashtags: string[];
  music: string;
  sponsor?: boolean;
  originalVideoId?: string;
  originalAudioId?: string;
  isEnhanced?: boolean;
  onProgress?: (uploadedBytes: number, totalBytes: number) => void;
  control?: UploadControl;
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
  videoAccess?: "free" | "paid";
  videoPrice?: number;
  videoFormat?: "short" | "long";
  durationSeconds?: number;
  categoryId?: string;
  categoryName?: string;
  categoryTopic?: string;
  schoolBoardId?: string;
  schoolId?: string;
  schoolClassId?: string;
  schoolSubjectId?: string;
  schoolBookId?: string;
  schoolChapterId?: string;
  schoolQuestionId?: string;
}

export async function uploadWatchVideo({
  file,
  displayName,
  photoURL,
  username,
  caption,
  videoAccess = "free",
  videoPrice = 0,
  videoFormat = "short",
  durationSeconds,
  categoryId,
  categoryName,
  categoryTopic,
  schoolBoardId,
  schoolId,
  schoolClassId,
  schoolSubjectId,
  schoolBookId,
  schoolChapterId,
  schoolQuestionId,
  hashtags,
  music,
  sponsor,
  originalVideoId,
  originalAudioId,
  isEnhanced,
  onProgress,
  control,
}: UploadWatchVideoData) {
  try {
    // ==================================================
    // AUTHENTICATION
    // ==================================================

    const currentUser = await new Promise<User | null>((resolve) => {
      if (auth.currentUser) {
        resolve(auth.currentUser);
        return;
      }

      let settled = false;

      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (settled) return;
        settled = true;
        unsubscribe();
        resolve(user);
      });

      setTimeout(() => {
        if (settled) return;
        settled = true;
        unsubscribe();
        resolve(auth.currentUser);
      }, 10000);
    });

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

    const maxSize = 500 * 1024 * 1024;

    if (file.size > maxSize) {
      return {
        success: false,
        message: "वीडियो का आकार 500 MB से अधिक नहीं होना चाहिए।",
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
      videoAccess,
      videoPrice: videoAccess === "paid" ? videoPrice : 0,
      videoFormat,
      durationSeconds,
      categoryId,
      categoryName,
      categoryTopic,
      schoolBoardId,
      schoolId,
      schoolClassId,
      schoolSubjectId,
      schoolBookId,
      schoolChapterId,
      schoolQuestionId,
      hashtags,
      music,
      sponsor: sponsor === true,
      originalVideoId,
      originalAudioId,
      isEnhanced: isEnhanced === true,
    };

    console.log("[UPLOAD_DEBUG] WATCH_BEFORE_SUBMIT", {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      creatorId: authenticatedUserId,
    });

    const result = await submitVideoForModeration(
      file,
      metadata,
      onProgress,
      control
    );

    console.log("[UPLOAD_DEBUG] WATCH_AFTER_SUBMIT", result);

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
    console.error("[UPLOAD_DEBUG] WATCH_ERROR", {
      name: error instanceof Error ? error.name : typeof error,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Video submission failed",
    };
  }
}
