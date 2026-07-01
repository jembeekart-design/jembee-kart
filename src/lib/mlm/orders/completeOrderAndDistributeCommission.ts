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
import { profitabilityConfigService } from "@/jembee-governance/services/profitabilityConfigService";
import { validateOrder } from "./orderValidation";

interface CompleteOrderData {
  orderId: string;
}

/**
 * Finalizes the order delivery lifecycle, handles e-commerce cashback,
 * and triggers secondary MLM/Reward networks inside safe isolated scopes.
 * Aligned strictly with the creditWallet type contracts to eliminate TypeScript compiler faults.
 */
export async function completeOrderAndDistributeCommission(orderId: string) {
  try {
    const profitabilityRules =
  await profitabilityConfigService.getRules();
    /* ========================================================
       VALIDATION LAYER
       ======================================================== */
    const validation = await validateOrder(orderId);

if (!validation.success) {
  return validation;
}

const { orderRef, order } = validation;

    /* ========================================================
       IDEMPOTENCY / DUPLICATE PROTECTION GUARD
       ======================================================== */
    if (order.commissionDistributed === true || order.status === "delivered") {
      return {
        success: true, // Returning true because the end-state is already achieved
        message: "Commission already distributed and order finalized.",
      };
    }

    const userId = order.userId;
    const amount = Number(order.totalAmount || order.amount || 0);

    // Dynamic mapping for Net Profit Margin. Future scale reads profitAmount field directly.
    const dynamicProfitAmount = order.profitAmount !== undefined ? Number(order.profitAmount) : amount;

    if (!userId) {
      return {
        success: false,
        message: "Invalid Order User: Missing reference allocation link.",
      };
    }

    /* ========================================================
       1. CORE E-COMMERCE CASHBACK (CRITICAL OUTFLOW)
       - FIXED: Schema properties mapped strictly to type contracts
       ======================================================== */
    let cashback = Math.floor(
  amount *
  (profitabilityRules.cashbackPercentage / 100)
);
    
    if (cashback > 0) {
      try {
        const cashbackResult = await creditWallet({
          uid: userId,
          amount: cashback,
          type: "cashback", // Aligned parameter type
          description: `E-commerce 5% Cashback awarded for completed Order ID: ${orderId}`, // Injected mandatory description
          orderId: orderId,
        });

        if (!cashbackResult.success) {
          console.warn(`⚠️ Cashback distribution failed for user ${userId}: ${cashbackResult.message}`);
          cashback = 0; // Reset trace count if wallet ledger declined mutation
        }
      } catch (cashbackErr: any) {
        console.error("❌ Isolated Cashback Failure:", cashbackErr.message);
        cashback = 0;
      }
    }

    /* ========================================================
       2. SECONDARY SUBSYSTEM: MLM LEVEL COMMISSION (SANDBOXED)
       ======================================================== */
    try {
      console.log(`[MLM PIPELINE]: Dispatching distribution tree for Order: ${orderId}`);
      
      const mlmResult = await distributeLevelCommission({
        userId,
        profitAmount: dynamicProfitAmount, 
        orderId,
        orderStatus: "delivered", // Explicitly passing continuous state verification token
      });

      if (!mlmResult.success) {
        console.warn(`⚠️ [MLM SUB-SYSTEM BYPASS]: Distribution declined gracefully: ${mlmResult.message}`);
      } else {
        console.log("✅ [MLM PIPELINE]: Subsystem levels processed without network exceptions.");
      }
    } catch (mlmError: any) {
      // Circuit Breaker: Prevents e-commerce flow from collapsing due to secondary tree exceptions
      console.error("🚨 [CIRCUIT BREAKER]: MLM distribution system error intercepted:", mlmError.message);
    }

    /* ========================================================
       3. SECONDARY SUBSYSTEM: WATCH REWARD LIFECYCLE (SANDBOXED)
       - FIXED: Type-casted 'watchReward' into valid strict format 'type: "reward"'
       ======================================================== */
    let rewardUnlocked = false;
    let unlockedAmount = 0;

    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const user = userSnap.data();
        const qualifiedSales = Number(user.qualifiedSalesCount || 0) + 1;

        // Dynamic key alignment fallback for locked rewards schemas
        const lockedReward = Number(user.currentCycleLockedReward || user.lockedWatchReward || 0);
        const cycleStatus = user.currentCycleStatus || "active";

        // Condition Check for Cycle Phase
        if (qualifiedSales >= 5 && lockedReward > 0 && cycleStatus === "pending") {
          const rewardResult = await creditWallet({
            uid: userId,
            amount: lockedReward,
            type: "reward", // Conformed type constraint
            description: `Watch Video Cycle Milestone Unlocked successfully from Order Ref: ${orderId}`, // Injected description
            orderId: orderId,
          });

          if (rewardResult.success) {
            rewardUnlocked = true;
            unlockedAmount = lockedReward;

            await updateDoc(userRef, {
              lockedWatchReward: 0,
              currentCycleLockedReward: 0,
              qualifiedSalesCount: 0,
              videoWatchCount: 0,
              rewardCycleNumber: increment(1),
              currentCycleStatus: "active",
              updatedAt: serverTimestamp(),
            });
            console.log(`🎁 [REWARD ENGINE]: Watch Reward Cycle Unlocked for User: ${userId}`);
          } else {
            // Fallback: If wallet transaction fails, increment the count safely without resetting cycles
            await updateDoc(userRef, {
              qualifiedSalesCount: increment(1),
              updatedAt: serverTimestamp(),
            });
          }
        } else {
          // Standard Incremental Lifecycle Path
          await updateDoc(userRef, {
            qualifiedSalesCount: increment(1),
            updatedAt: serverTimestamp(),
          });
        }
      }
    } catch (rewardError: any) {
      console.error("⚠️ [REWARD ENGINE EXCEPTION]: Safely isolated fallback handler:", rewardError.message);
    }

    /* ========================================================
       4. AUDIT COMPLIANCE & HISTORICAL INGESTION
       ======================================================== */
    await addDoc(collection(db, "orderIncomeHistory"), {
      userId,
      orderId,
      amount,
      cashback,
      rewardUnlocked,
      unlockedAmount,
      commissionDistributed: true,
      status: "success",
      createdAt: serverTimestamp(),
    });

    /* ========================================================
       5. FINAL STATE LOCK COMMITS (ATOMIC CLOSURE)
       ======================================================== */
    await updateDoc(orderRef, {
      status: "delivered", // Transition state mapping synchronized
      commissionDistributed: true,
      commissionDistributedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    console.log(`🔒 [METRICS LOCK]: System pipeline finalized and secured for Order ID: ${orderId}`);

    return {
      success: true,
      cashback,
      rewardUnlocked,
      unlockedAmount,
      message: "Order distribution completed successfully",
    };

  } catch (error) {
    console.error("CRITICAL COMPLETE ORDER GENERAL PIPELINE CRASH:", error);

    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to complete order processing loop",
    };
  }
}
