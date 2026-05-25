import {
  addDoc,
  collection,
  doc,
  getDoc,
  updateDoc
} from "firebase/firestore";

import { db } from "@/firebase/config";

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
    GET WITHDRAW REQUEST
    ====================================================== */

    const withdrawRef =
      doc(
        db,
        "withdraws",
        data.withdrawId
      );

    const withdrawSnapshot =
      await getDoc(
        withdrawRef
      );

    if (
      !withdrawSnapshot.exists()
    ) {

      return {

        success: false,

        message:
          "Withdraw Request Not Found"

      };

    }

    const withdrawData =
      withdrawSnapshot.data();

    /* ======================================================
    ALREADY REJECTED
    ====================================================== */

    if (
      withdrawData.status ===
      "rejected"
    ) {

      return {

        success: false,

        message:
          "Already Rejected"

      };

    }

    /* ======================================================
    UPDATE WITHDRAW STATUS
    ====================================================== */

    await updateDoc(
      withdrawRef,
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
        withdrawData.userId
      );

    const walletSnapshot =
      await getDoc(
        walletRef
      );

    if (
      walletSnapshot.exists()
    ) {

      const walletData =
        walletSnapshot.data();

      await updateDoc(
        walletRef,
        {
          withdrawableBalance:
            Number(
              walletData.withdrawableBalance || 0
            ) + Number(
              withdrawData.amount
            )
        }
      );

    }

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
          withdrawData.userId,

        type:
          "withdraw_rejected",

        amount:
          withdrawData.amount,

        reason:
          data.reason,

        status:
          "rejected",

        createdAt:
          Date.now()
      }
    );

    /* ======================================================
    SAVE NOTIFICATION
    ====================================================== */

    await addDoc(
      collection(
        db,
        "notifications"
      ),
      {
        userId:
          withdrawData.userId,

        title:
          "Withdraw Rejected",

        message:
          `Your withdraw request was rejected. Reason: ${data.reason}`,

        type:
          "withdraw",

        isRead:
          false,

        createdAt:
          Date.now()
      }
    );

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
