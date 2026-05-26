import {
  addDoc,
  collection,
  doc,
  increment,
  updateDoc
} from "firebase/firestore";

import { db }
from "@/firebase/config";

interface CreateLuckySpinRewardData {
  userId: string;

  rewardAmount: number;

  rewardType: string;
}

export async function
createLuckySpinReward(
  data:
  CreateLuckySpinRewardData
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

        spinIncome:
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
        "spinRewardHistory"
      ),
      {
        userId:
          data.userId,

        rewardAmount:
          data.rewardAmount,

        rewardType:
          data.rewardType,

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
