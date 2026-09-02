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
  isEnhanced?: boolean;
  preUploadedEnhancedData?: CloudinaryResponse | null;
}


export interface CloudinaryResponse {
  secure_url?: unknown;
  public_id?: unknown;
  eager?: unknown;
}

export function isValidHttpsUrl(value: unknown): value is string {
  if (typeof value !== "string" || value.trim() === "") {
    return false;
  }

  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function isValidCloudinaryResponse(
  value: unknown
): value is CloudinaryResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const data = value as Record<string, unknown>;

  return (
    isValidHttpsUrl(data.secure_url) &&
    typeof data.public_id === "string" &&
    data.public_id.trim() !== ""
  );
}

export function getEnhancedUrl(
  data: CloudinaryResponse
): string | null {
  if (!Array.isArray(data.eager)) {
    return null;
  }

  const first = data.eager[0];

  if (!first || typeof first !== "object") {
    return null;
  }

  const eagerData = first as Record<string, unknown>;
  const enhancedUrl: unknown = eagerData.secure_url;

  if (!isValidHttpsUrl(enhancedUrl)) {
    return null;
  }

  return enhancedUrl;
}

export function getOriginalUrl(
  data: CloudinaryResponse
): string | null {
  const url: unknown = data.secure_url;

  return isValidHttpsUrl(url) ? url : null;
}

export async function uploadToCloudinary(
  file: File,
  preset: string,
  signal?: AbortSignal
): Promise<CloudinaryResponse> {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("upload_preset", preset);

  const response = await fetch(
    "https://api.cloudinary.com/v1_1/db4bgno7i/video/upload",
    {
      method: "POST",
      body: formData,
      signal,
    }
  );

  console.log("UPLOAD STATUS:", response.status);

  const responseData: unknown =
    await response.json();

  if (!response.ok) {
    if (
      responseData &&
      typeof responseData === "object" &&
      "error" in responseData
    ) {
      const error = responseData.error;

      if (
        error &&
        typeof error === "object" &&
        "message" in error &&
        typeof error.message === "string"
      ) {
        throw new Error(error.message);
      }
    }

    throw new Error("Cloudinary upload failed");
  }

  if (!isValidCloudinaryResponse(responseData)) {
    throw new Error("Invalid Cloudinary response");
  }

  return responseData;
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
  isEnhanced,
  preUploadedEnhancedData,
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
    // CLOUDINARY UPLOAD ATTEMPT
    // ==================================================

    let cloudinaryData: CloudinaryResponse | null = null;
    let finalIsEnhanced = false;

    if (isEnhanced === true) {
      if (preUploadedEnhancedData !== undefined) {
        if (
          preUploadedEnhancedData !== null &&
          isValidCloudinaryResponse(preUploadedEnhancedData) &&
          getEnhancedUrl(preUploadedEnhancedData)
        ) {
          cloudinaryData = preUploadedEnhancedData;
          finalIsEnhanced = true;
          console.log(
            "Using accepted pre-uploaded enhanced Cloudinary response"
          );
        } else {
          console.warn(
            "Pre-uploaded enhanced Cloudinary response is invalid. Falling back to original upload without another enhanced upload."
          );
        }
      } else {
        try {
          const enhancedData =
            await uploadToCloudinary(
              file,
              "jembeekart_enhanced"
            );

          const enhancedUrl =
            getEnhancedUrl(enhancedData);

          if (!enhancedUrl) {
            throw new Error(
              "Enhanced eager URL missing or invalid"
            );
          }

          cloudinaryData = enhancedData;
          finalIsEnhanced = true;
        } catch (error) {
          console.warn(
            "Enhanced upload failed, falling back to original:",
            error
          );
        }
      }
    }

    if (!cloudinaryData) {
      cloudinaryData =
        await uploadToCloudinary(
          file,
          "jembeekart"
        );

      finalIsEnhanced = false;
    }

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

    const videoUrl: string | null =
      finalIsEnhanced
        ? getEnhancedUrl(cloudinaryData)
        : getOriginalUrl(cloudinaryData);

    if (!videoUrl) {
      return {
        success: false,
        message: "Final video URL is invalid",
      };
    }

    const musicId =
      music ||
      `original-${cloudinaryData.public_id}`;

    const thumbnailUrl = videoUrl
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

      isEnhanced:
        finalIsEnhanced,

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
        0,

      pendingCoins:
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
        "pending",

      moderation:
        "pending",

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
