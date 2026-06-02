import {
  addDoc,
  collection,
  doc,
  getDoc,
  increment,
  serverTimestamp,
  updateDoc
} from "firebase/firestore";

import { db } from "@/firebase/config";

import { createNotification } from "./createNotification";

interface RankData {
  rank: string;
  requiredTeam: number;
  bonus: number;
}

const MLM_RANKS: RankData[] = [
  {
    rank: "Bronze",
    requiredTeam: 0,
    bonus: 0
  },
  {
    rank: "Silver",
    requiredTeam: 25,
    bonus: 500
  },
  {
    rank: "Gold",
    requiredTeam: 100,
    bonus: 2000
  },
  {
    rank: "Diamond",
    requiredTeam: 300,
    bonus: 10000
  },
  {
    rank: "Crown",
    requiredTeam: 1000,
    bonus: 50000
  }
];

export async function updateRank(
  userId: string
) {
  try {

    if (!userId?.trim()) {
      return {
        success: false,
        message: "User ID Required"
      };
    }

    /* ======================================================
       USER
    ====================================================== */

    const userRef = doc(
      db,
      "users",
      userId
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

    const totalTeam =
      Number(
        userData.totalTeam || 0
      );

    const currentRank =
      userData.currentRank ||
      "Bronze";

    /* ======================================================
       FIND NEW RANK
    ====================================================== */

    let newRank =
      currentRank;

    let rankBonus = 0;

    for (const rank of MLM_RANKS) {

      if (
        totalTeam >=
        rank.requiredTeam
      ) {
        newRank =
          rank.rank;

        rankBonus =
          rank.bonus;
      }
    }

    /* ======================================================
       SAME RANK
    ====================================================== */

    if (
      newRank === currentRank
    ) {
      return {
        success: true,
        message:
          "Rank Already Updated"
      };
    }

    /* ======================================================
       UPDATE USER
    ====================================================== */

    await updateDoc(
      userRef,
      {
        currentRank:
          newRank,

        updatedAt:
          serverTimestamp()
      }
    );

    /* ======================================================
       BONUS
    ====================================================== */

    if (rankBonus > 0) {

      const walletRef =
        doc(
          db,
          "wallets",
          userId
        );

      const walletSnapshot =
        await getDoc(
          walletRef
        );

      if (
        walletSnapshot.exists()
      ) {

        await updateDoc(
          walletRef,
          {
            bonusBalance:
              increment(
                rankBonus
              ),

            totalBalance:
              increment(
                rankBonus
              ),

            totalEarnings:
              increment(
                rankBonus
              ),

            updatedAt:
              serverTimestamp()
          }
        );
      }

      await addDoc(
        collection(
          db,
          "transactions"
        ),
        {
          userId,

          type:
            "rank_bonus",

          rank:
            newRank,

          amount:
            rankBonus,

          status:
            "success",

          createdAt:
            serverTimestamp()
        }
      );
    }

    /* ======================================================
       NOTIFICATION
    ====================================================== */

    await createNotification({
      userId,

      title:
        "Rank Upgraded",

      message:
        `Congratulations! Your new rank is ${newRank}.`,

      type:
        "rank"
    });

    return {
      success: true,
      rank:
        newRank,
      bonus:
        rankBonus
    };

  } catch (error) {

    console.error(
      "RANK UPDATE ERROR:",
      error
    );

    return {
      success: false,
      message:
        "Something went wrong"
    };
  }
}
