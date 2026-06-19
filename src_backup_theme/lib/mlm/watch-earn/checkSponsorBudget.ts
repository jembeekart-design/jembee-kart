import {
  doc,
  getDoc
} from "firebase/firestore";

import { db }
from "@/firebase/config";

interface CheckSponsorBudgetData {
  sponsorId: string;

  requiredAmount: number;
}

export async function
checkSponsorBudget(
  data:
  CheckSponsorBudgetData
) {

  try {

    const sponsorRef =
      doc(
        db,
        "users",
        data.sponsorId
      );

    const sponsorSnap =
      await getDoc(
        sponsorRef
      );

    if (
      !sponsorSnap.exists()
    ) {

      return {
        success: false,

        message:
          "Sponsor not found"
      };
    }

    const sponsorData =
      sponsorSnap.data();

    const walletBalance =
      sponsorData.walletBalance || 0;

    if (
      walletBalance <
      data.requiredAmount
    ) {

      return {
        success: false,

        message:
          "Insufficient balance"
      };
    }

    return {
      success: true
    };

  } catch (error) {

    console.error(error);

    return {
      success: false,

      message:
        "Server error"
    };
  }
}
