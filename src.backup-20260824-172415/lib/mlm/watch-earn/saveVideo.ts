import {
  doc,
  getDoc,
  setDoc,
  deleteDoc
} from "firebase/firestore";

import { db }
from "@/firebase/config";

interface SaveVideoData {

  videoId: string;

  userId: string;

}

export async function
saveVideo({
  videoId,
  userId
}: SaveVideoData) {

  try {

    /* =========================
       SAVE REF
    ========================= */

    const saveRef =
      doc(
        db,
        "savedWatchVideos",
        `${videoId}_${userId}`
      );

    const saveSnap =
      await getDoc(
        saveRef
      );

    /* =========================
       UNSAVE VIDEO
    ========================= */

    if (
      saveSnap.exists()
    ) {

      await deleteDoc(
        saveRef
      );

      return {
        success: true,

        saved: false
      };
    }

    /* =========================
       SAVE VIDEO
    ========================= */

    await setDoc(
      saveRef,
      {
        videoId:
          videoId,

        userId:
          userId,

        createdAt:
          Date.now()
      }
    );

    return {
      success: true,

      saved: true
    };

  } catch (error) {

    console.error(
      "SAVE VIDEO ERROR:",
      error
    );

    return {
      success: false,

      saved: false
    };
  }
}
