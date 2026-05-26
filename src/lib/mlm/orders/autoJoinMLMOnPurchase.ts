import {
  doc,
  getDoc,
  setDoc,
  updateDoc
} from "firebase/firestore";

import { db }
from "@/firebase/config";

import { generateReferralCode }
from "../generateReferralCode";

import { updateReferralTree }
from "../updateReferralTree";

export async function
autoJoinMLMOnPurchase(
  userId: string,
  sponsorId?: string
) {

  try {

    const userRef =
      doc(
        db,
        "users",
        userId
      );

    const userSnap =
      await getDoc(
        userRef
      );

    if (
      !userSnap.exists()
    ) {

      return {
        success: false,
        message:
          "User not found"
      };
    }

    const userData =
      userSnap.data();

    if (
      userData.mlmJoined
    ) {

      return {
        success: false,
        message:
          "Already MLM joined"
      };
    }

    const referralCode =
      generateReferralCode(
        userId
      );

    await updateDoc(
      userRef,
      {
        mlmJoined: true,

        referralCode:
          referralCode,

        sponsorId:
          sponsorId || null,

        joinedAt:
          Date.now(),

        rank:
          "Starter",

        totalEarning: 0,

        walletBalance: 0,

        directReferrals: 0,

        teamBusiness: 0,

        totalOrders: 1,

        active: true
      }
    );

    if (sponsorId) {

      await updateReferralTree({
        sponsorId:
          sponsorId,

        newUserId:
          userId
      });
    }

    await setDoc(
      doc(
        db,
        "mlmUsers",
        userId
      ),
      {
        userId:
          userId,

        sponsorId:
          sponsorId || null,

        referralCode:
          referralCode,

        active: true,

        joinedFrom:
          "product-purchase",

        createdAt:
          Date.now()
      }
    );

    return {
      success: true
    };

  } catch (error) {

    console.error(error);

    return {
      success: false
    };
  }
}
