import {
  doc,
  increment,
  updateDoc
} from "firebase/firestore";

import { db }
from "@/firebase/config";

interface DeductSponsorVideoBudgetData {
  sponsorId: string;

  amount: number;
}

export async function
deductSponsorVideoBudget(
  data:
  DeductSponsorVideoBudgetData
) {

  try {

    await updateDoc(
      doc(
        db,
        "users",
        data.sponsorId
      ),
      {
        walletBalance:
          increment(
            -data.amount
          ),

        sponsoredVideoSpent:
          increment(
            data.amount
          ),

        updatedAt:
          Date.now()
      }
    );

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
