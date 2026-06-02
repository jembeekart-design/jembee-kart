import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "firebase/firestore";

import { db } from "@/firebase/config";

interface LeaderboardData {
  userId: string;
}

export async function createLeaderboardEntry(
  data: LeaderboardData
) {
  try {

    /* ======================================================
       VALIDATION
    ====================================================== */

    if (!data.userId?.trim()) {
      return {
        success: false,
        message: "User ID Required"
      };
    }

    /* ======================================================
       GET USER
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

    /* ======================================================
       GET WALLET
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
        message: "Wallet Not Found"
      };
    }

    const walletData =
      walletSnapshot.data();

    /* ======================================================
       LEADERBOARD DOC
       DOC ID = USER ID
    ====================================================== */

    const leaderboardRef =
      doc(
        db,
        "leaderboards",
        data.userId
      );

    const leaderboardSnapshot =
      await getDoc(
        leaderboardRef
      );

    /* ======================================================
       LEADERBOARD DATA
    ====================================================== */

    const leaderboardData = {
      userId:
        data.userId,

      name:
        userData.name || "",

      referralCode:
        userData.referralCode || "",

      profilePhoto:
        userData.photoURL || "",

      currentRank:
        userData.currentRank || "Member",

      rankLevel:
        Number(
          userData.rankLevel || 0
        ),

      totalTeam:
        Number(
          userData.totalTeam || 0
        ),

      directReferrals:
        Number(
          userData.directReferrals || 0
        ),

      activeTeam:
        Number(
          userData.activeTeam || 0
        ),

      totalEarnings:
        Number(
          walletData.totalEarnings || 0
        ),

      lifetimeEarnings:
        Number(
          walletData.totalEarnings || 0
        ),

      monthlyEarnings:
        Number(
          walletData.monthlyEarnings || 0
        ),

      updatedAt:
        serverTimestamp()
    };

    /* ======================================================
       CREATE / UPDATE
    ====================================================== */

    if (
      leaderboardSnapshot.exists()
    ) {

      await setDoc(
        leaderboardRef,
        leaderboardData,
        {
          merge: true
        }
      );

      return {
        success: true,
        message:
          "Leaderboard Updated"
      };
    }

    await setDoc(
      leaderboardRef,
      {
        ...leaderboardData,

        createdAt:
          serverTimestamp()
      }
    );

    return {
      success: true,
      message:
        "Leaderboard Entry Created"
    };

  } catch (error) {

    console.error(
      "LEADERBOARD ERROR:",
      error
    );

    return {
      success: false,
      message:
        "Something went wrong"
    };
  }
}
