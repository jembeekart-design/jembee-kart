import {
  addDoc,
  collection
} from "firebase/firestore";

import { db }
from "@/firebase/config";

interface CreateWithdrawTransactionData {
  userId: string;

  amount: number;

  method: string;

  accountNumber?: string;

  upiId?: string;
}

export async function
createWithdrawTransaction(
  data:
  CreateWithdrawTransactionData
) {

  try {

    await addDoc(
      collection(
        db,
        "withdrawTransactions"
      ),
      {
        userId:
          data.userId,

        amount:
          data.amount,

        method:
          data.method,

        accountNumber:
          data.accountNumber ||
          null,

        upiId:
          data.upiId ||
          null,

        status:
          "pending",

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
