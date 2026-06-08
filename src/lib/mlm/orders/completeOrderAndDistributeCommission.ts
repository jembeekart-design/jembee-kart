import {
  doc,
  getDoc,
  updateDoc,
  addDoc,
  collection,
  increment,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/firebase/config";

import { distributeLevelCommission } from "../distributeLevelCommission";
import { creditWallet } from "../creditWallet";

export async function completeOrderAndDistributeCommission(
  orderId: string
) {
  try {
    /* =========================
       ORDER
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
          "Order already completed",
      };
    }

    /* =========================
       COMPLETE ORDER
    ========================= */

    await updateDoc(orderRef, {
      status: "completed",
      completedAt:
        serverTimestamp(),
    });

    const userId =
      order.userId;

    const amount =
      order.totalAmount || 0;

    /* =========================
       CASHBACK
    ========================= */

    const cashback =
      Math.floor(
        amount * 0.05
      );

    if (cashback > 0) {
      await creditWallet({
        uid: userId,
        amount: cashback,
        incomeType:
          "cashback",
      });
    }

    /* =========================
       MLM COMMISSION
    ========================= */

    await distributeLevelCommission({
      userId,
      amount,
      orderId,
    });

    /* =========================
       WATCH REWARD
    ========================= */

    const userRef = doc(
      db,
      "users",
      userId
    );

    const userSnap =
      await getDoc(userRef);

    if (userSnap.exists()) {
      const user =
        userSnap.data();

      const qualifiedSales =
        (user.qualifiedSalesCount ||
          0) + 1;

      await updateDoc(userRef, {
        qualifiedSalesCount:
          increment(1),
      });

      const lockedReward =
        user.currentCycleLockedReward ||
        0;

      if (
        qualifiedSales >= 5 &&
        lockedReward > 0
      ) {
        await creditWallet({
          uid: userId,
          amount:
            lockedReward,
          incomeType:
            "watchReward",
        });

        await updateDoc(userRef, {
          lockedWatchReward: 0,

          currentCycleLockedReward:
            0,

          qualifiedSalesCount: 0,

          videoWatchCount: 0,

          rewardCycleNumber:
            increment(1),

          currentCycleStatus:
            "active",

          totalUnlockedReward:
            increment(
              lockedReward
            ),

          updatedAt:
            serverTimestamp(),
        });
      }
    }

    /* =========================
       HISTORY
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

        status:
          "completed",

        createdAt:
          serverTimestamp(),
      }
    );

    return {
      success: true,
      message:
        "Order completed successfully",
    };
  } catch (error) {
    console.error(
      "COMPLETE ORDER ERROR:",
      error
    );

    return {
      success: false,
      message:
        "Failed to complete order",
    };
  }
}
