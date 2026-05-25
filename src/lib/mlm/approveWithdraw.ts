import {
  addDoc,
  collection,
  doc,
  getDoc,
  updateDoc
} from "firebase/firestore";

import { db } from "@/firebase/config";

interface ApproveWithdrawData {

  withdrawId: string;

  adminId: string;

  transactionId: string;

}

export async function approveWithdraw(
  data: ApproveWithdrawData
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
    ALREADY APPROVED
    ====================================================== */

    if (
      withdrawData.status ===
      "approved"
    ) {

      return {

        success: false,

        message:
          "Already Approved"

      };

    }

    /* ======================================================
    UPDATE WITHDRAW STATUS
    ====================================================== */

    await updateDoc(
      withdrawRef,
      {
        status:
          "approved",

        transactionId:
          data.transactionId,

        approvedBy:
          data.adminId,

        approvedAt:
          Date.now()
      }
    );

    /* ======================================================
    UPDATE WALLET
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
          totalWithdraw:
            Number(
              walletData.totalWithdraw || 0
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
          "withdraw_approved",

        amount:
          withdrawData.amount,

        transactionId:
          data.transactionId,

        status:
          "success",

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
          "Withdraw Approved",

        message:
          `Your ₹${withdrawData.amount} withdraw request has been approved.`,

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
        "Withdraw Approved Successfully"

    };

  } catch (error) {

    console.error(
      "APPROVE WITHDRAW ERROR:",
      error
    );

    return {

      success: false,

      message:
        "Something went wrong"

    };

  }

}
