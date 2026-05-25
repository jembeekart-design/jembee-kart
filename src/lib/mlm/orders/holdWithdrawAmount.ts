import {
  doc,
  increment,
  updateDoc
} from "firebase/firestore";

import { db }
from "@/firebase/config";

interface HoldWithdrawAmountData {
  userId: string;

  amount: number;
}

export async function
holdWithdrawAmount(
  data:
  HoldWithdrawAmountData
) {

  try {

    await updateDoc(
      doc(
        db,
        "users",
        data.userId
      ),
      {
        walletBalance:
          increment(
            -data.amount
          ),

        holdBalance:
          increment(
            data.amount
          )
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
