import {
  addDoc,
  collection
} from "firebase/firestore";

import { db }
from "@/firebase/config";

interface UploadWatchVideoData {

  file: File;

  userId: string;

  username: string;

  caption: string;

  hashtags: string[];

  music: string;

  sponsor?: boolean;
}

export async function
uploadWatchVideo({
  file,
  userId,
  username,
  caption,
  hashtags,
  music,
  sponsor
}: UploadWatchVideoData) {

  try {

    /* =========================
       VALIDATION
    ========================= */

    if (!file) {

      return {
        success: false,

        message:
          "Video required"
      };
    }

    if (!userId) {

      return {
        success: false,

        message:
          "Login required"
      };
    }

    if (
      !file.type.startsWith(
        "video/"
      )
    ) {

      return {
        success: false,

        message:
          "Only video allowed"
      };
    }

    /* =========================
       AUTO COINS
    ========================= */

    const rewardCoins =
      sponsor
        ? 25
        : 5;

    /* =========================
       CLOUDINARY FORM DATA
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
       UPLOAD CLOUDINARY
    ========================= */

    const response =
      await fetch(

        "https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/video/upload",

        {
          method: "POST",

          body: formData
        }
      );

    const data =
      await response.json();

    /* =========================
       FAILED
    ========================= */

    if (!data.secure_url) {

      return {
        success: false,

        message:
          "Cloudinary upload failed"
      };
    }

    /* =========================
       SAVE FIRESTORE
    ========================= */

    const docRef =
      await addDoc(

        collection(
          db,
          "watchEarnVideos"
        ),

        {
          userId:
            userId,

          username:
            username,

          caption:
            caption || "",

          hashtags:
            hashtags || [],

          music:
            music || "",

          verified:
            false,

          sponsor:
            sponsor || false,

          video:
            data.secure_url,

          thumbnail:
            data.secure_url,

          coins:
            rewardCoins,

          likes: 0,

          comments: 0,

          shares: 0,

          saves: 0,

          views: 0,

          active: true,

          featured: false,

          status:
            "approved",

          moderation:
            "safe",

          createdAt:
            Date.now()
        }
      );

    return {

      success: true,

      videoId:
        docRef.id,

      videoUrl:
        data.secure_url
    };

  } catch (error) {

    console.error(
      "UPLOAD VIDEO ERROR:",
      error
    );

    return {

      success: false,

      message:
        "Upload failed"
    };
  }
}
