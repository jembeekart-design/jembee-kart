import {
  updateDoc,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/firebase/config";
import { distributeLevelCommission } from "../distributeLevelCommission";
import { creditWallet } from "../creditWallet";
import { profitabilityConfigService } from "@/jembee-governance/services/profitabilityConfigService";
import { validateOrder } from "./orderValidation";
import { businessRules } from "@/firestore/businessRules/service";

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
    const flags = await businessRules.getFeatureFlags();
    /* ========================================================
       VALIDATION LAYER
       ======================================================== */
    const validation = await validateOrder(orderId);

if (!validation.success) {
  return validation;
}

const { orderRef, order } = validation;
    if (!order) {
  return {
    success: false,
    message: "Order data missing",
  };
}

    /* ========================================================
       IDEMPOTENCY / DUPLICATE PROTECTION GUARD
       ======================================================== */
    if (order.commissionDistributed === flags.commissionDistributedEnabled || order.status === "delivered") {
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
    
    if (cashback > profitabilityRules.cashbackThreshold) {
      try {
        const cashbackResult = await creditWallet({
          uid: userId,
          amount: cashback,
          type: "cashback", // Aligned parameter type
          description: `E-commerce ${profitabilityRules.cashbackPercentage}% Cashback awarded for completed Order ID: ${orderId}`, // Injected mandatory description
          orderId: orderId,
        });

        if (!cashbackResult.success) {
          console.warn(`⚠️ Cashback distribution failed for user ${userId}: ${cashbackResult.message}`);
          cashback = profitabilityRules.cashbackThreshold; // Reset trace count if wallet ledger declined mutation
        }
      } catch (cashbackErr: any) {
        console.error("❌ Isolated Cashback Failure:", cashbackErr.message);
        cashback = profitabilityRules.cashbackThreshold;
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
       3. WATCH & EARN REWARD
       DISABLED BY BUSINESS DESIGN
       Video watching does NOT generate coins, points or cash.
       Normal cashback and MLM commission remain active.
       ======================================================== */
    const rewardUnlocked = false;
    const unlockedAmount = 0;

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
