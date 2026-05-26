import {
  doc,
  increment,
  setDoc,
  updateDoc,
  getDoc
} from "firebase/firestore";

import { db }
from "@/firebase/config";

interface SyncCoinsToFirestoreData {

  userId: string;

  coins: number;

  videoId: string;

}

export async function
syncCoinsToFirestore({
  userId,
  coins,
  videoId
}: SyncCoinsToFirestoreData) {

  try {

    /* =========================
       USER REF
    ========================= */

    const userRef =
      doc(
        db,
        "users",
        userId
      );

    /* =========================
       WATCH REWARD REF
    ========================= */

    const rewardRef =
      doc(
        db,
        "watchRewards",
        `${videoId}_${userId}`
      );

    const rewardSnap =
      await getDoc(
        rewardRef
      );

    /* =========================
       ALREADY CLAIMED
    ========================= */

    if (
      rewardSnap.exists()
    ) {

      return {
        success: false,

        message:
          "Reward already claimed"
      };
    }

    /* =========================
       UPDATE USER WALLET
    ========================= */

    await updateDoc(
      userRef,
      {
        walletBalance:
          increment(coins),

        totalCoins:
          increment(coins),

        updatedAt:
          Date.now()
      }
    );

    /* =========================
       SAVE REWARD HISTORY
    ========================= */

    await setDoc(
      rewardRef,
      {
        userId:
          userId,

        videoId:
          videoId,

        coins:
          coins,

        claimedAt:
          Date.now()
      }
    );

    return {
      success: true
    };

  } catch (error) {

    console.error(
      "SYNC COINS ERROR:",
      error
    );

    return {
      success: false
    };
  }
}
