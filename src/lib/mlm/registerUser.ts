import {
  collection,
  doc,
  getDocs,
  increment,
  query,
  setDoc,
  updateDoc,
  where
} from "firebase/firestore";

import {
  createUserWithEmailAndPassword
} from "firebase/auth";

import {
  auth,
  db
} from "@/firebase/config";

import { generateReferralCode }
from "./generateReferralCode";

import { giveCommission }
from "./giveCommission";

interface RegisterUserData {

  name: string;

  email: string;

  password: string;

  phone?: string;

  referralCode?: string;

}

export async function registerUser(
  data: RegisterUserData
) {

  try {

    /* ======================================================
    CREATE AUTH USER
    ====================================================== */

    const userCredential =
      await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

    const uid =
      userCredential.user.uid;

    /* ======================================================
    FIND SPONSOR
    ====================================================== */

    let sponsorId:
      string | null = null;

    let sponsorReferralCode:
      string | null = null;

    if (
      data.referralCode
    ) {

      const referralQuery =
        query(
          collection(
            db,
            "users"
          ),

          where(
            "referralCode",
            "==",
            data.referralCode
          )
        );

      const referralSnapshot =
        await getDocs(
          referralQuery
        );

      if (
        !referralSnapshot.empty
      ) {

        sponsorId =
          referralSnapshot
            .docs[0].id;

        sponsorReferralCode =
          data.referralCode;

      }

    }

    /* ======================================================
    GENERATE USER REFERRAL CODE
    ====================================================== */

    const myReferralCode =
      generateReferralCode(
        data.name
      );

    /* ======================================================
    CREATE USER DOCUMENT
    ====================================================== */

    await setDoc(
      doc(
        db,
        "users",
        uid
      ),
      {
        uid,

        name:
          data.name,

        email:
          data.email,

        phone:
          data.phone || "",

        role:
          "user",

        referralCode:
          myReferralCode,

        sponsorId,

        referredBy:
          sponsorReferralCode,

        currentRank:
          "Bronze",

        package:
          "Starter",

        profileImage:
          "",

        isBlocked:
          false,

        totalTeam:
          0,

        directReferrals:
          0,

        joinedAt:
          Date.now()
      }
    );

    /* ======================================================
    CREATE WALLET
    ====================================================== */

    await setDoc(
      doc(
        db,
        "wallets",
        uid
      ),
      {
        userId:
          uid,

        totalBalance:
          0,

        withdrawableBalance:
          0,

        bonusBalance:
          0,

        cashbackBalance:
          0,

        totalEarnings:
          0,

        totalWithdraw:
          0,

        createdAt:
          Date.now()
      }
    );

    /* ======================================================
    CREATE REFERRAL TREE
    ====================================================== */

    await setDoc(
      doc(
        db,
        "referrals",
        uid
      ),
      {
        userId:
          uid,

        sponsorId,

        level1: [],

        level2: [],

        level3: [],

        totalNetwork:
          0,

        createdAt:
          Date.now()
      }
    );

    /* ======================================================
    UPDATE SPONSOR
    ====================================================== */

    if (sponsorId) {

      await updateDoc(
        doc(
          db,
          "users",
          sponsorId
        ),
        {
          totalTeam:
            increment(1),

          directReferrals:
            increment(1)
        }
      );

      /* ======================================================
      GIVE LEVEL 1 COMMISSION
      ====================================================== */

      await giveCommission({
        sponsorId,

        amount: 100,

        level: 1,

        sourceUserId:
          uid
      });

    }

    /* ======================================================
    RETURN SUCCESS
    ====================================================== */

    return {

      success: true,

      uid,

      referralCode:
        myReferralCode

    };

  } catch (error) {

    console.error(
      "REGISTER ERROR:",
      error
    );

    return {

      success: false,

      error

    };

  }

}
