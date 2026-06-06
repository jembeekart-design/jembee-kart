import {
  doc,
  getDoc,
  updateDoc,
  addDoc,
  collection,
  serverTimestamp
} from "firebase/firestore";

import { db } from "@/firebase/config";

import { distributeLevelCommission } from "../distributeLevelCommission";
import { creditWallet } from "../creditWallet";

export async function completeOrderAndDistributeCommission(
  orderId: string
) {
  try {
    const orderRef = doc(db, "orders", orderId);

    const orderSnap = await getDoc(orderRef);

    if (!orderSnap.exists()) {
      throw new Error("Order not found");
    }

    const order = orderSnap.data();

    if (order.status === "completed") {
      return {
        success: false,
        message: "Order already completed"
      };
    }

    if (order.commissionDistributed === true) {
      return {
        success: false,
        message: "Commission already distributed"
      };
    }

    const userId = order.userId;
    const amount = Number(order.totalAmount || 0);

    if (!userId || amount <= 0) {
      throw new Error("Invalid order data");
    }

    const cashback = Math.floor(amount * 0.05);

    await updateDoc(orderRef, {
      status: "completed",
      commissionDistributed: true,
      completedAt: serverTimestamp()
    });

    await creditWallet({
      uid: userId,
      amount: cashback,
      incomeType: "cashback"
    });

    await distributeLevelCommission({
      userId,
      amount,
      orderId
    });

    await addDoc(
      collection(db, "orderIncomeHistory"),
      {
        userId,
        orderId,
        amount,
        cashback,
        createdAt: serverTimestamp()
      }
    );

    return {
      success: true,
      cashback,
      amount
    };
  } catch (error: any) {
    console.error(
      "completeOrderAndDistributeCommission Error:",
      error
    );

    return {
      success: false,
      message:
        error?.message ||
        "Failed to complete order"
    };
  }
}
