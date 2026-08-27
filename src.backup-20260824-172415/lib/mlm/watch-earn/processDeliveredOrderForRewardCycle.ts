import { doc, runTransaction, serverTimestamp, increment } from "firebase/firestore";
import { db } from "@/firebase/config";
import { MLM_CONFIG } from "@/lib/mlm/config";
import { processRewardUnlock } from "./processRewardUnlock";

export async function processDeliveredOrderForRewardCycle(userId: string) {
  try {
    let triggerUnlock = false;
    let cycleId = "";

    // 1. Transactional Update
    const result = await runTransaction(db, async (transaction) => {
      const userRef = doc(db, "users", userId);
      const userSnap = await transaction.get(userRef);

      if (!userSnap.exists()) throw new Error("USER_NOT_FOUND");
      
      // Safety: Use String casting for cycleId
      cycleId = String(userSnap.data().activeRewardCycleId || "");
      if (!cycleId) throw new Error("NO_ACTIVE_REWARD_CYCLE");

      const cycleRef = doc(db, "rewardCycles", cycleId);
      const cycleSnap = await transaction.get(cycleRef);

      if (!cycleSnap.exists() || cycleSnap.data().status !== "ACTIVE") {
        throw new Error("CYCLE_NOT_ACTIVE");
      }

      const cycleData = cycleSnap.data();

      // Update Order Count
      transaction.update(cycleRef, {
        completedOrders: increment(1),
        updatedAt: serverTimestamp()
      });

      // Threshold Logic: Cycle-specific > Config default > Fallback 5
      const requiredOrders = cycleData.requiredOrders ?? 
                             MLM_CONFIG.defaultRequiredOrders ?? 
                             5;
      
      if ((cycleData.completedOrders + 1) >= requiredOrders) {
        triggerUnlock = true;
      }

      return { success: true };
    });

    // 2. Trigger Pipeline (Outside Transaction)
    if (result.success && triggerUnlock && cycleId) {
      await processRewardUnlock(userId, cycleId);
    }

    return { success: true, triggeredUnlock: triggerUnlock };
  } catch (error: any) {
    console.error("WATCH_REWARD_CYCLE_FAILED:", error.message);
    throw new Error(`REWARD_CYCLE_UPDATE_FAILED: ${error.message}`);
  }
}
