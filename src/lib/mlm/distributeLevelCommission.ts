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
    /* =========================
       VALIDATION
    ========================= */

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

    /* =========================
       BUYER
    ========================= */

    const buyerRef = doc(
      db,
      "users",
      data.userId
    );

    const buyerSnap =
      await getDoc(buyerRef);

    if (!buyerSnap.exists()) {
      return {
        success: false,
        message: "User Not Found"
      };
    }

    const buyerData =
      buyerSnap.data();

    let sponsorId =
      buyerData.sponsorId || "";

    /* =========================
       MLM PLAN
       FIXED COMMISSION
    ========================= */

    const levels = [
      {
        level: 1,
        amount: 20,
        incomeType:
          "directIncome" as const
      },
      {
        level: 2,
        amount: 10,
        incomeType:
          "levelIncome" as const
      },
      {
        level: 3,
        amount: 5,
        incomeType:
          "levelIncome" as const
      },
      {
        level: 4,
        amount: 5,
        incomeType:
          "levelIncome" as const
      }
    ];

    /* =========================
       DISTRIBUTE
    ========================= */

    for (const levelConfig of levels) {
      if (!sponsorId) {
        break;
      }

      const sponsorRef = doc(
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

      /* =========================
         DUPLICATE CHECK
      ========================= */

      const commissionLogId =
        `${data.orderId}_LEVEL_${levelConfig.level}`;

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

      if (existingLog.exists()) {
        sponsorId =
          sponsorData.sponsorId || "";

        continue;
      }

      /* =========================
         ELIGIBILITY CHECK
      ========================= */

      const isActivePartner =
        sponsorData.isActivePartner === true;

      if (isActivePartner) {
        await creditWallet({
          uid: sponsorId,
          amount:
            levelConfig.amount,
          incomeType:
            levelConfig.incomeType
        });

        await setDoc(
          commissionLogRef,
          {
            logId:
              commissionLogId,

            orderId:
              data.orderId,

            fromUserId:
              data.userId,

            userId:
              sponsorId,

            level:
              levelConfig.level,

            amount:
              levelConfig.amount,

            incomeType:
              levelConfig.incomeType,

            status:
              "success",

            createdAt:
              serverTimestamp()
          }
        );
      }

      /* =========================
         NEXT SPONSOR
      ========================= */

      sponsorId =
        sponsorData.sponsorId || "";
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
