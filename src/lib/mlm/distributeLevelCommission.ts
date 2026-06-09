import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "firebase/firestore";

import { db } from "@/firebase/config";
import { MLM_LEVELS_CONFIG, MLM_SECURITY_GUARDS } from "@/config/mlmConfig";
import { creditWallet } from "./creditWallet";

interface DistributeLevelCommissionData {
  userId: string;
  profitAmount: number; // FIX 2: Renamed to clearly indicate calculation is on Product Profit, not Order Gross Value
  orderId: string;
  orderStatus: string;  // FIX 1: Explicit status checking introduced
}

export async function distributeLevelCommission(
  data: DistributeLevelCommissionData
) {
  try {
    /* =========================
       VALIDATION
    ========================= */

    if (!data.userId) {
      return { success: false, message: "User ID Required" };
    }

    if (!data.orderId) {
      return { success: false, message: "Order ID Required" };
    }

    if (!data.orderStatus) {
      return { success: false, message: "Order Status Required" };
    }

    if (data.profitAmount === undefined || data.profitAmount <= 0) {
      return { success: false, message: "Invalid Profit Amount" };
    }

    /* =========================
       PRODUCTION FIX 1: DELIVERED ORDER VALIDATION
       (Guards cash flow by ensuring lifecycle completion before commission payouts)
    ========================= */
    if (data.orderStatus.toLowerCase() !== "delivered") {
      return {
        success: true,
        message: `Commission skipped. Order status is '${data.orderStatus}', must be 'delivered'.`
      };
    }

    /* =========================
       COMMISSION BUDGET PROTECTION
    ========================= */
    const totalPercentage = MLM_LEVELS_CONFIG.reduce(
      (sum, item) => sum + (item?.percentage || 0),
      0
    );

    if (totalPercentage > MLM_SECURITY_GUARDS.MAX_ALLOWED_TOTAL_PERCENTAGE) {
      throw new Error("MLM percentage exceeds allowed limit");
    }

    /* =========================
       PRODUCTION OPTIMIZATION: THRESHOLD GUARD
       (Evaluated against the profitAmount threshold to save internal operations)
    ========================= */
    if (data.profitAmount < MLM_SECURITY_GUARDS.MIN_PROFIT_AMOUNT_FOR_COMMISSION) {
      return {
        success: true,
        message: `Skipped: Profit margin below threshold (Minimum required: ₹${MLM_SECURITY_GUARDS.MIN_PROFIT_AMOUNT_FOR_COMMISSION})`
      };
    }

    /* =========================
       BUYER LOGIC & SAFETY CHECKS
    ========================= */

    const buyerRef = doc(db, "users", data.userId);
    const buyerSnap = await getDoc(buyerRef);

    if (!buyerSnap.exists()) {
      return { success: false, message: "User Not Found" };
    }

    const buyerData = buyerSnap.data();
    
    // Soft-delete restriction
    if (buyerData.isDeleted === true) {
      return { success: false, message: "Buyer Account Is Deactivated/Deleted" };
    }

    // Self-Sponsor Loop Protection
    if (buyerData.sponsorId === data.userId) {
      return { success: false, message: "Invalid Sponsor Chain: Self-Sponsorship Blocked" };
    }

    let currentSponsorId = buyerData.sponsorId || "";

    /* =========================
       INFINITE LOOP PROTECTION (O(1) Set Tracking)
    ========================= */
    const visitedSponsors = new Set<string>();

    /* =========================
       DISTRIBUTE WITH SPONSOR CHAIN PASS-THROUGH
    ========================= */

    for (const levelConfig of MLM_LEVELS_CONFIG) {
      if (!currentSponsorId?.trim()) {
        break; // Chain ends naturally if no upper sponsor ID exists
      }

      /* =========================
         CONFIG COMPLIANCE VALIDATION
      ========================= */
      if (
        !levelConfig ||
        typeof levelConfig.percentage !== "number" ||
        levelConfig.percentage < 0 ||
        !levelConfig.incomeType ||
        typeof levelConfig.level !== "number"
      ) {
        continue;
      }

      /* =========================
         CIRCULAR CHAIN DETECTION
      ========================= */
      if (visitedSponsors.has(currentSponsorId)) {
        console.error("CIRCULAR SPONSOR CHAIN DETECTED FOR USER:", currentSponsorId);
        
        const cyclicLogId = `${data.orderId}_LEVEL_${levelConfig.level}_CYCLIC`;
        const cyclicLogRef = doc(db, "commissionLogs", cyclicLogId);
        
        await setDoc(cyclicLogRef, {
          logId: cyclicLogId,
          orderId: data.orderId,
          buyerUid: data.userId,
          sponsorUid: currentSponsorId,
          level: levelConfig.level,
          status: "failed",
          reason: "circular_sponsor_chain_detected",
          createdAt: serverTimestamp()
        });

        break; 
      }

      visitedSponsors.add(currentSponsorId);

      const sponsorRef = doc(db, "users", currentSponsorId);
      const sponsorSnap = await getDoc(sponsorRef);

      const commissionLogId = `${data.orderId}_LEVEL_${levelConfig.level}`;
      const commissionLogRef = doc(db, "commissionLogs", commissionLogId);

      /* =========================
         DYNAMIC VALUE-BASED COMMISSION CALCULATION (ON NET PROFIT)
      ========================= */
      const calculatedCommissionAmount = Math.floor((data.profitAmount * levelConfig.percentage) / 100);

      /* =========================
         FALLBACK FOR UNEXPECTED HARD DELETION
      ========================= */
      if (!sponsorSnap.exists()) {
        await setDoc(commissionLogRef, {
          logId: commissionLogId,
          orderId: data.orderId,
          buyerUid: data.userId, 
          buyerName: buyerData.name || "",
          buyerReferralCode: buyerData.referralCode || "",
          sponsorUid: currentSponsorId, 
          level: levelConfig.level,
          amount: calculatedCommissionAmount,
          incomeType: levelConfig.incomeType,
          status: "skipped",
          reason: "hard_deleted_node_edge_case",
          createdAt: serverTimestamp()
        });

        currentSponsorId = ""; 
        continue;
      }

      const sponsorData = sponsorSnap.data();

      /* =========================
         DUPLICATE CHECK (Barrier Safeguard)
      ========================= */
      const existingLog = await getDoc(commissionLogRef);
      if (existingLog.exists()) {
        currentSponsorId = sponsorData.sponsorId || "";
        continue;
      }

      /* =========================
         STRUCTURAL IMMUTABLE CORES (UID IMPL)
      ========================= */
      const baseLogPayload = {
        logId: commissionLogId,
        orderId: data.orderId,
        buyerUid: data.userId,                    
        buyerName: buyerData.name || "",
        buyerReferralCode: buyerData.referralCode || "",
        sponsorUid: currentSponsorId,             
        sponsorName: sponsorData.name || "",
        sponsorReferralCode: sponsorData.referralCode || "",
        level: levelConfig.level,
        amount: calculatedCommissionAmount,
        incomeType: levelConfig.incomeType,
        createdAt: serverTimestamp()
      };

      /* =========================
         SOFT DELETE & ELIGIBILITY ROUTER
      ========================= */
      const isSoftDeleted = sponsorData.isDeleted === true;
      const isActivePartner = sponsorData.isActivePartner === true && !isSoftDeleted;

      if (isActivePartner && calculatedCommissionAmount > 0) {
        // Atomic transaction mapping via unique commissionLogId inside creditWallet
        const walletResult = await creditWallet({
          uid: currentSponsorId,
          amount: calculatedCommissionAmount,
          incomeType: levelConfig.incomeType,
          transactionId: commissionLogId
        });

        if (!walletResult.success) {
          throw new Error(`Wallet credit failed for user ${currentSponsorId}: ${walletResult.message}`);
        }

        await setDoc(commissionLogRef, {
          ...baseLogPayload,
          status: "success"
        });
      } else {
        let skipReason = isSoftDeleted ? "soft_deleted_partner" : "inactive_partner";
        if (isActivePartner && calculatedCommissionAmount <= 0) {
          skipReason = "calculated_amount_rounded_to_zero";
        }

        await setDoc(commissionLogRef, {
          ...baseLogPayload,
          status: "skipped",
          reason: skipReason
        });
      }

      /* =========================
         SHIFT TO NEXT UP-LINE PARENT NODE
      ========================= */
      currentSponsorId = sponsorData.sponsorId || "";
    }

    return {
      success: true,
      message: "Commission Distributed Successfully"
    };
  } catch (error: any) {
    console.error("DISTRIBUTE LEVEL COMMISSION ERROR:", error);

    return {
      success: false,
      message: error.message || "Something went wrong"
    };
  }
}
