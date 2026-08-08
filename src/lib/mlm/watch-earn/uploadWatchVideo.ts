import {
  addDoc,
  collection
} from "firebase/firestore";

import {
  db
} from "@/firebase/config";

interface UploadWatchVideoData {
  file: File;
  creatorId: string;
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

export async function
uploadWatchVideo({
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
  originalAudioId
}: UploadWatchVideoData) {

  try {

    /* =========================
       USER CHECK
    ========================= */

    if (!creatorId) {

      return {

        success: false,

        message:
          "User not found"
      };
    }

    /* =========================
       FILE CHECK
    ========================= */

    if (!file) {

      return {

        success: false,

        message:
          "Video file required"
      };
    }

    /* =========================
       VIDEO TYPE CHECK
    ========================= */

    if (
      !file.type.startsWith(
        "video/"
      )
    ) {

      return {

        success: false,

        message:
          "Only video upload allowed"
      };
    }

    /* =========================
       FILE SIZE CHECK
       MAX 100MB
    ========================= */

    const maxSize =
      100 * 1024 * 1024;

    if (
      file.size > maxSize
    ) {

      return {

        success: false,

        message:
          "Video too large"
      };
    }

    /* =========================
       AUTO REWARD
    ========================= */

    const rewardCoins =
      sponsor
        ? 25
        : 5;

    /* =========================
       FORM DATA
    ========================= */

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

    /* =========================
       CLOUDINARY UPLOAD
    ========================= */

    const response =
      await fetch(

        "https://api.cloudinary.com/v1_1/db4bgno7i/video/upload",

        {
          method: "POST",

          body: formData
        }
      );

    /* =========================
       DEBUG STATUS
    ========================= */

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

    /* =========================
       FAILED
    ========================= */

    if (
      !cloudinaryData.secure_url
    ) {

      alert(
        JSON.stringify(
          cloudinaryData
        )
      );

      console.error(
        "CLOUDINARY FAILED:",
        cloudinaryData
      );

      return {

        success: false,

        message:
          "Cloudinary upload failed"
      };
    }

    /* =========================
       URLS
    ========================= */

    const videoUrl =
      cloudinaryData.secure_url;

    const musicId = music || `original-${cloudinaryData.public_id}`;

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

    /* =========================
       FIRESTORE SAVE
    ========================= */

    const docRef =
      await addDoc(

        collection(
          db,
          "watchEarnVideos"
        ),

        {

          creatorId,

          displayName,

          photoURL,

          username,

          caption:
            caption || "",

          hashtags:
            hashtags || [],

          music:
            musicId,

          originalVideoId: originalVideoId || null,

          originalAudioId: originalAudioId || null,

          verified:
            false,

          sponsor:
            sponsor || false,

          publicId:
            cloudinaryData.public_id,

          video:
            videoUrl,

          thumbnail:
            thumbnailUrl,

          coins:
            rewardCoins,

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

          active:
            true,

          featured:
            false,

          status:
            "approved",

          moderation:
            "safe",

          createdAt:
            Date.now()
        }
      );

    /* =========================
       SUCCESS
    ========================= */

    return {

      success: true,

      videoId:
        docRef.id,

      videoUrl,

      thumbnail:
        thumbnailUrl,

      coins:
        rewardCoins
    };

  } catch (error) {

    console.error(
      "UPLOAD WATCH VIDEO ERROR:",
      error
    );

    alert(
      JSON.stringify(
        error
      )
    );

    return {

      success: false,

      message:
        "Upload failed"
    };
  }
}
