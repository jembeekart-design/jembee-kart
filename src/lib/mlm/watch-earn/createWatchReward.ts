import {
  addDoc,
  collection,
  doc,
  increment,
  updateDoc
} from "firebase/firestore";

import { db }
from "@/firebase/config";

interface CreateWatchRewardData {
  userId: string;

  videoId: string;

  watchSeconds: number;

  rewardCoins: number;
}

export async function
createWatchReward(
  data:
  CreateWatchRewardData
) {

  try {

    /* =========================
       MIN WATCH LIMIT
    ========================= */

    if (
      data.watchSeconds < 15
    ) {

      return {
        success: false,

        message:
          "Watch more time"
      };
    }

    /* =========================
       UPDATE USER
    ========================= */

    await updateDoc(
      doc(
        db,
        "users",
        data.userId
      ),
      {
        walletCoins:
          increment(
            data.rewardCoins
          ),

        totalCoins:
          increment(
            data.rewardCoins
          ),

        watchEarnCoins:
          increment(
            data.rewardCoins
          )
      }
    );

    /* =========================
       SAVE HISTORY
    ========================= */

    await addDoc(
      collection(
        db,
        "watchRewardHistory"
      ),
      {
        userId:
          data.userId,

        videoId:
          data.videoId,

        watchSeconds:
          data.watchSeconds,

        rewardCoins:
          data.rewardCoins,

        createdAt:
          Date.now()
      }
    );

    return {
      success: true
    };

  } catch (error) {

    console.error(error);

    return {
      success: false
    };
  }
}
