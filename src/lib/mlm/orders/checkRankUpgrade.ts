import {
  doc,
  getDoc,
  updateDoc
} from "firebase/firestore";

import { db }
from "@/firebase/config";

const ranks = [
  {
    name: "Starter",
    business: 0
  },

  {
    name: "Bronze",
    business: 10000
  },

  {
    name: "Silver",
    business: 50000
  },

  {
    name: "Gold",
    business: 100000
  },

  {
    name: "Diamond",
    business: 500000
  }
];

export async function
checkRankUpgrade(
  userId: string
) {

  try {

    const userRef = doc(
      db,
      "users",
      userId
    );

    const userSnap =
      await getDoc(userRef);

    if (!userSnap.exists()) {
      return;
    }

    const userData =
      userSnap.data();

    const teamBusiness =
      userData.teamBusiness || 0;

    let newRank =
      "Starter";

    for (
      const rank of ranks
    ) {

      if (
        teamBusiness >=
        rank.business
      ) {

        newRank =
          rank.name;
      }
    }

    if (
      newRank !==
      userData.rank
    ) {

      await updateDoc(
        userRef,
        {
          rank: newRank,

          rankUpdatedAt:
            Date.now()
        }
      );
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
