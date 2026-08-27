import { 
  doc, 
  runTransaction, 
  serverTimestamp, 
  increment 
} from "firebase/firestore";
import { db } from "@/firebase/config";

export async function processWatchReward(
  userId: string,
  videoId: string,
  adViewed: boolean,
  watchDuration: number
) {
  try {
    const userRef = doc(db, "users", userId);
    const videoRef = doc(db, "videos", videoId);
    const configRef = doc(db, "adminSettings", "watchReward");

    return await runTransaction(db, async (transaction) => {
      // 1. Fetch Core Entities
      const [userSnap, videoSnap, configSnap] = await Promise.all([
        transaction.get(userRef),
        transaction.get(videoRef),
        transaction.get(configRef),
      ]);
      
      if (!userSnap.exists() || !videoSnap.exists() || !configSnap.exists()) 
        throw new Error("ENTITY_NOT_FOUND");

      const userData = userSnap.data();
      const videoData = videoSnap.data();
      const config = configSnap.data();

      // 2. Fraud & Validation
      if (watchDuration < config.minWatchSeconds) throw new Error("WATCH_TIME_TOO_SHORT");
      if (!adViewed) throw new Error("AD_NOT_VIEWED");
      if (userData.isBlocked || userData.walletLocked) throw new Error("USER_RESTRICTED");
      if (videoData.creatorId === userId) throw new Error("SELF_VIEW_BLOCKED");

      // 3. Duplicate View Check
      const rewardLogRef = doc(db, "watchRewards", `${videoId}_${userId}`);
      if ((await transaction.get(rewardLogRef)).exists()) throw new Error("DUPLICATE_VIEW");

      // 4. Creator Analytics (Safe Update)
      const creatorRef = doc(db, "users", videoData.creatorId);
      const creatorSnap = await transaction.get(creatorRef);
      if (creatorSnap.exists()) {
        transaction.update(creatorRef, { creatorViews: increment(1) });
      }

      // 5. Global Metrics
      transaction.set(rewardLogRef, { userId, videoId, status: "processed", createdAt: serverTimestamp() });
      transaction.update(videoRef, { views: increment(1) });

      // 6. Milestone Logic with Pending Cycle & Max Limit
      const currentCount = userData.videoWatchCount || 0;
      const isMilestone = (currentCount + 1) % config.videosRequired === 0;
      const updateData: any = { videoWatchCount: increment(1), updatedAt: serverTimestamp() };

      if (isMilestone) {
        let isCycleActive = false;
        if (userData.activeRewardCycleId) {
          const activeCycleSnap = await transaction.get(doc(db, "rewardCycles", userData.activeRewardCycleId));
          if (activeCycleSnap.exists() && activeCycleSnap.data().status === "ACTIVE") {
            isCycleActive = true;
          }
        }

        if (isCycleActive) {
          // Check maxPendingCycles to avoid infinite liability
          const currentPending = userData.pendingRewardCycles || 0;
          if (currentPending < (config.maxPendingCycles || 5)) {
            updateData.pendingRewardCycles = increment(1);
          }
        } else {
          // Create New Cycle
          const cycleRef = doc(db, "rewardCycles", `${userId}_${Date.now()}`); // Unique per cycle
          transaction.set(cycleRef, {
            userId, status: "ACTIVE", createdAt: serverTimestamp()
          });

          const txRef = doc(db, "user_transactions", `tx_${cycleRef.id}`);
          transaction.set(txRef, {
            userId, type: "watch_reward_points", amount: config.rewardPoints, cycleId: cycleRef.id, createdAt: serverTimestamp()
          });

          updateData.lockedRewardPoints = increment(config.rewardPoints);
          updateData.rewardCycleStatus = "ACTIVE";
          updateData.activeRewardCycleId = cycleRef.id;
        }
      }

      transaction.update(userRef, updateData);
      return { success: true, milestoneReached: isMilestone };
    });
  } catch (error: any) {
    console.error("WATCH ENGINE CRITICAL ERROR:", error.message);
    return { success: false, message: error.message };
  }
}
