import {
  addDoc,
  collection,
  doc,
  getDoc,
  query,
  serverTimestamp,
  updateDoc,
  where,
  getDocs
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
    GET USER
    ====================================================== */

    const userRef =
      doc(
        db,
        "users",
        data.userId
      );

    const userSnapshot =
      await getDoc(
        userRef
      );

    if (
      !userSnapshot.exists()
    ) {

      return {

        success: false,

        message:
          "User Not Found"

      };

    }

    const userData =
      userSnapshot.data();

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

    /* ======================================================
    CHECK EXISTING ENTRY
    ====================================================== */

    const leaderboardQuery =
      query(
        collection(
          db,
          "leaderboards"
        ),

        where(
          "userId",
          "==",
          data.userId
        )
      );

    const leaderboardSnapshot =
      await getDocs(
        leaderboardQuery
      );

    /* ======================================================
    UPDATE EXISTING ENTRY
    ====================================================== */

    if (
      !leaderboardSnapshot.empty
    ) {

      const leaderboardDoc =
        leaderboardSnapshot.docs[0];

      await updateDoc(
        doc(
          db,
          "leaderboards",
          leaderboardDoc.id
        ),
        {
          name:
            userData.name,

          referralCode:
            userData.referralCode,

          currentRank:
            userData.currentRank,

          totalTeam:
            userData.totalTeam || 0,

          totalEarnings:
            walletData.totalEarnings || 0,

          updatedAt:
            serverTimestamp()
        }
      );

      return {

        success: true,

        message:
          "Leaderboard Updated"

      };

    }

    /* ======================================================
    CREATE NEW ENTRY
    ====================================================== */

    await addDoc(
      collection(
        db,
        "leaderboards"
      ),
      {
        userId:
          data.userId,

        name:
          userData.name,

        referralCode:
          userData.referralCode,

        currentRank:
          userData.currentRank,

        totalTeam:
          userData.totalTeam || 0,

        totalEarnings:
          walletData.totalEarnings || 0,

        createdAt:
          serverTimestamp(),

        updatedAt:
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
