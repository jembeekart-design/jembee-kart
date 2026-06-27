import {
  addDoc,
  collection,
  doc,
  getDoc,
  increment,
  query,
  serverTimestamp,
  updateDoc,
  where,
  getDocs,
} from "firebase/firestore";

import { db } from "@/firebase/config";

import { watchEarnConfigService } from "@/jembee-governance/services/watchEarnConfigService";

interface ClaimWatchVideoRewardData {
  userId: string;
  videoId: string;
  watchedSeconds: number;
}

export async function claimWatchVideoReward(
  data: ClaimWatchVideoRewardData
) {
  try {
    const rules = await watchEarnConfigService.getRules();
    /* =========================
       VIDEO VALIDATION
    ========================= */

    const videoRef = doc(
      db,
      "watchVideos",
      data.videoId
    );

    const videoSnap =
      await getDoc(videoRef);

    if (!videoSnap.exists()) {
      return {
        success: false,
        message: "Video not found",
      };
    }

    const videoData =
      videoSnap.data();

   const minimumWatchTime =
  videoData.minimumWatchTime || rules.minimumWatchDuration;

    if (
      data.watchedSeconds <
      minimumWatchTime
    ) {
      return {
        success: false,
        message:
          "Minimum watch time not completed",
      };
    }

    /* =========================
       DUPLICATE REWARD CHECK
    ========================= */

    const duplicateQuery = query(
      collection(
        db,
        "watchRewardHistory"
      ),
      where(
        "userId",
        "==",
        data.userId
      ),
      where(
        "videoId",
        "==",
        data.videoId
      )
    );

    const duplicateSnap =
      await getDocs(
        duplicateQuery
      );

    if (!duplicateSnap.empty) {
      return {
        success: false,
        message:
          "Reward already claimed",
      };
    }

    /* =========================
       USER VALIDATION
    ========================= */

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
        message: "User not found",
      };
    }

    const user =
      userSnap.data();

    const currentCycleStatus =
      user.currentCycleStatus ||
      "active";

    const currentCycleNumber =
      user.rewardCycleNumber ||
      1;

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
          "Current reward cycle pending unlock",
      };
    }

    /* =========================
       VIDEO COUNT
    ========================= */

    const currentWatchCount =
      user.videoWatchCount || 0;

    const nextWatchCount =
      currentWatchCount + 1;

    let lockedReward = 0;
    let nextStatus = "active";

    /* =========================
       100 VIDEOS = ₹50 LOCKED
    ========================= */

    if (
  nextWatchCount >= rules.videosRequired &&
  nextWatchCount % rules.videosRequired === 0
) {
  lockedReward = rules.rewardAmount;
  nextStatus = "pendingUnlock";
}

    /* =========================
       UPDATE USER
    ========================= */

    await updateDoc(userRef, {
      videoWatchCount:
        increment(1),

      lockedWatchReward:
        increment(
          lockedReward
        ),

      currentCycleLockedReward:
        increment(
          lockedReward
        ),

      currentCycleStatus:
        nextStatus,

      updatedAt:
        serverTimestamp(),
    });

    /* =========================
       SAVE HISTORY
    ========================= */

    await addDoc(
      collection(
        db,
        "watchRewardHistory"
      ),
      {
        userId: data.userId,

        videoId: data.videoId,

        watchedSeconds:
          data.watchedSeconds,

        rewardLocked:
          lockedReward,

        cycleNumber:
          currentCycleNumber,

        status:
          lockedReward > 0
            ? "cycle_completed"
            : "watch_recorded",

        createdAt:
          serverTimestamp(),
      }
    );

    return {
      success: true,

      cycleCompleted:
        lockedReward > 0,

      lockedReward,

      currentWatchCount:
        nextWatchCount,

      currentCycleNumber,
    };
  } catch (error) {
    console.error(
      "claimWatchVideoReward error",
      error
    );

    return {
      success: false,
      message:
        "Failed to claim reward",
    };
  }
}
