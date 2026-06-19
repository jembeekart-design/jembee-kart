import {
  addDoc,
  collection,
  doc,
  increment,
  updateDoc
} from "firebase/firestore";

import { db }
from "@/firebase/config";

interface CreateCreatorRevenueShareData {
  creatorId: string;

  videoId: string;

  revenueAmount: number;
}

export async function
createCreatorRevenueShare(
  data:
  CreateCreatorRevenueShareData
) {

  try {

    /* =========================
       UPDATE CREATOR
    ========================= */

    await updateDoc(
      doc(
        db,
        "users",
        data.creatorId
      ),
      {
        walletBalance:
          increment(
            data.revenueAmount
          ),

        creatorIncome:
          increment(
            data.revenueAmount
          ),

        totalIncome:
          increment(
            data.revenueAmount
          )
      }
    );

    /* =========================
       SAVE HISTORY
    ========================= */

    await addDoc(
      collection(
        db,
        "creatorRevenueHistory"
      ),
      {
        creatorId:
          data.creatorId,

        videoId:
          data.videoId,

        revenueAmount:
          data.revenueAmount,

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
