import {
  addDoc,
  collection,
  doc,
  increment,
  updateDoc
} from "firebase/firestore";

import { db }
from "@/firebase/config";

interface CreateReferralVisitRewardData {
  userId: string;

  visitorId: string;

  rewardAmount: number;
}

export async function
createReferralVisitReward(
  data:
  CreateReferralVisitRewardData
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

        referralVisitIncome:
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
        "referralVisitRewardHistory"
      ),
      {
        userId:
          data.userId,

        visitorId:
          data.visitorId,

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
