import {
  addDoc,
  collection,
  doc,
  getDoc,
  increment,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "@/firebase/config";

interface CreateWatchRewardData {
  userId: string;
  videoId: string;
  watchSeconds: number;
}

export async function createWatchReward(
  data: CreateWatchRewardData
) {
  try {
    /* =========================
       MINIMUM WATCH TIME
    ========================= */

    if (data.watchSeconds < 30) {
      return {
        success: false,
        message: "Minimum 30 seconds watch required",
      };
    }

    const userRef = doc(
      db,
      "users",
      data.userId
    );

    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return {
        success: false,
        message: "User not found",
      };
    }

    const user = userSnap.data();

    const currentVideoCount =
      user.videoWatchCount || 0;

    const currentLockedReward =
      user.lockedWatchReward || 0;

    const currentCycleNumber =
      user.rewardCycleNumber || 1;

    const currentCycleStatus =
      user.currentCycleStatus || "active";

    /* =========================
       ONLY ONE ACTIVE CYCLE
    ========================= */

    if (
      currentCycleStatus ===
      "pendingUnlock"
    ) {
      return {
        success: false,
        message:
          "Complete current reward cycle first",
      };
    }

    const updatedVideoCount =
      currentVideoCount + 1;

    let lockedRewardToAdd = 0;
    let nextStatus = "active";

    /* =========================
       100 VIDEOS = ₹50 LOCKED
    ========================= */

    if (
      updatedVideoCount >= 100 &&
      updatedVideoCount % 100 === 0
    ) {
      lockedRewardToAdd = 50;
      nextStatus = "pendingUnlock";
    }

    /* =========================
       UPDATE USER
    ========================= */

    await updateDoc(userRef, {
      videoWatchCount: increment(1),

      lockedWatchReward:
        increment(lockedRewardToAdd),

      currentCycleLockedReward:
        increment(lockedRewardToAdd),

      currentCycleStatus:
        nextStatus,

      updatedAt:
        serverTimestamp(),
    });

    /* =========================
       WATCH HISTORY
    ========================= */

    await addDoc(
      collection(
        db,
        "watchRewardHistory"
      ),
      {
        userId: data.userId,
        videoId: data.videoId,
        watchSeconds:
          data.watchSeconds,

        rewardLocked:
          lockedRewardToAdd,

        rewardCycleNumber:
          currentCycleNumber,

        status:
          lockedRewardToAdd > 0
            ? "cycle_completed"
            : "watch_recorded",

        createdAt:
          serverTimestamp(),
      }
    );

    return {
      success: true,

      cycleCompleted:
        lockedRewardToAdd > 0,

      lockedRewardAdded:
        lockedRewardToAdd,

      currentWatchCount:
        updatedVideoCount,
    };
  } catch (error) {
    console.error(
      "createWatchReward error:",
      error
    );

    return {
      success: false,
      message:
        "Failed to create watch reward",
    };
  }
}
