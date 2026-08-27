import {
  addDoc,
  collection
} from "firebase/firestore";

import { db }
from "@/firebase/config";

interface CreateOrderHistoryData {
  userId: string;

  orderId: string;

  products: any[];

  totalAmount: number;

  paymentMethod: string;
}

export async function
createOrderHistory(
  data: CreateOrderHistoryData
) {

  try {

    await addDoc(
      collection(
        db,
        "orderHistory"
      ),
      {
        userId:
          data.userId,

        orderId:
          data.orderId,

        products:
          data.products,

        totalAmount:
          data.totalAmount,

        paymentMethod:
          data.paymentMethod,

        status:
          "placed",

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
