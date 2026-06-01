import {
  doc,
  getDoc,
  updateDoc,
  addDoc,
  collection
} from "firebase/firestore";

import { db } from "@/firebase/config";

import { distributeLevelCommission } from "../distributeLevelCommission";

import { creditWallet } from "../creditWallet";

export async function completeOrderAndDistributeCommission(
  orderId: string
) {
  try {
    /* =========================
       ORDER REF
    ========================= */

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

    /* =========================
       ALREADY COMPLETED
    ========================= */

    if (
      order.status ===
      "completed"
    ) {
      return {
        success: false,
        message:
          "Order already completed"
      };
    }

    /* =========================
       UPDATE ORDER
    ========================= */

    await updateDoc(
      orderRef,
      {
        status: "completed",
        completedAt:
          Date.now()
      }
    );

    /* =========================
       ORDER DETAILS
    ========================= */

    const userId =
      order.userId;

    const amount =
      order.totalAmount || 0;

    const cashback =
      Math.floor(
        amount * 0.05
      );

    /* =========================
       CREDIT CASHBACK
    ========================= */

    await creditWallet({
      uid: userId,
      amount: cashback,
      incomeType:
        "rewardIncome"
    });

    /* =========================
       MLM COMMISSION
    ========================= */

    await distributeLevelCommission({
      userId: userId,
      amount: amount,
      orderId: orderId
    });

    /* =========================
       SAVE HISTORY
    ========================= */

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
