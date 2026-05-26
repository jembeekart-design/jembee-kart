import {
  doc,
  increment,
  updateDoc,
  getDoc,
  setDoc
} from "firebase/firestore";

import { db }
from "@/firebase/config";

interface UpdateWalletBalanceData {

  userId: string;

  amount: number;

  type:
    | "credit"
    | "debit";

}

export async function
updateWalletBalance({
  userId,
  amount,
  type
}: UpdateWalletBalanceData) {

  try {

    /* =========================
       WALLET REF
    ========================= */

    const walletRef =
      doc(
        db,
        "wallets",
        userId
      );

    const walletSnap =
      await getDoc(
        walletRef
      );

    /* =========================
       CREATE WALLET
    ========================= */

    if (
      !walletSnap.exists()
    ) {

      await setDoc(
        walletRef,
        {
          balance: 0,

          totalCredit: 0,

          totalDebit: 0,

          createdAt:
            Date.now()
        }
      );
    }

    /* =========================
       CREDIT
    ========================= */

    if (
      type ===
      "credit"
    ) {

      await updateDoc(
        walletRef,
        {
          balance:
            increment(
              amount
            ),

          totalCredit:
            increment(
              amount
            ),

          updatedAt:
            Date.now()
        }
      );
    }

    /* =========================
       DEBIT
    ========================= */

    if (
      type ===
      "debit"
    ) {

      await updateDoc(
        walletRef,
        {
          balance:
            increment(
              -amount
            ),

          totalDebit:
            increment(
              amount
            ),

          updatedAt:
            Date.now()
        }
      );
    }

    return {
      success: true
    };

  } catch (error) {

    console.error(
      "UPDATE WALLET ERROR:",
      error
    );

    return {
      success: false
    };
  }
}
