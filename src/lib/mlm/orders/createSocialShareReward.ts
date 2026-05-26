import {
  addDoc,
  collection,
  doc,
  increment,
  updateDoc
} from "firebase/firestore";

import { db }
from "@/firebase/config";

interface CreateSocialShareRewardData {
  userId: string;

  platform: string;

  rewardAmount: number;
}

export async function
createSocialShareReward(
  data:
  CreateSocialShareRewardData
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

        socialShareIncome:
          increment(
            data.rewardAmount
          )
      }
    );

    /* =========================
       SAVE SHARE HISTORY
    ========================= */

    await addDoc(
      collection(
        db,
        "socialShareRewards"
      ),
      {
        userId:
          data.userId,

        platform:
          data.platform,

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
