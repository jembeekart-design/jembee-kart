import {
  addDoc,
  collection,
  doc,
  getDoc,
  increment,
  serverTimestamp,
  setDoc,
  updateDoc
} from "firebase/firestore";

import { db } from "@/firebase/config";

import { createNotification } from "./createNotification";

interface ReferralBonusData {
  sponsorId: string;
  newUserId: string;
  bonusAmount: number;
}

export async function createReferralBonus(
  data: ReferralBonusData
) {
  try {

    /* ======================================================
       VALIDATION
    ====================================================== */

    if (!data.sponsorId?.trim()) {
      return {
        success: false,
        message: "Sponsor ID Required"
      };
    }

    if (!data.newUserId?.trim()) {
      return {
        success: false,
        message: "New User ID Required"
      };
    }

    if (
      data.sponsorId ===
      data.newUserId
    ) {
      return {
        success: false,
        message:
          "Invalid Referral Relationship"
      };
    }

    if (
      !data.bonusAmount ||
      data.bonusAmount <= 0
    ) {
      return {
        success: false,
        message:
          "Invalid Bonus Amount"
      };
    }

    /* ======================================================
       UNIQUE BONUS DOC
    ====================================================== */

    const bonusDocId =
      `${data.sponsorId}_${data.newUserId}`;

    const bonusRef = doc(
      db,
      "referral_bonuses",
      bonusDocId
    );

    const bonusSnapshot =
      await getDoc(
        bonusRef
      );

    if (bonusSnapshot.exists()) {
      return {
        success: false,
        message:
          "Referral Bonus Already Paid"
      };
    }

    /* ======================================================
       SPONSOR
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
        message:
          "Sponsor Not Found"
      };
    }

    const sponsorData =
      sponsorSnapshot.data();

    if (sponsorData.isBlocked) {
      return {
        success: false,
        message:
          "Sponsor Account Blocked"
      };
    }

    /* ======================================================
       NEW USER
    ====================================================== */

    const newUserRef = doc(
      db,
      "users",
      data.newUserId
    );

    const newUserSnapshot =
      await getDoc(
        newUserRef
      );

    if (!newUserSnapshot.exists()) {
      return {
        success: false,
        message:
          "New User Not Found"
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
        message:
          "Wallet Not Found"
      };
    }

    /* ======================================================
       CREDIT WALLET
    ====================================================== */

    await updateDoc(
      walletRef,
      {
        totalBalance:
          increment(
            data.bonusAmount
          ),

        withdrawableBalance:
          increment(
            data.bonusAmount
          ),

        totalEarnings:
          increment(
            data.bonusAmount
          ),

        referralIncome:
          increment(
            data.bonusAmount
          ),

        updatedAt:
          serverTimestamp()
      }
    );

    /* ======================================================
       UPDATE USER STATS
    ====================================================== */

    await updateDoc(
      sponsorRef,
      {
        directReferrals:
          increment(1),

        totalTeam:
          increment(1),

        updatedAt:
          serverTimestamp()
      }
    );

    /* ======================================================
       SAVE REFERRAL BONUS
    ====================================================== */

    await setDoc(
      bonusRef,
      {
        sponsorId:
          data.sponsorId,

        newUserId:
          data.newUserId,

        amount:
          data.bonusAmount,

        status:
          "success",

        createdAt:
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

        sourceUserId:
          data.newUserId,

        type:
          "referral_bonus",

        amount:
          data.bonusAmount,

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
        "Referral Bonus Earned",

      message:
        `You received ₹${data.bonusAmount} referral bonus from a new joining.`,

      type:
        "commission"
    });

    return {
      success: true,
      amount:
        data.bonusAmount,
      message:
        "Referral Bonus Added Successfully"
    };

  } catch (error) {

    console.error(
      "REFERRAL BONUS ERROR:",
      error
    );

    return {
      success: false,
      message:
        "Something went wrong"
    };
  }
}
