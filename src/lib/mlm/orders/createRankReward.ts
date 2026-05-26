import {
  addDoc,
  collection,
  doc,
  increment,
  updateDoc
} from "firebase/firestore";

import { db }
from "@/firebase/config";

interface CreateRankRewardData {
  userId: string;

  rank: string;

  rewardAmount: number;
}

export async function
createRankReward(
  data:
  CreateRankRewardData
) {

  try {

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
        walletBalance:
          increment(
            data.rewardAmount
          ),

        totalIncome:
          increment(
            data.rewardAmount
          ),

        rankRewardIncome:
          increment(
            data.rewardAmount
          ),

        currentRank:
          data.rank
      }
    );

    /* =========================
       SAVE HISTORY
    ========================= */

    await addDoc(
      collection(
        db,
        "rankRewardHistory"
      ),
      {
        userId:
          data.userId,

        rank:
          data.rank,

        rewardAmount:
          data.rewardAmount,

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
