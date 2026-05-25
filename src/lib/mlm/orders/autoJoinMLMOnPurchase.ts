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

    const userRef = doc(
      db,
      "users",
      userId
    );

    const userSnap =
      await getDoc(userRef);

    if (!userSnap.exists()) {
      return;
    }

    const userData =
      userSnap.data();

    if (
      userData.mlmJoined
    ) {
      return;
    }

    const referralCode =
      generateReferralCode();

    await updateDoc(
      userRef,
      {
        mlmJoined: true,

        referralCode,

        sponsorId:
          sponsorId || null,

        joinedAt:
          Date.now(),

        rank: "Starter",

        totalEarning: 0,

        walletBalance: 0,

        directReferrals: 0,

        teamBusiness: 0
      }
    );

    if (sponsorId) {

      await updateReferralTree(
        sponsorId,
        userId
      );
    }

    await setDoc(
      doc(
        db,
        "mlmUsers",
        userId
      ),
      {
        userId,

        sponsorId:
          sponsorId || null,

        referralCode,

        active: true,

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
