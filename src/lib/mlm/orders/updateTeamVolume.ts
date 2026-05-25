import {
  doc,
  getDoc,
  increment,
  updateDoc
} from "firebase/firestore";

import { db }
from "@/firebase/config";

export async function
updateTeamVolume(
  userId: string,
  amount: number
) {

  try {

    let currentUserId =
      userId;

    for (
      let level = 0;
      level < 20;
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
          teamVolume:
            increment(amount),

          lifetimeVolume:
            increment(amount),

          updatedAt:
            Date.now()
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
