import {
  collection,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  increment
} from "firebase/firestore";

import { db } from "@/firebase/config";

interface DistributeCommissionData {

  userId: string;

  packageAmount: number;

}

export async function distributeLevelCommission(
  data: DistributeCommissionData
) {

  try {

    /* ======================================================
    COMMISSION PERCENTAGES
    ====================================================== */

    const commissions = [

      {
        level: 1,
        percent: 10
      },

      {
        level: 2,
        percent: 5
      },

      {
        level: 3,
        percent: 2
      }

    ];

    /* ======================================================
    START USER
    ====================================================== */

    let currentUserId =
      data.userId;

    /* ======================================================
    LOOP LEVELS
    ====================================================== */

    for (
      let i = 0;
      i < commissions.length;
      i++
    ) {

      const currentLevel =
        commissions[i];

      /* ======================================================
      GET CURRENT USER
      ====================================================== */

      const userRef =
        doc(
          db,
          "users",
          currentUserId
        );

      const userSnapshot =
        await getDoc(
          userRef
        );

      if (
        !userSnapshot.exists()
      ) {

        break;

      }

      const userData =
        userSnapshot.data();

      const sponsorId =
        userData.sponsorId;

      /* ======================================================
      NO SPONSOR
      ====================================================== */

      if (!sponsorId) {

        break;

      }

      /* ======================================================
      CALCULATE COMMISSION
      ====================================================== */

      const commissionAmount =
        Math.floor(
          (
            data.packageAmount *
            currentLevel.percent
          ) / 100
        );

      /* ======================================================
      UPDATE SPONSOR WALLET
      ====================================================== */

      const walletRef =
        doc(
          db,
          "wallets",
          sponsorId
        );

      await updateDoc(
        walletRef,
        {
          totalBalance:
            increment(
              commissionAmount
            ),

          withdrawableBalance:
            increment(
              commissionAmount
            ),

          totalEarnings:
            increment(
              commissionAmount
            )
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
            sponsorId,

          sourceUserId:
            data.userId,

          type:
            "level_commission",

          level:
            currentLevel.level,

          percent:
            currentLevel.percent,

          amount:
            commissionAmount,

          status:
            "success",

          createdAt:
            Date.now()
        }
      );

      /* ======================================================
      SAVE NOTIFICATION
      ====================================================== */

      await addDoc(
        collection(
          db,
          "notifications"
        ),
        {
          userId:
            sponsorId,

          title:
            `Level ${currentLevel.level} Income`,

          message:
            `You received ₹${commissionAmount} level income.`,

          type:
            "commission",

          isRead:
            false,

          createdAt:
            Date.now()
        }
      );

      /* ======================================================
      NEXT LEVEL
      ====================================================== */

      currentUserId =
        sponsorId;

    }

    return {

      success: true,

      message:
        "Level Commission Distributed"

    };

  } catch (error) {

    console.error(
      "LEVEL COMMISSION ERROR:",
      error
    );

    return {

      success: false,

      message:
        "Something went wrong"

    };

  }

}
