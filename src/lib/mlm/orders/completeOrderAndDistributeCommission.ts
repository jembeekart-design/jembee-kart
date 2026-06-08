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
       VALIDATION
    ========================= */

    if (!orderId?.trim()) {
      return {
        success: false,
        message: "Order ID Required",
      };
    }

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
      return {
        success: false,
        message: "Order not found",
      };
    }

    const order =
      orderSnap.data();

    /* =========================
       DUPLICATE PROTECTION
    ========================= */

    if (
      order.commissionDistributed ===
      true
    ) {
      return {
        success: false,
        message:
          "Commission already distributed",
      };
    }

    const userId =
      order.userId;

    const amount = Number(
      order.totalAmount || 0
    );

    if (!userId) {
      return {
        success: false,
        message: "Invalid Order User",
      };
    }

    /* =========================
       CASHBACK
    ========================= */

    const cashback =
      Math.floor(
        amount * 0.05
      );

    if (cashback > 0) {
      const cashbackResult =
        await creditWallet({
          uid: userId,
          amount: cashback,
          incomeType:
            "cashback",
          transactionId:
            `CASHBACK_${orderId}`,
        });

      if (
        !cashbackResult.success
      ) {
        throw new Error(
          cashbackResult.message ||
            "Cashback failed"
        );
      }
    }

    /* =========================
       MLM COMMISSION
    ========================= */

    const mlmResult =
      await distributeLevelCommission({
        userId,
        amount,
        orderId,
      });

    if (
      !mlmResult.success
    ) {
      throw new Error(
        mlmResult.message ||
          "MLM distribution failed"
      );
    }

    /* =========================
       WATCH REWARD FLOW
    ========================= */

    const userRef = doc(
      db,
      "users",
      userId
    );

    const userSnap =
      await getDoc(userRef);

    let rewardUnlocked =
      false;

    let unlockedAmount =
      0;

    if (userSnap.exists()) {
      const user =
        userSnap.data();

      const qualifiedSales =
        Number(
          user.qualifiedSalesCount ||
            0
        ) + 1;

      await updateDoc(userRef, {
        qualifiedSalesCount:
          increment(1),
      });

      const lockedReward =
        Number(
          user.currentCycleLockedReward ||
            0
        );

      const cycleStatus =
        user.currentCycleStatus ||
        "active";

      if (
        qualifiedSales >= 5 &&
        lockedReward > 0 &&
        cycleStatus ===
          "pending"
      ) {
        const rewardResult =
          await creditWallet({
            uid: userId,

            amount:
              lockedReward,

            incomeType:
              "watchReward",

            transactionId:
              `WATCH_UNLOCK_${orderId}`,
          });

        if (
          rewardResult.success
        ) {
          rewardUnlocked =
            true;

          unlockedAmount =
            lockedReward;

          await updateDoc(
            userRef,
            {
              lockedWatchReward:
                0,

              currentCycleLockedReward:
                0,

              qualifiedSalesCount:
                0,

              videoWatchCount:
                0,

              rewardCycleNumber:
                increment(1),

              currentCycleStatus:
                "active",

              updatedAt:
                serverTimestamp(),
            }
          );
        }
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

        rewardUnlocked,

        unlockedAmount,

        commissionDistributed:
          true,

        status:
          "success",

        createdAt:
          serverTimestamp(),
      }
    );

    /* =========================
       ORDER UPDATE
    ========================= */

    await updateDoc(orderRef, {
      commissionDistributed:
        true,

      commissionDistributedAt:
        serverTimestamp(),

      updatedAt:
        serverTimestamp(),
    });

    return {
      success: true,
      cashback,
      rewardUnlocked,
      unlockedAmount,
      message:
        "Commission distributed successfully",
    };
  } catch (error) {
    console.error(
      "COMPLETE ORDER ERROR:",
      error
    );

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to complete order",
    };
  }
}
