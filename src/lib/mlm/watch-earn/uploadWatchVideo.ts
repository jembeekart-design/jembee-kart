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

  coins: number;

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
  coins,
  sponsor
}: UploadWatchVideoData) {

  try {

    /* =========================
       STORAGE REF
    ========================= */

    const storageRef =
      ref(
        storage,
        `watch-videos/${
          Date.now()
        }-${file.name}`
      );

    /* =========================
       UPLOAD VIDEO
    ========================= */

    await uploadBytes(
      storageRef,
      file
    );

    /* =========================
       DOWNLOAD URL
    ========================= */

    const videoUrl =
      await getDownloadURL(
        storageRef
      );

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
            caption,

          hashtags:
            hashtags,

          music:
            music,

          verified:
            false,

          sponsor:
            sponsor || false,

          video:
            videoUrl,

          coins:
            coins,

          likes: 0,

          comments: 0,

          shares: 0,

          views: 0,

          status:
            "pending",

          createdAt:
            Date.now()
        }
      );

    return {
      success: true,

      videoId:
        docRef.id,

      videoUrl
    };

  } catch (error) {

    console.error(
      "UPLOAD WATCH VIDEO ERROR:",
      error
    );

    return {
      success: false
    };
  }
}
