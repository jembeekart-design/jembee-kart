import {
  addDoc,
  collection,
  doc,
  increment,
  updateDoc
} from "firebase/firestore";

import { db }
from "@/firebase/config";

interface CreateScratchCardRewardData {
  userId: string;

  rewardAmount: number;

  rewardTitle: string;
}

export async function
createScratchCardReward(
  data:
  CreateScratchCardRewardData
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

        scratchIncome:
          increment(
            data.rewardAmount
          )
      }
    );

    /* =========================
       SAVE HISTORY
    ========================= */

    await addDoc(
      collection(
        db,
        "scratchRewardHistory"
      ),
      {
        userId:
          data.userId,

        rewardAmount:
          data.rewardAmount,

        rewardTitle:
          data.rewardTitle,

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
