import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "firebase/firestore";

import { db } from "@/firebase/config";

import { creditWallet } from "./creditWallet";

interface DistributeLevelCommissionData {
  userId: string;
  amount: number;
  orderId: string;
}

export async function distributeLevelCommission(
  data: DistributeLevelCommissionData
) {
  try {

    /* ======================================================
       VALIDATION
    ====================================================== */

    if (!data.userId) {
      return {
        success: false,
        message: "User ID Required"
      };
    }

    if (!data.orderId) {
      return {
        success: false,
        message: "Order ID Required"
      };
    }

    if (
      !data.amount ||
      data.amount <= 0
    ) {
      return {
        success: false,
        message: "Invalid Amount"
      };
    }

    /* ======================================================
       USER
    ====================================================== */

    const userRef = doc(
      db,
      "users",
      data.userId
    );

    const userSnap =
      await getDoc(userRef);

    if (!userSnap.exists()) {
      return {
        success: false,
        message: "User Not Found"
      };
    }

    const userData =
      userSnap.data();

    let sponsorId =
      userData.sponsorId;

    /* ======================================================
       MLM PLAN
    ====================================================== */

    const levels = [
      {
        level: 1,
        percent: 10,
        incomeType:
          "directIncome" as const
      },
      {
        level: 2,
        percent: 5,
        incomeType:
          "levelIncome" as const
      },
      {
        level: 3,
        percent: 2,
        incomeType:
          "levelIncome" as const
      }
    ];

    /* ======================================================
       LOOP LEVELS
    ====================================================== */

    for (const config of levels) {

      if (!sponsorId) {
        break;
      }

      const sponsorRef =
        doc(
          db,
          "users",
          sponsorId
        );

      const sponsorSnap =
        await getDoc(
          sponsorRef
        );

      if (!sponsorSnap.exists()) {
        break;
      }

      const sponsorData =
        sponsorSnap.data();

      /* ======================================================
         DUPLICATE CHECK
      ====================================================== */

      const commissionLogId =
        `${data.orderId}_L${config.level}`;

      const commissionLogRef =
        doc(
          db,
          "commissionLogs",
          commissionLogId
        );

      const existingLog =
        await getDoc(
          commissionLogRef
        );

      if (
        existingLog.exists()
      ) {

        sponsorId =
          sponsorData.sponsorId;

        continue;
      }

      /* ======================================================
         ELIGIBILITY CHECK
      ====================================================== */

      const isEligible =
        sponsorData.mlmActive &&
        sponsorData.joinedPackage;

      if (isEligible) {

        const commission =
          Math.floor(
            (
              data.amount *
              config.percent
            ) / 100
          );

        if (
          commission > 0
        ) {

          await creditWallet({
            uid:
              sponsorId,

            amount:
              commission,

            incomeType:
              config.incomeType
          });

          await setDoc(
            commissionLogRef,
            {
              logId:
                commissionLogId,

              userId:
                sponsorId,

              fromUserId:
                data.userId,

              orderId:
                data.orderId,

              level:
                config.level,

              amount:
                commission,

              incomeType:
                config.incomeType,

              createdAt:
                serverTimestamp()
            }
          );
        }
      }

      /* ======================================================
         NEXT SPONSOR
      ====================================================== */

      sponsorId =
        sponsorData.sponsorId;
    }

    return {
      success: true,
      message:
        "Commission Distributed Successfully"
    };

  } catch (error) {

    console.error(
      "DISTRIBUTE LEVEL COMMISSION ERROR:",
      error
    );

    return {
      success: false,
      message:
        "Something went wrong"
    };
  }
}
