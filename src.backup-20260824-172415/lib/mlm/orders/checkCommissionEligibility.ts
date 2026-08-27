import {
  doc,
  getDoc
} from "firebase/firestore";

import { db }
from "@/firebase/config";

interface CheckCommissionEligibilityData {
  userId: string;
}

export async function
checkCommissionEligibility(
  data:
  CheckCommissionEligibilityData
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
        eligible: false
      };
    }

    const userData =
      userSnap.data();

    /* =========================
       CONDITIONS
    ========================= */

    if (
      userData.isBlocked
    ) {

      return {
        eligible: false
      };
    }

    if (
      !userData.mlmJoined
    ) {

      return {
        eligible: false
      };
    }

    if (
      userData.accountStatus !==
      "active"
    ) {

      return {
        eligible: false
      };
    }

    return {
      eligible: true
    };

  } catch (error) {

    console.error(error);

    return {
      eligible: false
    };
  }
}
