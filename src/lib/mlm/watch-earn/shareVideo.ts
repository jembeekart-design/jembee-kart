import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment
} from "firebase/firestore";

import { db }
from "@/firebase/config";

interface ShareVideoData {

  videoId: string;

  userId: string;

}

export async function
shareVideo({
  videoId,
  userId
}: ShareVideoData) {

  try {

    /* =========================
       SHARE DOCUMENT
    ========================= */

    const shareRef =
      doc(
        db,
        "watchVideoShares",
        `${videoId}_${userId}`
      );

    const shareSnap =
      await getDoc(
        shareRef
      );

    /* =========================
       ALREADY SHARED
    ========================= */

    if (
      shareSnap.exists()
    ) {

      return {
        success: false,

        message:
          "Video already shared"
      };
    }

    /* =========================
       SAVE SHARE
    ========================= */

    await setDoc(
      shareRef,
      {
        videoId:
          videoId,

        userId:
          userId,

        sharedAt:
          Date.now()
      }
    );

    /* =========================
       UPDATE VIDEO SHARE COUNT
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
        shares:
          increment(1)
      }
    );

    return {
      success: true
    };

  } catch (error) {

    console.error(
      "SHARE VIDEO ERROR:",
      error
    );

    return {
      success: false
    };
  }
}
