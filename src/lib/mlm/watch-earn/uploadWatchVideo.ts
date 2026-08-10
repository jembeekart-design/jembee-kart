import {
  addDoc,
  collection,
} from "firebase/firestore";

import {
  getAuth,
} from "firebase/auth";

import {
  db,
} from "@/firebase/config";

interface UploadWatchVideoData {
  file: File;

  /**
   * Kept for backward compatibility.
   *
   * IMPORTANT:
   * We will NOT trust this value for ownership.
   * Firebase Authentication UID will be used instead.
   */
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
}

export async function uploadWatchVideo({
  file,
  creatorId,
  displayName,
  photoURL,
  username,
  caption,
  hashtags,
  music,
  sponsor,
  originalVideoId,
  originalAudioId,
}: UploadWatchVideoData) {
  try {
    // ==================================================
    // AUTHENTICATION
    // ==================================================

    const auth = getAuth();

    const currentUser = auth.currentUser;

    console.log(
      "WATCH VIDEO AUTH USER:",
      currentUser
        ? {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
          }
        : null
    );

    /**
     * NEVER trust creatorId coming from the UI.
     *
     * Firebase Auth UID is the source of truth.
     */
    if (!currentUser) {
      console.error(
        "WATCH VIDEO UPLOAD: USER NOT LOGGED IN"
      );

      return {
        success: false,
        message: "Please login first",
      };
    }

    /**
     * Actual Firebase Authentication UID.
     */
    const authenticatedUserId =
      currentUser.uid;

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

    // ==================================================
    // VIDEO TYPE CHECK
    // ==================================================

    if (
      !file.type.startsWith("video/")
    ) {
      return {
        success: false,
        message:
          "Only video upload allowed",
      };
    }

    // ==================================================
    // FILE SIZE CHECK
    // MAX 100MB
    // ==================================================

    const maxSize =
      100 * 1024 * 1024;

    if (file.size > maxSize) {
      return {
        success: false,
        message: "Video too large",
      };
    }

    // ==================================================
    // AUTO REWARD
    // ==================================================

    const rewardCoins =
      sponsor ? 25 : 5;

    // ==================================================
    // FORM DATA
    // ==================================================

    const formData =
      new FormData();

    formData.append(
      "file",
      file
    );

    formData.append(
      "upload_preset",
      "jembeekart"
    );

    // ==================================================
    // CLOUDINARY UPLOAD
    // ==================================================

    const response =
      await fetch(
        "https://api.cloudinary.com/v1_1/db4bgno7i/video/upload",
        {
          method: "POST",
          body: formData,
        }
      );

    console.log(
      "UPLOAD STATUS:",
      response.status
    );

    const cloudinaryData =
      await response.json();

    console.log(
      "CLOUDINARY RESPONSE:",
      cloudinaryData
    );

    // ==================================================
    // CLOUDINARY FAILED
    // ==================================================

    if (
      !cloudinaryData.secure_url
    ) {
      console.error(
        "CLOUDINARY FAILED:",
        cloudinaryData
      );

      return {
        success: false,
        message:
          "Cloudinary upload failed",
      };
    }

    // ==================================================
    // URLS
    // ==================================================

    const videoUrl =
      cloudinaryData.secure_url;

    const musicId =
      music ||
      `original-${cloudinaryData.public_id}`;

    const thumbnailUrl =
      cloudinaryData.secure_url
        .replace(
          "/video/upload/",
          "/video/upload/so_1/"
        )
        .replace(
          ".mp4",
          ".jpg"
        );

    // ==================================================
    // FIRESTORE SAVE
    // ==================================================

    /**
     * IMPORTANT
     *
     * We save the authenticated Firebase UID.
     *
     * userId:
     *   Used by existing Watch & Earn data/code.
     *
     * creatorId:
     *   Used by newer code.
     *
     * Both point to the SAME authenticated user.
     */

    const videoData = {
      // ================================================
      // REAL AUTH USER
      // ================================================

      userId:
        authenticatedUserId,

      creatorId:
        authenticatedUserId,

      // ================================================
      // CREATOR INFORMATION
      // ================================================

      displayName:
        displayName || "",

      photoURL:
        photoURL || "",

      username:
        username || "",

      // ================================================
      // VIDEO CONTENT
      // ================================================

      caption:
        caption || "",

      hashtags:
        Array.isArray(hashtags)
          ? hashtags
          : [],

      music:
        musicId,

      originalVideoId:
        originalVideoId || null,

      originalAudioId:
        originalAudioId || null,

      // ================================================
      // VIDEO STATUS
      // ================================================

      verified:
        false,

      sponsor:
        sponsor === true,

      publicId:
        cloudinaryData.public_id,

      video:
        videoUrl,

      thumbnail:
        thumbnailUrl,

      // ================================================
      // REWARD
      // ================================================

      coins:
        rewardCoins,

      // ================================================
      // SOCIAL COUNTERS
      // ================================================

      likes:
        0,

      comments:
        0,

      shares:
        0,

      saves:
        0,

      views:
        0,

      watchTime:
        0,

      // ================================================
      // MODERATION / STATUS
      // ================================================

      active:
        true,

      featured:
        false,

      status:
        "approved",

      moderation:
        "safe",

      // ================================================
      // CREATED TIME
      // ================================================

      createdAt:
        Date.now(),
    };

    console.log(
      "SAVING WATCH VIDEO:",
      {
        authenticatedUserId,
        oldCreatorIdPassedFromCaller:
          creatorId,
        userId:
          videoData.userId,
        creatorId:
          videoData.creatorId,
      }
    );

    const docRef =
      await addDoc(
        collection(
          db,
          "watchEarnVideos"
        ),
        videoData
      );

    // ==================================================
    // SUCCESS
    // ==================================================

    console.log(
      "WATCH VIDEO CREATED:",
      {
        videoId: docRef.id,
        userId:
          authenticatedUserId,
        creatorId:
          authenticatedUserId,
      }
    );

    return {
      success: true,

      videoId:
        docRef.id,

      videoUrl,

      thumbnail:
        thumbnailUrl,

      coins:
        rewardCoins,

      userId:
        authenticatedUserId,

      creatorId:
        authenticatedUserId,
    };
  } catch (error) {
    // ==================================================
    // ERROR
    // ==================================================

    console.error(
      "UPLOAD WATCH VIDEO ERROR:",
      error
    );

    return {
      success: false,
      message:
        "Upload failed",
    };
  }
}
