import {
  addDoc,
  collection,
  doc,
  getDoc,
  increment,
  updateDoc
} from "firebase/firestore";

import { db } from "@/firebase/config";

import { createNotification }
from "./createNotification";

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
    GET PAYOUT REQUEST
    ====================================================== */

    const payoutRef =
      doc(
        db,
        "payout_requests",
        data.payoutRequestId
      );

    const payoutSnapshot =
      await getDoc(
        payoutRef
      );

    if (
      !payoutSnapshot.exists()
    ) {

      return {

        success: false,

        message:
          "Payout Request Not Found"

      };

    }

    const payoutData =
      payoutSnapshot.data();

    /* ======================================================
    ALREADY REJECTED
    ====================================================== */

    if (
      payoutData.status ===
      "rejected"
    ) {

      return {

        success: false,

        message:
          "Already Rejected"

      };

    }

    /* ======================================================
    UPDATE PAYOUT STATUS
    ====================================================== */

    await updateDoc(
      payoutRef,
      {
        status:
          "rejected",

        rejectedBy:
          data.adminId,

        rejectedReason:
          data.reason,

        rejectedAt:
          Date.now()
      }
    );

    /* ======================================================
    REFUND USER WALLET
    ====================================================== */

    const walletRef =
      doc(
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
          )
      }
    );

    /* ======================================================
    SAVE TRANSACTION
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
          data.reason,

        status:
          "rejected",

        createdAt:
          Date.now()
      }
    );

    /* ======================================================
    SAVE ADMIN LOG
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

        adminId:
          data.adminId,

        reason:
          data.reason,

        amount:
          payoutData.amount,

        createdAt:
          Date.now()
      }
    );

    /* ======================================================
    CREATE NOTIFICATION
    ====================================================== */

    await createNotification({
      userId:
        payoutData.userId,

      title:
        "Payout Rejected",

      message:
        `Your payout request of ₹${payoutData.amount} was rejected. Reason: ${data.reason}`,

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
