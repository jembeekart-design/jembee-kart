import {
  addDoc,
  collection
} from "firebase/firestore";

import { db }
from "@/firebase/config";

interface CreateOrderTransactionData {
  userId: string;

  orderId: string;

  amount: number;

  type: string;

  description: string;
}

export async function
createOrderTransaction(
  data: CreateOrderTransactionData
) {

  try {

    await addDoc(
      collection(
        db,
        "transactions"
      ),
      {
        userId:
          data.userId,

        orderId:
          data.orderId,

        amount:
          data.amount,

        type:
          data.type,

        description:
          data.description,

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
