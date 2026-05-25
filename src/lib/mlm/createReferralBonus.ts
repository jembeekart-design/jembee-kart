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
    CHECK SPONSOR
    ====================================================== */

    const sponsorRef =
      doc(
        db,
        "users",
        data.sponsorId
      );

    const sponsorSnapshot =
      await getDoc(
        sponsorRef
      );

    if (
      !sponsorSnapshot.exists()
    ) {

      return {

        success: false,

        message:
          "Sponsor Not Found"

      };

    }

    /* ======================================================
    CHECK WALLET
    ====================================================== */

    const walletRef =
      doc(
        db,
        "wallets",
        data.sponsorId
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

    /* ======================================================
    UPDATE WALLET
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
          )
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
          increment(1)
      }
    );

    /* ======================================================
    SAVE BONUS RECORD
    ====================================================== */

    await addDoc(
      collection(
        db,
        "referral_bonuses"
      ),
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
          Date.now()
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
          Date.now()
      }
    );

    /* ======================================================
    CREATE NOTIFICATION
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

      message:
        "Referral Bonus Added"

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
