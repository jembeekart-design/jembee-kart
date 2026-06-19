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

import { createNotification }
from "./createNotification";

interface GiveCommissionData {
  sponsorId: string;
  amount: number;
  level: number;
  sourceUserId: string;
}

export async function giveCommission(
  data: GiveCommissionData
) {
  try {

    /* ======================================================
       VALIDATION
    ====================================================== */

    if (!data.sponsorId) {
      return {
        success: false,
        message: "Sponsor ID Required"
      };
    }

    if (
      !data.amount ||
      data.amount <= 0
    ) {
      return {
        success: false,
        message: "Invalid Amount"
      };
    }

    /* ======================================================
       USER
    ====================================================== */

    const sponsorRef = doc(
      db,
      "users",
      data.sponsorId
    );

    const sponsorSnapshot =
      await getDoc(
        sponsorRef
      );

    if (!sponsorSnapshot.exists()) {
      return {
        success: false,
        message: "Sponsor Not Found"
      };
    }

    const sponsorData =
      sponsorSnapshot.data();

    if (sponsorData.isBlocked) {
      return {
        success: false,
        message: "User Blocked"
      };
    }

    /* ======================================================
       WALLET
    ====================================================== */

    const walletRef = doc(
      db,
      "wallets",
      data.sponsorId
    );

    const walletSnapshot =
      await getDoc(
        walletRef
      );

    if (!walletSnapshot.exists()) {
      return {
        success: false,
        message: "Wallet Not Found"
      };
    }

    /* ======================================================
       CREDIT WALLET
    ====================================================== */

    await updateDoc(
      walletRef,
      {
        totalBalance:
          increment(data.amount),

        withdrawableBalance:
          increment(data.amount),

        totalEarnings:
          increment(data.amount),

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
          data.sponsorId,

        amount:
          data.amount,

        level:
          data.level,

        type:
          "commission",

        sourceUserId:
          data.sourceUserId,

        status:
          "success",

        createdAt:
          serverTimestamp()
      }
    );

    /* ======================================================
       NOTIFICATION
    ====================================================== */

    await createNotification({
      userId:
        data.sponsorId,

      title:
        `Level ${data.level} Commission`,

      message:
        `You received ₹${data.amount} commission income.`,

      type:
        "commission"
    });

    return {
      success: true,
      message:
        "Commission Added Successfully"
    };

  } catch (error) {

    console.error(
      "COMMISSION ERROR:",
      error
    );

    return {
      success: false,
      message:
        "Something went wrong"
    };
  }
}
