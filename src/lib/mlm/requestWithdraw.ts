import {
  addDoc,
  collection,
  doc,
  getDoc,
  updateDoc
} from "firebase/firestore";

import { db } from "@/firebase/config";

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

    if (
      data.amount < 100
    ) {

      return {

        success: false,

        message:
          "Minimum withdraw ₹100"

      };

    }

    /* ======================================================
    GET WALLET
    ====================================================== */

    const walletRef =
      doc(
        db,
        "wallets",
        data.userId
      );

    const walletSnapshot =
      await getDoc(
        walletRef
      );

    if (
      !walletSnapshot.exists()
    ) {

      return {

        success: false,

        message:
          "Wallet Not Found"

      };

    }

    const walletData =
      walletSnapshot.data();

    const withdrawableBalance =
      Number(
        walletData.withdrawableBalance || 0
      );

    /* ======================================================
    CHECK BALANCE
    ====================================================== */

    if (
      withdrawableBalance <
      data.amount
    ) {

      return {

        success: false,

        message:
          "Insufficient Balance"

      };

    }

    /* ======================================================
    CREATE WITHDRAW REQUEST
    ====================================================== */

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
          data.upi,

        status:
          "pending",

        transactionId:
          "",

        adminRemark:
          "",

        createdAt:
          Date.now()
      }
    );

    /* ======================================================
    DEDUCT WALLET BALANCE
    ====================================================== */

    await updateDoc(
      walletRef,
      {
        withdrawableBalance:
          withdrawableBalance -
          data.amount
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
          data.userId,

        type:
          "withdraw",

        amount:
          data.amount,

        status:
          "pending",

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
          data.userId,

        title:
          "Withdraw Requested",

        message:
          `Your withdraw request of ₹${data.amount} is pending approval.`,

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
        "Withdraw Request Submitted"

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
