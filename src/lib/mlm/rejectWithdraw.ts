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

import { createNotification } from "./createNotification";

interface RejectWithdrawData {
  withdrawId: string;
  adminId: string;
  reason: string;
}

export async function rejectWithdraw(
  data: RejectWithdrawData
) {
  try {

    /* ======================================================
       VALIDATION
    ====================================================== */

    if (!data.withdrawId?.trim()) {
      return {
        success: false,
        message: "Withdraw ID Required"
      };
    }

    if (!data.adminId?.trim()) {
      return {
        success: false,
        message: "Admin ID Required"
      };
    }

    if (!data.reason?.trim()) {
      return {
        success: false,
        message: "Reason Required"
      };
    }

    /* ======================================================
       GET WITHDRAW
    ====================================================== */

    const withdrawRef = doc(
      db,
      "withdraws",
      data.withdrawId
    );

    const withdrawSnapshot =
      await getDoc(
        withdrawRef
      );

    if (!withdrawSnapshot.exists()) {
      return {
        success: false,
        message:
          "Withdraw Request Not Found"
      };
    }

    const withdrawData =
      withdrawSnapshot.data();

    /* ======================================================
       STATUS CHECK
    ====================================================== */

    if (
      withdrawData.status !==
      "pending"
    ) {
      return {
        success: false,
        message:
          "Withdraw Already Processed"
      };
    }

    /* ======================================================
       UPDATE WITHDRAW
    ====================================================== */

    await updateDoc(
      withdrawRef,
      {
        status:
          "rejected",

        rejectedBy:
          data.adminId,

        rejectedReason:
          data.reason.trim(),

        rejectedAt:
          serverTimestamp(),

        updatedAt:
          serverTimestamp()
      }
    );

    /* ======================================================
       REFUND WALLET
    ====================================================== */

    const walletRef = doc(
      db,
      "wallets",
      withdrawData.userId
    );

    const walletSnapshot =
      await getDoc(
        walletRef
      );

    if (!walletSnapshot.exists()) {
      return {
        success: false,
        message:
          "Wallet Not Found"
      };
    }

    await updateDoc(
      walletRef,
      {
        withdrawableBalance:
          increment(
            withdrawData.amount
          ),

        pendingWithdraw:
          increment(
            -withdrawData.amount
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
          withdrawData.userId,

        withdrawId:
          data.withdrawId,

        type:
          "withdraw_rejected",

        amount:
          withdrawData.amount,

        reason:
          data.reason.trim(),

        status:
          "rejected",

        rejectedBy:
          data.adminId,

        createdAt:
          serverTimestamp()
      }
    );

    /* ======================================================
       ADMIN LOG
    ====================================================== */

    await addDoc(
      collection(
        db,
        "admin_logs"
      ),
      {
        action:
          "reject_withdraw",

        withdrawId:
          data.withdrawId,

        userId:
          withdrawData.userId,

        adminId:
          data.adminId,

        amount:
          withdrawData.amount,

        reason:
          data.reason.trim(),

        createdAt:
          serverTimestamp()
      }
    );

    /* ======================================================
       NOTIFICATION
    ====================================================== */

    await createNotification({
      userId:
        withdrawData.userId,

      title:
        "Withdraw Rejected",

      message:
        `Your withdraw request of ₹${withdrawData.amount} was rejected. Reason: ${data.reason.trim()}`,

      type:
        "withdraw"
    });

    return {
      success: true,
      message:
        "Withdraw Rejected Successfully"
    };

  } catch (error) {

    console.error(
      "REJECT WITHDRAW ERROR:",
      error
    );

    return {
      success: false,
      message:
        "Something went wrong"
    };
  }
}
