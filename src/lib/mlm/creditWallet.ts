import {
  doc,
  getDoc,
  increment,
  serverTimestamp,
  setDoc,
  updateDoc
} from "firebase/firestore";

import { db } from "@/firebase/config";

import { createNotification } from "./createNotification";

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
       VALIDATION
    ========================= */

    if (!data.uid?.trim()) {
      return {
        success: false,
        message: "User ID Required"
      };
    }

    if (
      !data.amount ||
      data.amount <= 0
    ) {
      return {
        success: false,
        message: "Invalid Amount"
      };
    }

    /* =========================
       USER
    ========================= */

    const userRef = doc(
      db,
      "users",
      data.uid
    );

    const userSnapshot =
      await getDoc(userRef);

    if (!userSnapshot.exists()) {
      return {
        success: false,
        message: "User Not Found"
      };
    }

    /* =========================
       UPDATE USER
    ========================= */

    await updateDoc(
      userRef,
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

    await setDoc(
      doc(
        db,
        "wallets",
        data.uid
      ),
      {
        uid:
          data.uid,

        totalBalance:
          increment(data.amount),

        withdrawableBalance:
          increment(data.amount),

        totalEarnings:
          increment(data.amount),

        updatedAt:
          serverTimestamp()
      },
      {
        merge: true
      }
    );

    /* =========================
       TRANSACTION
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

        uid:
          data.uid,

        amount:
          data.amount,

        type:
          "credit",

        incomeType:
          data.incomeType,

        status:
          "completed",

        createdAt:
          serverTimestamp()
      }
    );

    /* =========================
       NOTIFICATION
    ========================= */

    await createNotification({
      userId:
        data.uid,

      title:
        "Income Credited",

      message:
        `₹${data.amount} has been credited to your wallet.`,

      type:
        "commission"
    });

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
