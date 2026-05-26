import {
  doc,
  increment,
  updateDoc,
  setDoc,
  getDoc
} from "firebase/firestore";

import { db }
from "@/firebase/config";

interface LikeVideoData {

  videoId: string;

  userId: string;

}

export async function
likeVideo({
  videoId,
  userId
}: LikeVideoData) {

  try {

    /* =========================
       LIKE REF
    ========================= */

    const likeRef =
      doc(
        db,
        "watchVideoLikes",
        `${videoId}_${userId}`
      );

    const likeSnap =
      await getDoc(
        likeRef
      );

    /* =========================
       ALREADY LIKED
    ========================= */

    if (
      likeSnap.exists()
    ) {

      return {
        success: false,

        message:
          "Already liked"
      };
    }

    /* =========================
       SAVE LIKE
    ========================= */

    await setDoc(
      likeRef,
      {
        videoId:
          videoId,

        userId:
          userId,

        createdAt:
          Date.now()
      }
    );

    /* =========================
       UPDATE VIDEO
    ========================= */

    const videoRef =
      doc(
        db,
        "watchEarnVideos",
        videoId
      );

    await updateDoc(
      videoRef,
      {
        likes:
          increment(1)
      }
    );

    return {
      success: true
    };

  } catch (error) {

    console.error(
      "LIKE VIDEO ERROR:",
      error
    );

    return {
      success: false
    };
  }
}
