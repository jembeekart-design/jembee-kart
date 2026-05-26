import {
  addDoc,
  collection,
  doc,
  getDoc,
  increment,
  updateDoc
} from "firebase/firestore";

import { db }
from "@/firebase/config";

interface ClaimWatchVideoRewardData {
  userId: string;

  videoId: string;

  watchedSeconds: number;
}

export async function
claimWatchVideoReward(
  data:
  ClaimWatchVideoRewardData
) {

  try {

    const videoRef =
      doc(
        db,
        "watchVideos",
        data.videoId
      );

    const videoSnap =
      await getDoc(
        videoRef
      );

    if (
      !videoSnap.exists()
    ) {

      return {
        success: false
      };
    }

    const videoData =
      videoSnap.data();

    /* =========================
       WATCH CHECK
    ========================= */

    if (
      data.watchedSeconds <
      videoData.minimumWatchTime
    ) {

      return {
        success: false,

        message:
          "Watch more time"
      };
    }

    /* =========================
       GIVE REWARD
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
            videoData.rewardCoins
          ),

        totalCoins:
          increment(
            videoData.rewardCoins
          ),

        totalWatchReward:
          increment(
            videoData.rewardCoins
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

        watchedSeconds:
          data.watchedSeconds,

        rewardCoins:
          videoData.rewardCoins,

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
