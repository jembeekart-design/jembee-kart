import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
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
       VALIDATION
    ====================================================== */

    if (!data.name?.trim()) {
      return {
        success: false,
        message: "Name Required"
      };
    }

    if (!data.email?.trim()) {
      return {
        success: false,
        message: "Email Required"
      };
    }

    if (
      !data.password ||
      data.password.length < 6
    ) {
      return {
        success: false,
        message:
          "Password must be at least 6 characters"
      };
    }

    /* ======================================================
       FIND SPONSOR
    ====================================================== */

    let sponsorId:
      string | null = null;

    let sponsorReferralCode:
      string | null = null;

    if (data.referralCode?.trim()) {

      const referralQuery =
        query(
          collection(
            db,
            "users"
          ),
          where(
            "referralCode",
            "==",
            data.referralCode.trim()
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
          referralSnapshot.docs[0].id;

        sponsorReferralCode =
          data.referralCode.trim();
      }
    }

    /* ======================================================
       CREATE AUTH USER
    ====================================================== */

    const userCredential =
      await createUserWithEmailAndPassword(
        auth,
        data.email.trim(),
        data.password
      );

    const uid =
      userCredential.user.uid;

    /* ======================================================
       GENERATE UNIQUE REFERRAL CODE
    ====================================================== */

    let myReferralCode = "";

    let isUnique = false;

    while (!isUnique) {

      myReferralCode =
        generateReferralCode(
          data.name
        );

      const codeQuery =
        query(
          collection(
            db,
            "users"
          ),
          where(
            "referralCode",
            "==",
            myReferralCode
          )
        );

      const codeSnapshot =
        await getDocs(
          codeQuery
        );

      if (
        codeSnapshot.empty
      ) {
        isUnique = true;
      }
    }

    /* ======================================================
       CREATE USER
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
          data.name.trim(),

        email:
          data.email.trim(),

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
          null,

        profileImage:
          "",

        isBlocked:
          false,

        isKYCVerified:
          false,

        kycStatus:
          "not_submitted",

        totalTeam:
          0,

        directReferrals:
          0,

        totalOrders:
          0,

        totalSpent:
          0,

        joinedAt:
          serverTimestamp(),

        createdAt:
          serverTimestamp(),

        updatedAt:
          serverTimestamp()
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

        pendingWithdraw:
          0,

        createdAt:
          serverTimestamp(),

        updatedAt:
          serverTimestamp()
      }
    );

    /* ======================================================
       CREATE REFERRAL RECORD
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

        totalNetwork:
          0,

        createdAt:
          serverTimestamp(),

        updatedAt:
          serverTimestamp()
      }
    );

    /* ======================================================
       SUCCESS
    ====================================================== */

    return {
      success: true,

      uid,

      referralCode:
        myReferralCode,

      message:
        "Registration Successful"
    };

  } catch (error) {

    console.error(
      "REGISTER ERROR:",
      error
    );

    return {
      success: false,
      message:
        "Registration Failed",
      error
    };
  }
}
