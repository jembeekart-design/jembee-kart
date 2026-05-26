import {
  doc,
  increment,
  updateDoc
} from "firebase/firestore";

import { db }
from "@/firebase/config";

interface ReleaseHoldAmountData {
  userId: string;

  amount: number;
}

export async function
releaseHoldAmount(
  data:
  ReleaseHoldAmountData
) {

  try {

    await updateDoc(
      doc(
        db,
        "users",
        data.userId
      ),
      {
        holdBalance:
          increment(
            -data.amount
          )
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
