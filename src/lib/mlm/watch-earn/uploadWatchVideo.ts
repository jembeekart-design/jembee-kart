import {
  addDoc,
  collection
} from "firebase/firestore";

import {
  getDownloadURL,
  ref,
  uploadBytes
} from "firebase/storage";

import {
  db,
  storage
} from "@/firebase/config";

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
       USER CHECK
    ========================= */

    if (!userId) {

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
       AUTO REWARD SYSTEM
    ========================= */

    const rewardCoins =
      sponsor
        ? 25
        : 5;

    /* =========================
       STORAGE PATH
    ========================= */

    const fileName =
      `${Date.now()}-${
        file.name
      }`;

    const storageRef =
      ref(
        storage,
        `watch-videos/${fileName}`
      );

    /* =========================
       UPLOAD VIDEO
    ========================= */

    await uploadBytes(
      storageRef,
      file
    );

    /* =========================
       VIDEO URL
    ========================= */

    const videoUrl =
      await getDownloadURL(
        storageRef
      );

    /* =========================
       SAVE VIDEO
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
            videoUrl,

          thumbnail:
            "",

          coins:
            rewardCoins,

          likes: 0,

          comments: 0,

          shares: 0,

          saves: 0,

          views: 0,

          watchTime: 0,

          active: true,

          featured: false,

          status:
            "pending",

          moderation:
            "review",

          createdAt:
            Date.now()
        }
      );

    return {
      success: true,

      videoId:
        docRef.id,

      videoUrl,

      coins:
        rewardCoins
    };

  } catch (error) {

    console.error(
      "UPLOAD WATCH VIDEO ERROR:",
      error
    );

    return {
      success: false,

      message:
        "Upload failed"
    };
  }
}
