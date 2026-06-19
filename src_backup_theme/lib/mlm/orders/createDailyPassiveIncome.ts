import {
  addDoc,
  collection,
  doc,
  increment,
  updateDoc
} from "firebase/firestore";

import { db }
from "@/firebase/config";

interface CreateDailyPassiveIncomeData {
  userId: string;

  amount: number;
}

export async function
createDailyPassiveIncome(
  data:
  CreateDailyPassiveIncomeData
) {

  try {

    /* =========================
       UPDATE USER
    ========================= */

    await updateDoc(
      doc(
        db,
        "users",
        data.userId
      ),
      {
        walletBalance:
          increment(
            data.amount
          ),

        totalIncome:
          increment(
            data.amount
          ),

        passiveIncome:
          increment(
            data.amount
          )
      }
    );

    /* =========================
       SAVE HISTORY
    ========================= */

    await addDoc(
      collection(
        db,
        "dailyPassiveIncomeHistory"
      ),
      {
        userId:
          data.userId,

        amount:
          data.amount,

        createdAt:
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
