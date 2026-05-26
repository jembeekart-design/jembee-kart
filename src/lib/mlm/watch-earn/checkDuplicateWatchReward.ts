import {
  collection,
  getDocs,
  query,
  where
} from "firebase/firestore";

import { db }
from "@/firebase/config";

interface CheckDuplicateWatchRewardData {
  userId: string;

  videoId: string;
}

export async function
checkDuplicateWatchReward(
  data:
  CheckDuplicateWatchRewardData
) {

  try {

    const rewardsRef =
      collection(
        db,
        "watchRewardHistory"
      );

    const rewardsQuery =
      query(
        rewardsRef,

        where(
          "userId",
          "==",
          data.userId
        ),

        where(
          "videoId",
          "==",
          data.videoId
        )
      );

    const rewardsSnap =
      await getDocs(
        rewardsQuery
      );

    if (
      !rewardsSnap.empty
    ) {

      return {
        alreadyClaimed: true
      };
    }

    return {
      alreadyClaimed: false
    };

  } catch (error) {

    console.error(error);

    return {
      alreadyClaimed: false
    };
  }
}
