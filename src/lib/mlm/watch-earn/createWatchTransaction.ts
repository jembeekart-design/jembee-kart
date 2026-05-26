import {
  collection,
  addDoc
} from "firebase/firestore";

import { db }
from "@/firebase/config";

interface CreateWatchTransactionData {

  userId: string;

  videoId: string;

  coins: number;

}

export async function
createWatchTransaction({
  userId,
  videoId,
  coins
}: CreateWatchTransactionData) {

  try {

    /* =========================
       CREATE TRANSACTION
    ========================= */

    await addDoc(
      collection(
        db,
        "watchTransactions"
      ),
      {
        userId:
          userId,

        videoId:
          videoId,

        coins:
          coins,

        type:
          "watch-reward",

        status:
          "completed",

        createdAt:
          Date.now()
      }
    );

    return {
      success: true
    };

  } catch (error) {

    console.error(
      "WATCH TRANSACTION ERROR:",
      error
    );

    return {
      success: false
    };
  }
}
