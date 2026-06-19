import {
  doc,
  runTransaction
} from "firebase/firestore";

import { db } from "@/firebase/config";

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

    const userRef =
      doc(
        db,
        "users",
        data.userId
      );

    await runTransaction(
      db,
      async (
        transaction
      ) => {

        const userSnap =
          await transaction.get(
            userRef
          );

        if (
          !userSnap.exists()
        ) {
          throw new Error(
            "User not found"
          );
        }

        const userData =
          userSnap.data();

        const walletBalance =
          typeof userData.walletBalance ===
          "number"
            ? userData.walletBalance
            : 0;

        const pendingWithdrawal =
          typeof userData.pendingWithdrawal ===
          "number"
            ? userData.pendingWithdrawal
            : 0;

        if (
          data.amount <= 0
        ) {
          throw new Error(
            "Invalid withdrawal amount"
          );
        }

        if (
          walletBalance <
          data.amount
        ) {
          throw new Error(
            "Insufficient wallet balance"
          );
        }

        transaction.update(
          userRef,
          {
            walletBalance:
              walletBalance -
              data.amount,

            pendingWithdrawal:
              pendingWithdrawal +
              data.amount
          }
        );
      }
    );

    return {
      success: true
    };

  } catch (error) {

    console.error(
      error
    );

    return {
      success: false
    };
  }
}
