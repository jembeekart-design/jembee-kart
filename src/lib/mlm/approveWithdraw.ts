import {
  addDoc,
  collection,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp
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
    if (!data.transactionId?.trim()) {
      return {
        success: false,
        message: "Transaction ID Required"
      };
    }

    /* ======================================================
       GET WITHDRAW REQUEST
    ====================================================== */

    const withdrawRef = doc(
      db,
      "withdraws",
      data.withdrawId
    );

    const withdrawSnapshot =
      await getDoc(withdrawRef);

    if (!withdrawSnapshot.exists()) {
      return {
        success: false,
        message: "Withdraw Request Not Found"
      };
    }

    const withdrawData =
      withdrawSnapshot.data();

    /* ======================================================
       VALIDATE STATUS
    ====================================================== */

    if (
      withdrawData.status !== "pending"
    ) {
      return {
        success: false,
        message:
          "Withdraw Request Already Processed"
      };
    }

    /* ======================================================
       UPDATE WITHDRAW STATUS
    ====================================================== */

    await updateDoc(
      withdrawRef,
      {
        status: "approved",
        transactionId:
          data.transactionId,
        approvedBy:
          data.adminId,
        approvedAt:
          serverTimestamp(),
        updatedAt:
          serverTimestamp()
      }
    );

    /* ======================================================
       UPDATE WALLET STATS
    ====================================================== */

    const walletRef = doc(
      db,
      "wallets",
      withdrawData.userId
    );

    const walletSnapshot =
      await getDoc(walletRef);

    if (walletSnapshot.exists()) {
      const walletData =
        walletSnapshot.data();

      await updateDoc(
        walletRef,
        {
          totalWithdraw:
            Number(
              walletData.totalWithdraw || 0
            ) +
            Number(
              withdrawData.amount || 0
            ),

          updatedAt:
            serverTimestamp()
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

        withdrawId:
          data.withdrawId,

        type:
          "withdraw_approved",

        amount:
          Number(
            withdrawData.amount || 0
          ),

        transactionId:
          data.transactionId,

        approvedBy:
          data.adminId,

        status:
          "success",

        createdAt:
          serverTimestamp()
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
          `Your ₹${withdrawData.amount} withdrawal request has been approved.`,

        type:
          "withdraw",

        isRead:
          false,

        createdAt:
          serverTimestamp()
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
