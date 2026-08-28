import {
  doc,
  increment,
  updateDoc
} from "firebase/firestore";

import { db }
from "@/firebase/config";

export async function
updateDirectReferrals(
  sponsorId: string
) {

  try {

    await updateDoc(
      doc(
        db,
        "users",
        sponsorId
      ),
      {
        directReferrals:
          increment(1),

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
