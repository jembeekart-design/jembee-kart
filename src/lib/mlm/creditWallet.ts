import {
  doc,
  increment,
  updateDoc,
  serverTimestamp
} from "firebase/firestore";

import { db } from "@/firebase/config";

interface CreditWalletData {
  uid: string;

  amount: number;

  incomeType:
    | "directIncome"
    | "levelIncome"
    | "rewardIncome"
    | "rankIncome";
}

export async function creditWallet(
  data: CreditWalletData
) {

  try {

    /* =========================
       UPDATE USER
    ========================= */

    await updateDoc(
      doc(db, "users", data.uid),
      {
        walletBalance:
          increment(data.amount),

        totalIncome:
          increment(data.amount),

        [data.incomeType]:
          increment(data.amount),

        updatedAt:
          serverTimestamp()
      }
    );

    /* =========================
       UPDATE WALLET
    ========================= */

    await updateDoc(
      doc(db, "wallets", data.uid),
      {
        balance:
          increment(data.amount),

        withdrawable:
          increment(data.amount),

        updatedAt:
          serverTimestamp()
      }
    );

    /* =========================
       SAVE TRANSACTION
    ========================= */

    const transactionId =
      crypto.randomUUID();

    await updateDoc(
      doc(
        db,
        "transactions",
        transactionId
      ),
      {
        uid: data.uid,

        amount: data.amount,

        type: "credit",

        incomeType:
          data.incomeType,

        createdAt:
          serverTimestamp()
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
