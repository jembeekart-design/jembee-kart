import {
  doc,
  getDoc
} from "firebase/firestore";

import { db }
from "@/firebase/config";

interface CheckWithdrawEligibilityData {
  userId: string;

  amount: number;
}

export async function
checkWithdrawEligibility(
  data:
  CheckWithdrawEligibilityData
) {

  try {

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
        eligible: false,

        reason:
          "User not found"
      };
    }

    const userData =
      userSnap.data();

    /* =========================
       BLOCKED USER
    ========================= */

    if (
      userData.isBlocked
    ) {

      return {
        eligible: false,

        reason:
          "User blocked"
      };
    }

    /* =========================
       KYC CHECK
    ========================= */

    if (
      !userData.kycApproved
    ) {

      return {
        eligible: false,

        reason:
          "KYC not approved"
      };
    }

    /* =========================
       MINIMUM BALANCE
    ========================= */

    if (
      userData.walletBalance <
      data.amount
    ) {

      return {
        eligible: false,

        reason:
          "Insufficient balance"
      };
    }

    /* =========================
       ACCOUNT STATUS
    ========================= */

    if (
      userData.accountStatus !==
      "active"
    ) {

      return {
        eligible: false,

        reason:
          "Inactive account"
      };
    }

    return {
      eligible: true
    };

  } catch (error) {

    console.error(error);

    return {
      eligible: false,

      reason:
        "Server error"
    };
  }
}
