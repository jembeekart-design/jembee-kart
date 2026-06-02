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

interface RejectPayoutData {
  payoutRequestId: string;
  adminId: string;
  reason: string;
}

export async function rejectPayoutRequest(
  data: RejectPayoutData
) {
  try {

    /* ======================================================
       VALIDATION
    ====================================================== */

    if (!data.payoutRequestId?.trim()) {
      return {
        success: false,
        message: "Payout Request ID Required"
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
        message: "Rejection Reason Required"
      };
    }

    /* ======================================================
       GET PAYOUT REQUEST
    ====================================================== */

    const payoutRef = doc(
      db,
      "payout_requests",
      data.payoutRequestId
    );

    const payoutSnapshot =
      await getDoc(payoutRef);

    if (!payoutSnapshot.exists()) {
      return {
        success: false,
        message:
          "Payout Request Not Found"
      };
    }

    const payoutData =
      payoutSnapshot.data();

    /* ======================================================
       STATUS CHECK
    ====================================================== */

    if (
      payoutData.status !==
      "pending"
    ) {
      return {
        success: false,
        message:
          "Payout Already Processed"
      };
    }

    /* ======================================================
       UPDATE PAYOUT
    ====================================================== */

    await updateDoc(
      payoutRef,
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
      payoutData.userId
    );

    await updateDoc(
      walletRef,
      {
        withdrawableBalance:
          increment(
            payoutData.amount
          ),

        pendingWithdraw:
          increment(
            -payoutData.amount
          ),

        updatedAt:
          serverTimestamp()
      }
    );

    /* ======================================================
       TRANSACTION LOG
    ====================================================== */

    await addDoc(
      collection(
        db,
        "transactions"
      ),
      {
        userId:
          payoutData.userId,

        payoutRequestId:
          data.payoutRequestId,

        type:
          "payout_rejected",

        amount:
          payoutData.amount,

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
          "reject_payout",

        payoutRequestId:
          data.payoutRequestId,

        userId:
          payoutData.userId,

        adminId:
          data.adminId,

        amount:
          payoutData.amount,

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
        payoutData.userId,

      title:
        "Payout Rejected",

      message:
        `Your payout request of ₹${payoutData.amount} was rejected. Reason: ${data.reason.trim()}`,

      type:
        "withdraw"
    });

    return {
      success: true,
      message:
        "Payout Rejected Successfully"
    };

  } catch (error) {

    console.error(
      "REJECT PAYOUT ERROR:",
      error
    );

    return {
      success: false,
      message:
        "Something went wrong"
    };
  }
}
