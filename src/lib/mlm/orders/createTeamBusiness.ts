import {
  doc,
  getDoc,
  increment,
  updateDoc
} from "firebase/firestore";

import { db }
from "@/firebase/config";

export async function
createTeamBusiness(
  userId: string,
  businessAmount: number
) {

  try {

    let currentUserId =
      userId;

    for (
      let level = 0;
      level < 10;
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

      await updateDoc(
        doc(
          db,
          "users",
          sponsorId
        ),
        {
          teamBusiness:
            increment(
              businessAmount
            ),

          monthlyBusiness:
            increment(
              businessAmount
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
