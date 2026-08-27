import {
  doc,
  getDoc,
  increment,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "@/firebase/config";

import { createWatchTransaction } from "./createWatchTransaction";

interface StartRewardCycleData {
  userId: string;
}

export async function startRewardCycle(
  data: StartRewardCycleData
) {
  try {
    if (!data.userId?.trim()) {
      return {
        success: false,
        message: "User ID Required",
      };
    }

    const userRef = doc(
      db,
      "users",
      data.userId
    );

    const userSnap =
      await getDoc(userRef);

    if (!userSnap.exists()) {
      return {
        success: false,
        message: "User Not Found",
      };
    }

    const user =
      userSnap.data();

    const videoWatchCount =
      user.videoWatchCount || 0;

    const lockedWatchReward =
      user.lockedWatchReward || 0;

    const rewardCycleNumber =
      user.rewardCycleNumber || 1;

    /* =========================
       ONLY ONE ACTIVE CYCLE
    ========================= */

    if (lockedWatchReward > 0) {
      return {
        success: false,
        message:
          "Previous reward cycle not completed",
      };
    }

    /* =========================
       100 VIDEO CHECK
    ========================= */

    if (videoWatchCount < 100) {
      return {
        success: false,
        message:
          "100 videos not completed",
      };
    }

    const rewardAmount = 50;

    /* =========================
       LOCK REWARD
    ========================= */

    await updateDoc(userRef, {
      lockedWatchReward:
        increment(rewardAmount),

      currentCycleLockedReward:
        rewardAmount,

      qualifiedSalesCount: 0,

      currentCycleStatus:
        "pending",

      updatedAt:
        serverTimestamp(),
    });

    /* =========================
       TRANSACTION LOG
    ========================= */

    await createWatchTransaction({
      userId: data.userId,
      amount: rewardAmount,
      cycleNumber:
        rewardCycleNumber,
      type: "reward_locked",
      status: "pending",
    });

    return {
      success: true,
      rewardLocked:
        rewardAmount,
      cycleNumber:
        rewardCycleNumber,
      message:
        "Reward cycle started",
    };
  } catch (error) {
    console.error(
      "START REWARD CYCLE ERROR:",
      error
    );

    return {
      success: false,
      message:
        "Failed to start reward cycle",
    };
  }
}
