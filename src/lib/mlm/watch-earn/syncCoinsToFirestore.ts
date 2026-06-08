import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { db } from "@/firebase/config";

interface SyncCoinsToFirestoreData {
  userId: string;
  videoId: string;
}

export async function syncCoinsToFirestore({
  userId,
  videoId,
}: SyncCoinsToFirestoreData) {
  try {
    if (!userId) {
      throw new Error(
        "User ID is required"
      );
    }

    if (!videoId) {
      throw new Error(
        "Video ID is required"
      );
    }

    /* =========================
       REWARD CLAIM RECORD
    ========================= */

    const rewardRef = doc(
      db,
      "watchRewards",
      `${videoId}_${userId}`
    );

    const rewardSnap =
      await getDoc(rewardRef);

    /* =========================
       ALREADY PROCESSED
    ========================= */

    if (rewardSnap.exists()) {
      return {
        success: false,
        message:
          "Reward already processed",
      };
    }

    /* =========================
       SAVE CLAIM RECORD
    ========================= */

    await setDoc(rewardRef, {
      userId,
      videoId,

      source:
        "watch-earn",

      status:
        "processed",

      createdAt:
        serverTimestamp(),
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error(
      "SYNC WATCH REWARD ERROR:",
      error
    );

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to sync reward",
    };
  }
}
