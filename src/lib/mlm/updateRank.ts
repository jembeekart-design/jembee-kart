import {
  doc,
  getDoc,
  updateDoc
} from "firebase/firestore";

import { db } from "@/firebase/config";

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

    /* ======================================================
    GET USER
    ====================================================== */

    const userRef =
      doc(
        db,
        "users",
        userId
      );

    const userSnapshot =
      await getDoc(
        userRef
      );

    if (
      !userSnapshot.exists()
    ) {

      console.log(
        "User Not Found"
      );

      return;

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

    let rankBonus =
      0;

    MLM_RANKS.forEach(
      (rankData) => {

        if (
          totalTeam >=
          rankData.requiredTeam
        ) {

          newRank =
            rankData.rank;

          rankBonus =
            rankData.bonus;

        }

      }
    );

    /* ======================================================
    SAME RANK
    ====================================================== */

    if (
      newRank === currentRank
    ) {

      console.log(
        "Rank Already Updated"
      );

      return;

    }

    /* ======================================================
    UPDATE USER RANK
    ====================================================== */

    await updateDoc(
      userRef,
      {
        currentRank:
          newRank
      }
    );

    /* ======================================================
    UPDATE BONUS WALLET
    ====================================================== */

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

      const walletData =
        walletSnapshot.data();

      await updateDoc(
        walletRef,
        {
          bonusBalance:
            Number(
              walletData.bonusBalance || 0
            ) + rankBonus,

          totalBalance:
            Number(
              walletData.totalBalance || 0
            ) + rankBonus,

          totalEarnings:
            Number(
              walletData.totalEarnings || 0
            ) + rankBonus
        }
      );

    }

    /* ======================================================
    SAVE NOTIFICATION
    ====================================================== */

    const notificationRef =
      doc(
        db,
        "notifications",
        `${userId}_${Date.now()}`
      );

    await updateDoc(
      notificationRef,
      {
        userId,

        title:
          "Rank Upgraded",

        message:
          `Congratulations! Your new MLM rank is ${newRank}`,

        type:
          "rank",

        isRead:
          false,

        createdAt:
          Date.now()
      }
    );

    console.log(
      "Rank Updated Successfully"
    );

  } catch (error) {

    console.error(
      "RANK UPDATE ERROR:",
      error
    );

  }

}
