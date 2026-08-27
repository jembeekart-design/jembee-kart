import {
  doc,
  getDoc,
  increment,
  updateDoc
} from "firebase/firestore";

import { db }
from "@/firebase/config";

interface ReverseLevelCommissionData {
  userId: string;

  amount: number;
}

const LEVEL_PERCENTAGES = [
  10,
  5,
  3,
  2,
  1
];

export async function
reverseLevelCommission(
  data:
  ReverseLevelCommissionData
) {

  try {

    let currentUserId =
      data.userId;

    for (
      let level = 0;
      level <
      LEVEL_PERCENTAGES.length;
      level++
    ) {

      const userRef =
        doc(
          db,
          "users",
          currentUserId
        );

      const userSnap =
        await getDoc(
          userRef
        );

      if (
        !userSnap.exists()
      ) {
        break;
      }

      const userData =
        userSnap.data();

      const sponsorId =
        userData.sponsorId;

      if (!sponsorId) {
        break;
      }

      const percentage =
        LEVEL_PERCENTAGES[
          level
        ];

      const commission =
        Math.floor(
          (
            data.amount *
            percentage
          ) / 100
        );

      await updateDoc(
        doc(
          db,
          "users",
          sponsorId
        ),
        {
          walletBalance:
            increment(
              -commission
            ),

          totalIncome:
            increment(
              -commission
            ),

          levelIncome:
            increment(
              -commission
            )
        }
      );

      currentUserId =
        sponsorId;
    }

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
