import {
  doc,
  getDoc
} from "firebase/firestore";

import { db }
from "@/firebase/config";

import { creditWallet }
from "./creditWallet";

interface DistributeLevelCommissionData {

  userId: string;

  amount: number;

}

export async function
distributeLevelCommission(
  data:
  DistributeLevelCommissionData
) {

  try {

    /* =========================
       USER
    ========================= */

    const userRef =
      doc(
        db,
        "users",
        data.userId
      );

    const userSnap =
      await getDoc(
        userRef
      );

    if (
      !userSnap.exists()
    ) {

      return {
        success: false
      };
    }

    const userData =
      userSnap.data();

    const sponsorId =
      userData.sponsorId;

    /* =========================
       LEVEL 1
    ========================= */

    if (sponsorId) {

      const level1Commission =
        Math.floor(
          data.amount * 0.10
        );

      await creditWallet({
        uid:
          sponsorId,

        amount:
          level1Commission,

        incomeType:
          "directIncome"
      });

      /* =========================
         LEVEL 2
      ========================= */

      const level1UserRef =
        doc(
          db,
          "users",
          sponsorId
        );

      const level1UserSnap =
        await getDoc(
          level1UserRef
        );

      if (
        level1UserSnap.exists()
      ) {

        const level1Data =
          level1UserSnap.data();

        const level2SponsorId =
          level1Data.sponsorId;

        if (
          level2SponsorId
        ) {

          const level2Commission =
            Math.floor(
              data.amount * 0.05
            );

          await creditWallet({
            uid:
              level2SponsorId,

            amount:
              level2Commission,

            incomeType:
              "levelIncome"
          });

          /* =========================
             LEVEL 3
          ========================= */

          const level2UserRef =
            doc(
              db,
              "users",
              level2SponsorId
            );

          const level2UserSnap =
            await getDoc(
              level2UserRef
            );

          if (
            level2UserSnap.exists()
          ) {

            const level2Data =
              level2UserSnap.data();

            const level3SponsorId =
              level2Data.sponsorId;

            if (
              level3SponsorId
            ) {

              const level3Commission =
                Math.floor(
                  data.amount * 0.02
                );

              await creditWallet({
                uid:
                  level3SponsorId,

                amount:
                  level3Commission,

                incomeType:
                  "levelIncome"
              });

            }

          }

        }

      }

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
