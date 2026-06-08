import {
  doc,
  getDoc,
  increment,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/firebase/config";

import { startRewardCycle } from "./startRewardCycle";

interface TrackVideoWatchData {
  userId: string;
  videoId: string;
  watchedSeconds: number;
}

export async function trackVideoWatch(
  data: TrackVideoWatchData
) {
  try {
    /* =========================
       VALIDATION
    ========================= */

    if (!data.userId?.trim()) {
      return {
        success: false,
        message: "User ID Required",
      };
    }

    if (!data.videoId?.trim()) {
      return {
        success: false,
        message: "Video ID Required",
      };
    }

    if (
      !data.watchedSeconds ||
      data.watchedSeconds < 30
    ) {
      return {
        success: false,
        message:
          "Minimum 30 seconds watch required",
      };
    }

    const userRef = doc(
      db,
      "users",
      data.userId
    );

    const watchLogRef = doc(
      db,
      "watchRewards",
      `${data.userId}_${data.videoId}`
    );

    /* =========================
       TRANSACTION
    ========================= */

    const result =
      await runTransaction(
        db,
        async (transaction) => {
          const userSnap =
            await transaction.get(
              userRef
            );

          if (
            !userSnap.exists()
          ) {
            throw new Error(
              "User Not Found"
            );
          }

          const watchLogSnap =
            await transaction.get(
              watchLogRef
            );

          /* =========================
             DUPLICATE WATCH BLOCK
          ========================= */

          if (
            watchLogSnap.exists()
          ) {
            throw new Error(
              "Video already counted"
            );
          }

          const user =
            userSnap.data();

          const currentWatchCount =
            Number(
              user.videoWatchCount || 0
            );

          const nextWatchCount =
            currentWatchCount + 1;

          /* =========================
             UPDATE USER
          ========================= */

          transaction.update(
            userRef,
            {
              videoWatchCount:
                increment(1),

              totalVideoViews:
                increment(1),

              updatedAt:
                serverTimestamp(),
            }
          );

          /* =========================
             SAVE WATCH LOG
          ========================= */

          transaction.set(
            watchLogRef,
            {
              userId:
                data.userId,

              videoId:
                data.videoId,

              watchedSeconds:
                data.watchedSeconds,

              createdAt:
                serverTimestamp(),
            }
          );

          return {
            nextWatchCount,
          };
        }
      );

    /* =========================
       START REWARD CYCLE
    ========================= */

    if (
      result.nextWatchCount >=
      100
    ) {
      await startRewardCycle({
        userId:
          data.userId,
      });
    }

    return {
      success: true,
      watchCount:
        result.nextWatchCount,
    };
  } catch (error) {
    console.error(
      "TRACK VIDEO WATCH ERROR:",
      error
    );

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to track watch",
    };
  }
}
