import {
  doc,
  getDoc
} from "firebase/firestore";

import { db } from "@/firebase/config";

interface CheckWithdrawEligibilityData {
  userId: string;
  amount: number;
}

export async function checkWithdrawEligibility(
  data: CheckWithdrawEligibilityData
) {
  try {
    /* =========================
       VALIDATION
    ========================= */

    if (!data.userId?.trim()) {
      return {
        eligible: false,
        reason: "User ID Required"
      };
    }

    if (
      typeof data.amount !== "number" ||
      isNaN(data.amount) ||
      data.amount <= 0
    ) {
      return {
        eligible: false,
        reason: "Invalid withdrawal amount"
      };
    }

    /* =========================
       USER
    ========================= */

    const userRef = doc(
      db,
      "users",
      data.userId
    );

    const userSnap =
      await getDoc(userRef);

    if (!userSnap.exists()) {
      return {
        eligible: false,
        reason: "User not found"
      };
    }

    const userData =
      userSnap.data();

    const walletBalance =
      typeof userData.walletBalance ===
      "number"
        ? userData.walletBalance
        : 0;

    const pendingWithdrawal =
      typeof userData.pendingWithdrawal ===
      "number"
        ? userData.pendingWithdrawal
        : 0;

    /* =========================
       APP CONFIG
    ========================= */

    let minimumWithdraw =
      100;

    try {
      const configRef = doc(
        db,
        "settings",
        "appConfig"
      );

      const configSnap =
        await getDoc(configRef);

      if (
        configSnap.exists()
      ) {
        const configData =
          configSnap.data();

        if (
          typeof configData.minimumWithdrawAmount ===
          "number"
        ) {
          minimumWithdraw =
            configData.minimumWithdrawAmount;
        }
      }
    } catch {
      // fallback to default ₹100
    }

    /* =========================
       BLOCKED USER
    ========================= */

    if (
      userData.isBlocked === true
    ) {
      return {
        eligible: false,
        reason: "User blocked"
      };
    }

    /* =========================
       ACTIVE PARTNER
    ========================= */

    if (
      userData.isActivePartner !==
      true
    ) {
      return {
        eligible: false,
        reason:
          "Partner account inactive"
      };
    }

    /* =========================
       MINIMUM WITHDRAW
    ========================= */

    if (
      data.amount <
      minimumWithdraw
    ) {
      return {
        eligible: false,
        reason:
          `Minimum withdrawal amount is ₹${minimumWithdraw}`
      };
    }

    /* =========================
       AVAILABLE BALANCE
    ========================= */

    const availableBalance =
      walletBalance;

    if (
      availableBalance <
      data.amount
    ) {
      return {
        eligible: false,
        reason:
          "Insufficient balance"
      };
    }

    /* =========================
       SUCCESS
    ========================= */

    return {
      eligible: true,

      walletBalance,

      availableBalance,

      pendingWithdrawal,

      minimumWithdraw
    };
  } catch (error) {
    console.error(
      "checkWithdrawEligibility Error:",
      error
    );

    return {
      eligible: false,
      reason:
        "Server error"
    };
  }
}
