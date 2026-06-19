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

interface RejectWithdrawTransactionData {
  withdrawId: string;
  reason?: string;
}

export async function rejectWithdrawTransaction(
  data: RejectWithdrawTransactionData
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
       STATUS CHECK
    ========================= */

    if (
      withdrawData.status ===
      "approved"
    ) {
      return {
        success: false,
        message:
          "Approved withdrawal cannot be rejected"
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

    const beforeWalletBalance =
      typeof userData.walletBalance ===
      "number"
        ? userData.walletBalance
        : 0;

    const beforePendingWithdrawal =
      typeof userData.pendingWithdrawal ===
      "number"
        ? userData.pendingWithdrawal
        : 0;

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

    const afterWalletBalance =
      beforeWalletBalance +
      withdrawData.amount;

    const afterPendingWithdrawal =
      Math.max(
        0,
        beforePendingWithdrawal -
          withdrawData.amount
      );

    /* =========================
       UPDATE REQUEST
    ========================= */

    await updateDoc(
      withdrawRef,
      {
        status: "rejected",

        rejectReason:
          data.reason ||
          "Rejected by admin",

        rejectedAt:
          serverTimestamp(),

        updatedAt:
          serverTimestamp()
      }
    );

    /* =========================
       REFUND USER BALANCE
    ========================= */

    await updateDoc(
      userRef,
      {
        walletBalance:
          increment(
            withdrawData.amount
          ),

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
          "Withdrawal Rejected",

        amount:
          withdrawData.amount,

        type:
          "withdrawal_rejected",

        status:
          "success",

        walletType:
          "walletBalance",

        beforeWalletBalance,

        afterWalletBalance,

        beforePendingWithdrawal,

        afterPendingWithdrawal,

        reason:
          data.reason ||
          "Rejected by admin",

        createdAt:
          serverTimestamp()
      }
    );

    return {
      success: true,
      message:
        "Withdrawal rejected successfully"
    };
  } catch (error) {
    console.error(
      "rejectWithdrawTransaction Error:",
      error
    );

    return {
      success: false,
      message:
        "Failed to reject withdrawal"
    };
  }
}
