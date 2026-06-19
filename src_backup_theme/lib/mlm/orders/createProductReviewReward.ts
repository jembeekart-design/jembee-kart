import {
  addDoc,
  collection,
  doc,
  increment,
  updateDoc
} from "firebase/firestore";

import { db }
from "@/firebase/config";

interface CreateProductReviewRewardData {
  userId: string;

  productId: string;

  review: string;

  rating: number;

  rewardAmount: number;
}

export async function
createProductReviewReward(
  data:
  CreateProductReviewRewardData
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

        reviewIncome:
          increment(
            data.rewardAmount
          )
      }
    );

    /* =========================
       SAVE REVIEW HISTORY
    ========================= */

    await addDoc(
      collection(
        db,
        "productReviewRewards"
      ),
      {
        userId:
          data.userId,

        productId:
          data.productId,

        review:
          data.review,

        rating:
          data.rating,

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
