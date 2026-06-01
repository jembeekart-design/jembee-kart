import {
  doc,
  increment,
  updateDoc,
  setDoc,
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
        walletBalance: increment(data.amount),

        totalIncome: increment(data.amount),

        [data.incomeType]:
          increment(data.amount),

        updatedAt: serverTimestamp()
      }
    );

    /* =========================
       UPDATE WALLET
    ========================= */

    await setDoc(
      doc(db, "wallets", data.uid),
      {
        uid: data.uid,

        balance: increment(data.amount),

        withdrawable: increment(data.amount),

        updatedAt: serverTimestamp()
      },
      {
        merge: true
      }
    );

    /* =========================
       SAVE TRANSACTION
    ========================= */

    const transactionId =
      crypto.randomUUID();

    await setDoc(
      doc(
        db,
        "transactions",
        transactionId
      ),
      {
        transactionId,

        uid: data.uid,

        amount: data.amount,

        type: "credit",

        incomeType: data.incomeType,

        status: "completed",

        createdAt: serverTimestamp()
      }
    );

    return {
      success: true
    };
  } catch (error) {
    console.error(
      "Wallet credit error:",
      error
    );

    return {
      success: false,
      error
    };
  }
}
