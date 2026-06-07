import {
  doc,
  getDoc,
  updateDoc,
  increment,
  serverTimestamp,
  setDoc,
  collection
} from "firebase/firestore";

import { db } from "@/firebase/config";

interface ApproveWithdrawTransactionData {
  withdrawId: string;
}

export async function approveWithdrawTransaction(
  data: ApproveWithdrawTransactionData
) {
  try {
    /* =========================
       VALIDATION
    ========================= */

    if (!data.withdrawId?.trim()) {
      return {
        success: false,
        message: "Withdraw ID Required"
      };
    }

    /* =========================
       WITHDRAW REQUEST
    ========================= */

    const withdrawRef = doc(
      db,
      "withdrawTransactions",
      data.withdrawId
    );

    const withdrawSnap =
      await getDoc(withdrawRef);

    if (!withdrawSnap.exists()) {
      return {
        success: false,
        message: "Withdrawal not found"
      };
    }

    const withdrawData =
      withdrawSnap.data();

    /* =========================
       AMOUNT VALIDATION
    ========================= */

    if (
      typeof withdrawData.amount !==
        "number" ||
      withdrawData.amount <= 0
    ) {
      return {
        success: false,
        message:
          "Invalid withdrawal amount"
      };
    }

    /* =========================
       DUPLICATE CHECK
    ========================= */

    if (
      withdrawData.status ===
      "approved"
    ) {
      return {
        success: false,
        message:
          "Withdrawal already approved"
      };
    }

    if (
      withdrawData.status ===
      "rejected"
    ) {
      return {
        success: false,
        message:
          "Withdrawal already rejected"
      };
    }

    /* =========================
       USER CHECK
    ========================= */

    const userRef = doc(
      db,
      "users",
      withdrawData.userId
    );

    const userSnap =
      await getDoc(userRef);

    if (!userSnap.exists()) {
      return {
        success: false,
        message: "User not found"
      };
    }

    const userData =
      userSnap.data();

    const beforePendingWithdrawal =
      typeof userData.pendingWithdrawal ===
      "number"
        ? userData.pendingWithdrawal
        : 0;

    /* =========================
       SAFETY CHECK
    ========================= */

    if (
      beforePendingWithdrawal <
      withdrawData.amount
    ) {
      return {
        success: false,
        message:
          "Invalid pending withdrawal balance"
      };
    }

    const afterPendingWithdrawal =
      Math.max(
        0,
        beforePendingWithdrawal -
          withdrawData.amount
      );

    /* =========================
       UPDATE REQUEST STATUS
    ========================= */

    await updateDoc(
      withdrawRef,
      {
        status: "approved",

        approvedAt:
          serverTimestamp(),

        updatedAt:
          serverTimestamp()
      }
    );

    /* =========================
       REMOVE HOLD AMOUNT
    ========================= */

    await updateDoc(
      userRef,
      {
        pendingWithdrawal:
          increment(
            -withdrawData.amount
          ),

        updatedAt:
          serverTimestamp()
      }
    );

    /* =========================
       WALLET TRANSACTION LOG
    ========================= */

    const txRef = doc(
      collection(
        db,
        "users",
        withdrawData.userId,
        "walletTransactions"
      )
    );

    await setDoc(
      txRef,
      {
        transactionId:
          txRef.id,

        withdrawalId:
          data.withdrawId,

        userId:
          withdrawData.userId,

        title:
          "Withdrawal Approved",

        amount:
          withdrawData.amount,

        type:
          "withdrawal",

        status:
          "success",

        walletType:
          "walletBalance",

        beforePendingWithdrawal,

        afterPendingWithdrawal,

        createdAt:
          serverTimestamp()
      }
    );

    return {
      success: true,
      message:
        "Withdrawal approved successfully"
    };
  } catch (error) {
    console.error(
      "approveWithdrawTransaction Error:",
      error
    );

    return {
      success: false,
      message:
        "Failed to approve withdrawal"
    };
  }
}
