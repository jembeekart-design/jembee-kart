import {
  addDoc,
  collection,
  doc,
  getDoc,
  increment,
  updateDoc,
  serverTimestamp
} from "firebase/firestore";

import { db } from "@/firebase/config";

import { createNotification } from "./createNotification";

interface PayoutRequestData {
  userId: string;

  amount: number;

  method:
    | "upi"
    | "bank";

  upiId?: string;

  accountNumber?: string;

  ifscCode?: string;

  accountHolderName?: string;
}

export async function createPayoutRequest(
  data: PayoutRequestData
) {
  try {

    /* ======================================================
       VALIDATION
    ====================================================== */

    if (!data.userId) {
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
        message: "Minimum Payout ₹100"
      };
    }

    if (
      data.method === "upi" &&
      !data.upiId?.trim()
    ) {
      return {
        success: false,
        message: "UPI ID Required"
      };
    }

    if (
      data.method === "bank"
    ) {
      if (
        !data.accountNumber?.trim() ||
        !data.ifscCode?.trim() ||
        !data.accountHolderName?.trim()
      ) {
        return {
          success: false,
          message:
            "Complete Bank Details Required"
        };
      }
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
        message: "User Not Found"
      };
    }

    const userData =
      userSnapshot.data();

    if (
      !userData.isKYCVerified
    ) {
      return {
        success: false,
        message:
          "Complete KYC First"
      };
    }

    if (
      userData.isBlocked
    ) {
      return {
        success: false,
        message:
          "Account Blocked"
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
       CREATE PAYOUT REQUEST
    ====================================================== */

    const payoutRef =
      await addDoc(
        collection(
          db,
          "payout_requests"
        ),
        {
          userId:
            data.userId,

          amount:
            Number(
              data.amount
            ),

          method:
            data.method,

          upiId:
            data.upiId || "",

          accountNumber:
            data.accountNumber || "",

          ifscCode:
            data.ifscCode || "",

          accountHolderName:
            data.accountHolderName || "",

          status:
            "pending",

          adminRemark:
            "",

          transactionId:
            "",

          createdAt:
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

        payoutRequestId:
          payoutRef.id,

        type:
          "payout_request",

        amount:
          data.amount,

        method:
          data.method,

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
        "Payout Requested",

      message:
        `Your payout request of ₹${data.amount} has been submitted.`,

      type:
        "withdraw"
    });

    return {
      success: true,

      payoutRequestId:
        payoutRef.id,

      message:
        "Payout Request Created Successfully"
    };

  } catch (error) {

    console.error(
      "PAYOUT REQUEST ERROR:",
      error
    );

    return {
      success: false,

      message:
        "Something went wrong"
    };
  }
}
