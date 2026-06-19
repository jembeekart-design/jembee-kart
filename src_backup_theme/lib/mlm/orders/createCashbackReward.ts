import {
  addDoc,
  collection,
  doc,
  increment,
  updateDoc
} from "firebase/firestore";

import { db }
from "@/firebase/config";

export async function
createCashbackReward(
  userId: string,
  orderAmount: number
) {

  try {

    const cashback =
      Math.floor(
        orderAmount * 0.05
      );

    await updateDoc(
      doc(
        db,
        "users",
        userId
      ),
      {
        walletBalance:
          increment(cashback),

        cashbackIncome:
          increment(cashback),

        totalIncome:
          increment(cashback)
      }
    );

    await addDoc(
      collection(
        db,
        "cashbackHistory"
      ),
      {
        userId,

        orderAmount,

        cashback,

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
