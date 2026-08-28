import {
  doc,
  getDoc,
  increment,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "@/firebase/config";

interface UpdateWalletBalanceData {
  userId: string;
}

export async function updateWalletBalance({
  userId,
}: UpdateWalletBalanceData) {
  try {
    const userRef = doc(
      db,
      "users",
      userId
    );

    const userSnap =
      await getDoc(userRef);

    if (!userSnap.exists()) {
      return {
        success: false,
        message: "User not found",
      };
    }

    const user =
      userSnap.data();

    const lockedReward =
      user.currentCycleLockedReward || 0;

    const qualifiedSales =
      user.qualifiedSalesCount || 0;

    const rewardCycleNumber =
      user.rewardCycleNumber || 1;

    /* =========================
       VALIDATIONS
    ========================= */

    if (lockedReward <= 0) {
      return {
        success: false,
        message:
          "No locked reward available",
      };
    }

    if (qualifiedSales < 5) {
      return {
        success: false,
        message:
          "Sales target not completed",
      };
    }

    /* =========================
       UNLOCK REWARD
    ========================= */

    await updateDoc(userRef, {
      rewardWallet:
        increment(lockedReward),

      walletBalance:
        increment(lockedReward),

      totalUnlockedReward:
        increment(lockedReward),

      lockedWatchReward:
        increment(-lockedReward),

      currentCycleLockedReward: 0,

      qualifiedSalesCount: 0,

      videoWatchCount: 0,

      rewardCycleNumber:
        rewardCycleNumber + 1,

      currentCycleStatus:
        "active",

      updatedAt:
        serverTimestamp(),
    });

    return {
      success: true,
      unlockedReward:
        lockedReward,

      nextCycle:
        rewardCycleNumber + 1,
    };
  } catch (error) {
    console.error(
      "UPDATE WALLET BALANCE ERROR:",
      error
    );

    return {
      success: false,
      message:
        "Failed to unlock reward",
    };
  }
}
