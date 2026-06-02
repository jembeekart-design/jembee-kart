import {
  addDoc,
  collection,
  doc,
  getDoc,
  increment,
  serverTimestamp,
  updateDoc
} from "firebase/firestore";

import { db } from "@/firebase/config";

import { createNotification }
from "./createNotification";

interface WithdrawData {
  userId: string;
  amount: number;
  upi: string;
}

export async function requestWithdraw(
  data: WithdrawData
) {
  try {

    /* ======================================================
       VALIDATION
    ====================================================== */

    if (!data.userId?.trim()) {
      return {
        success: false,
        message: "User ID Required"
      };
    }

    if (
      !data.amount ||
      data.amount < 100
    ) {
      return {
        success: false,
        message:
          "Minimum Withdraw ₹100"
      };
    }

    if (!data.upi?.trim()) {
      return {
        success: false,
        message:
          "UPI ID Required"
      };
    }

    /* ======================================================
       USER
    ====================================================== */

    const userRef = doc(
      db,
      "users",
      data.userId
    );

    const userSnapshot =
      await getDoc(userRef);

    if (!userSnapshot.exists()) {
      return {
        success: false,
        message:
          "User Not Found"
      };
    }

    const userData =
      userSnapshot.data();

    if (userData.isBlocked) {
      return {
        success: false,
        message:
          "Account Blocked"
      };
    }

    if (
      !userData.isKYCVerified
    ) {
      return {
        success: false,
        message:
          "Complete KYC First"
      };
    }

    /* ======================================================
       WALLET
    ====================================================== */

    const walletRef = doc(
      db,
      "wallets",
      data.userId
    );

    const walletSnapshot =
      await getDoc(walletRef);

    if (!walletSnapshot.exists()) {
      return {
        success: false,
        message:
          "Wallet Not Found"
      };
    }

    const walletData =
      walletSnapshot.data();

    const balance =
      Number(
        walletData.withdrawableBalance || 0
      );

    if (
      balance < data.amount
    ) {
      return {
        success: false,
        message:
          "Insufficient Balance"
      };
    }

    /* ======================================================
       CREATE REQUEST
    ====================================================== */

    const withdrawRef =
      await addDoc(
        collection(
          db,
          "withdraws"
        ),
        {
          userId:
            data.userId,

          amount:
            data.amount,

          upi:
            data.upi.trim(),

          status:
            "pending",

          transactionId:
            "",

          adminRemark:
            "",

          createdAt:
            serverTimestamp(),

          updatedAt:
            serverTimestamp()
        }
      );

    /* ======================================================
       HOLD BALANCE
    ====================================================== */

    await updateDoc(
      walletRef,
      {
        withdrawableBalance:
          increment(
            -data.amount
          ),

        pendingWithdraw:
          increment(
            data.amount
          ),

        updatedAt:
          serverTimestamp()
      }
    );

    /* ======================================================
       TRANSACTION
    ====================================================== */

    await addDoc(
      collection(
        db,
        "transactions"
      ),
      {
        userId:
          data.userId,

        withdrawId:
          withdrawRef.id,

        type:
          "withdraw_request",

        amount:
          data.amount,

        status:
          "pending",

        createdAt:
          serverTimestamp()
      }
    );

    /* ======================================================
       NOTIFICATION
    ====================================================== */

    await createNotification({
      userId:
        data.userId,

      title:
        "Withdraw Requested",

      message:
        `Your withdraw request of ₹${data.amount} is pending approval.`,

      type:
        "withdraw"
    });

    return {
      success: true,
      withdrawId:
        withdrawRef.id,
      message:
        "Withdraw Request Submitted Successfully"
    };

  } catch (error) {

    console.error(
      "WITHDRAW ERROR:",
      error
    );

    return {
      success: false,
      message:
        "Something went wrong"
    };
  }
}
