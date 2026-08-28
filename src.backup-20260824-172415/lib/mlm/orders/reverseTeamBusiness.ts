import {
  doc,
  getDoc,
  increment,
  updateDoc
} from "firebase/firestore";

import { db }
from "@/firebase/config";

interface ReverseTeamBusinessData {
  userId: string;

  amount: number;
}

export async function
reverseTeamBusiness(
  data:
  ReverseTeamBusinessData
) {

  try {

    let currentUserId =
      data.userId;

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
              -data.amount
            ),

          monthlyBusiness:
            increment(
              -data.amount
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
