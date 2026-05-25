import {
  doc,
  getDoc,
  updateDoc,
  addDoc,
  collection
} from "firebase/firestore";

import { db } from "@/firebase/config";

import { distributeLevelCommission }
from "../distributeLevelCommission";

import { creditWallet }
from "../creditWallet";

export async function
completeOrderAndDistributeCommission(
  orderId: string
) {

  try {

    const orderRef = doc(
      db,
      "orders",
      orderId
    );

    const orderSnap =
      await getDoc(orderRef);

    if (!orderSnap.exists()) {
      throw new Error(
        "Order not found"
      );
    }

    const order =
      orderSnap.data();

    if (
      order.status ===
      "completed"
    ) {
      return;
    }

    await updateDoc(
      orderRef,
      {
        status: "completed",
        completedAt:
          Date.now()
      }
    );

    const userId =
      order.userId;

    const amount =
      order.totalAmount || 0;

    const cashback =
      Math.floor(
        amount * 0.05
      );

    await creditWallet(
      userId,
      cashback,
      "Cashback Income"
    );

    await distributeLevelCommission(
      userId,
      amount
    );

    await addDoc(
      collection(
        db,
        "orderIncomeHistory"
      ),
      {
        userId,
        orderId,
        amount,
        cashback,
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
