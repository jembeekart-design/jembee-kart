import {
  addDoc,
  collection,
  doc,
  increment,
  updateDoc
} from "firebase/firestore";

import { db }
from "@/firebase/config";

export async function
createOrderIncome(
  userId: string,
  orderId: string,
  income: number
) {

  try {

    /* =========================
       UPDATE USER WALLET
    ========================= */

    await updateDoc(
      doc(
        db,
        "users",
        userId
      ),
      {
        walletBalance:
          increment(income),

        totalIncome:
          increment(income),

        shoppingIncome:
          increment(income)
      }
    );

    /* =========================
       SAVE INCOME HISTORY
    ========================= */

    await addDoc(
      collection(
        db,
        "orderIncomeHistory"
      ),
      {
        userId,

        orderId,

        income,

        type:
          "shoppingIncome",

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
