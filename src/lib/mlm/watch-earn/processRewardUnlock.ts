import { 
  doc, 
  runTransaction, 
  serverTimestamp, 
  increment, 
  collection 
} from "firebase/firestore";
import { db } from "@/firebase/config";
import { ENGINE_VERSION } from "@/lib/mlm/config"; 

export async function processRewardUnlock(userId: string, cycleId: string) {
  try {
    const userRef = doc(db, "users", userId);
    const cycleRef = doc(db, "rewardCycles", cycleId);
    const configRef = doc(db, "adminSettings", "watchReward");

    return await runTransaction(db, async (transaction) => {
      const [userSnap, cycleSnap, configSnap] = await Promise.all([
        transaction.get(userRef),
        transaction.get(cycleRef),
        transaction.get(configRef),
      ]);

      if (!userSnap.exists() || !cycleSnap.exists() || !configSnap.exists()) 
        throw new Error("ENTITY_NOT_FOUND");
      
      const userData = userSnap.data();
      const cycleData = cycleSnap.data();
      const config = configSnap.data();

      // 1. Security & Integrity Guards
      if (userData.isBlocked || userData.walletLocked || !userData.isActive) 
        throw new Error("USER_RESTRICTED");
      if (cycleData.status !== "ACTIVE" || cycleData.unlockedAt) 
        throw new Error("CYCLE_INVALID_OR_ALREADY_PROCESSED");

      // 2. Iron-Clad Locked Points Validation
      const lockedPoints = Number(userData.lockedRewardPoints ?? 0);
      const pointsToUnlock = Number(cycleData.rewardPoints ?? 0);
      
      if (pointsToUnlock <= 0) throw new Error("INVALID_REWARD_POINTS");
      if (lockedPoints < pointsToUnlock) throw new Error("INSUFFICIENT_LOCKED_POINTS");

      // 3. Dynamic Business Rules
      const requiredOrders = cycleData.requiredOrders ?? config.requiredOrders ?? 5;
      if ((cycleData.completedOrders ?? 0) < requiredOrders) 
        throw new Error("ORDERS_INSUFFICIENT");

      // 4. Profit-Safe Conversion & Margin Protection
      const conversionRate = config.conversionRate ?? 0.5;
      const cashAmount = Number((pointsToUnlock * conversionRate).toFixed(2));
      const maxCash = config.maxCashPerCycle ?? 50;
      
      if (cashAmount > maxCash) throw new Error("REWARD_LIMIT_EXCEEDED");

      // 5. Update Engine
      transaction.update(cycleRef, { 
        status: "UNLOCKED", 
        active: false, 
        unlockedAt: serverTimestamp(),
        engineVersion: ENGINE_VERSION 
      });
      
      const updateData: any = {
        lockedRewardPoints: increment(-pointsToUnlock),
        rewardWallet: increment(cashAmount),
        rewardCycleStatus: "COMPLETED",
        completedRewardCycles: increment(1),
        totalRewardUnlocked: increment(cashAmount),
        updatedAt: serverTimestamp()
      };

      // 6. Audit Trail
      const txRef = doc(collection(db, "user_transactions"));
      transaction.set(txRef, {
        userId,
        type: "watch_reward_unlock",
        points: pointsToUnlock,
        amount: cashAmount,
        conversionRate: conversionRate,
        cycleId: cycleId,
        engineVersion: ENGINE_VERSION,
        createdAt: serverTimestamp()
      });

      // 7. Pending Cycle Processing with Config Validation
      const nextRewardPoints = Number(config.rewardPoints ?? 50);
      if (nextRewardPoints <= 0) throw new Error("INVALID_CONFIG_REWARD_POINTS");

      const pending = Math.max(0, Number(userData.pendingRewardCycles ?? 0));
      if (pending > 0) {
        const nextCycleRef = doc(collection(db, "rewardCycles"));
        transaction.set(nextCycleRef, {
          userId,
          rewardPoints: nextRewardPoints,
          requiredOrders: config.requiredOrders ?? 5,
          status: "ACTIVE",
          active: true,
          engineVersion: ENGINE_VERSION,
          createdAt: serverTimestamp(),
        });
        updateData.activeRewardCycleId = nextCycleRef.id;
        updateData.rewardCycleStatus = "ACTIVE";
        updateData.pendingRewardCycles = increment(-1);
      } else {
        updateData.activeRewardCycleId = null;
        updateData.rewardCycleStatus = "NONE";
      }

      transaction.update(userRef, updateData);
      return { success: true };
    });
  } catch (error: any) {
    console.error("UNLOCK ENGINE CRITICAL ERROR:", error.message);
    return { success: false, message: error.message };
  }
}
