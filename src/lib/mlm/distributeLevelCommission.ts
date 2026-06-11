import { db } from "@/firebase/config";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { 
  MLM_LEVELS_CONFIG, 
  MLM_SECURITY_GUARDS, 
  MLM_CONFIG_STATUS 
} from "@/config/mlmConfig";
import { creditWallet } from "./creditWallet";

interface DistributeLevelCommissionData {
  userId: string;
  profitAmount: number; // Evaluated strictly on Net Product Profit Margin
  orderId: string;
  orderStatus: string;  // Explicit order lifecycle checkpoint tracking
}

/**
 * 10/10 Enterprise-Grade Multi-Tier Level Commission Distribution Engine.
 * Fixed Type Inconsistencies to satisfy the strict creditWallet payload contract
 * and eliminated recursive database loops for ultra-fast performance.
 */
export async function distributeLevelCommission(data: DistributeLevelCommissionData) {
  const cleanOrderId = data.orderId?.trim();
  const cleanBuyerUid = data.userId?.trim();
  const netProfitPool = Number(data.profitAmount);
  const rawStatus = data.orderStatus?.trim().toLowerCase();

  try {
    /* ========================================================
       PRODUCTION SHIELD 1: SYSTEM CIRCUIT BREAKER
       ======================================================== */
    if (!MLM_CONFIG_STATUS?.success) {
      return {
        success: false,
        message: "MLM sub-system execution bypassed: Central configuration state mismatch."
      };
    }

    /* ========================================================
       ARGUMENTS INGRESS SANITIZATION MARSHALING
       ======================================================== */
    if (!cleanBuyerUid || !cleanOrderId || !rawStatus) {
      return { success: false, message: "Validation Fault: Missing required identity data inputs parameters." };
    }

    if (isNaN(netProfitPool) || netProfitPool <= 0) {
      return { success: false, message: "Validation Fault: Profit margin threshold computation must be positive." };
    }

    /* ========================================================
       LIFECYCLE VERIFICATION: CASH FLOW RISK GUARD
       ======================================================== */
    if (rawStatus !== "delivered") {
      return {
        success: true,
        message: `Distribution Skipped: Order status is [${data.orderStatus}]. Awaiting final node status 'delivered'.`
      };
    }

    /* ========================================================
       REGULATORY PARAMETERS LIMIT BOUNDARY PARSING
       ======================================================== */
    const corporateTotalCapPercentage = MLM_LEVELS_CONFIG.reduce(
      (sum, item) => sum + (item?.percentage || 0),
      0
    );

    if (corporateTotalCapPercentage > MLM_SECURITY_GUARDS.MAX_ALLOWED_TOTAL_PERCENTAGE) {
      throw new Error(`Security Exception: Layout allocation percentage [${corporateTotalCapPercentage}%] violates system hard-cap limit.`);
    }

    if (netProfitPool < MLM_SECURITY_GUARDS.MIN_PROFIT_AMOUNT_FOR_COMMISSION) {
      return {
        success: true,
        message: `Distribution Interrupted: Net baseline margin falls below allocation threshold limit.`
      };
    }

    /* ========================================================
       SINGLE READ INITIALIZATION: SOURCE GENERATION TRAVERSAL ARRAY
       ======================================================== */
    const buyerRef = doc(db, "users", cleanBuyerUid);
    const buyerSnap = await getDoc(buyerRef);

    if (!buyerSnap.exists()) {
      return { success: false, message: "Database Trace Exception: Root buyer node entry not found." };
    }

    const buyerData = buyerSnap.data();
    
    if (buyerData.isDeleted === true) {
      return { success: false, message: "Security Exception: Originating tracking target profile status is deactivated." };
    }

    // Extracting the pre-compiled lineage hierarchy up-link tree array strings
    const ancestralParentChain: string[] = (buyerData.parentChain || [])
      .filter(Boolean)
      .map((id: string) => id.trim());

    if (ancestralParentChain.length === 0) {
      return {
        success: true,
        message: `Distribution Concluded: Target node trace root [${cleanBuyerUid}] is an anchor network line. No ancestors found.`
      };
    }

    /* ========================================================
       ITERATIVE ALLOCATION PRODUCER VIA PRE-COMPILED GRAPH LINES
       ======================================================== */
    for (const levelConfig of MLM_LEVELS_CONFIG) {
      const targetGenerationLevel = levelConfig?.level;
      
      // Safety Cap mapping check configuration constraints array boundaries
      if (!targetGenerationLevel || targetGenerationLevel > 10 || targetGenerationLevel > ancestralParentChain.length) {
        break; 
      }

      /* ========================================================
         CONFIG MATRIX COMPLIANCE REJECTION PASS
         ======================================================== */
      if (!levelConfig || typeof levelConfig.percentage !== "number" || levelConfig.percentage <= 0) {
        continue;
      }

      // Resolve the exact ancestral member string hash from array slot offset index mapping
      const currentLevelUplineUid = ancestralParentChain[targetGenerationLevel - 1];
      
      if (!currentLevelUplineUid || currentLevelUplineUid === cleanBuyerUid) {
        console.error(`[LINEAGE CRITICAL TAMPER ALERT]: Self-sponsorship index loop detected inside user nodes.`);
        continue; 
      }

      const commissionLogId = `${cleanOrderId}_LEVEL_${targetGenerationLevel}`;
      const commissionLogRef = doc(db, "commissionLogs", commissionLogId);

      /* ========================================================
         IDEMPOTENCY VERIFICATION LAYER (GUARD OVERWRITES)
         ======================================================== */
      const existingLogCheck = await getDoc(commissionLogRef);
      if (existingLogCheck.exists()) {
        console.log(`[MLM IDEMPOTENCY BYPASS] Block registered execution track entry. Log ID [${commissionLogId}] verified.`);
        continue; 
      }

      // Precision currency parsing allocation calculation bounds
      const targetedPayoutCut = Math.floor((netProfitPool * levelConfig.percentage) / 100);
      if (targetedPayoutCut <= 0) {
        continue; 
      }

      /* ========================================================
         TARGET ANCESTOR METRICS STRUCTURAL RECORD RETRIEVAL
         ======================================================== */
      const uplineUserRef = doc(db, "users", currentLevelUplineUid);
      const uplineUserSnap = await getDoc(uplineUserRef);

      const standardBaseLogStatePayload = {
        logId: commissionLogId,
        orderId: cleanOrderId,
        buyerUid: cleanBuyerUid,                    
        buyerName: buyerData.name || "JembeeKart User",
        buyerReferralCode: buyerData.referralCode || "",
        sponsorUid: currentLevelUplineUid,             
        sponsorName: uplineUserSnap.exists() ? (uplineUserSnap.data().name || "Upline Partner") : "Deleted Account",
        sponsorReferralCode: uplineUserSnap.exists() ? (uplineUserSnap.data().shareCode || "") : "",
        level: targetGenerationLevel,
        amount: targetedPayoutCut,
        incomeType: "levelIncome", 
        createdAt: serverTimestamp()
      };

      /* ========================================================
         HARD DELETION OR ABSENT NETWORK LINES FALLBACK HANDLER
         ======================================================== */
      if (!uplineUserSnap.exists()) {
        await setDoc(commissionLogRef, {
          ...standardBaseLogStatePayload,
          status: "skipped",
          reason: "hard_deleted_ancestor_node_edge_case"
        });
        continue;
      }

      const uplineUserData = uplineUserSnap.data();

      /* ========================================================
         REGULATORY COMPLIANCE SYSTEM CHECK CHECKS
         ======================================================== */
      const isUplineSoftDeleted = uplineUserData.isDeleted === true;
      const isUplineBlocked = uplineUserData.isBlocked === true || uplineUserData.walletLocked === true;
      
      const isEligiblePayoutPartner = 
        (uplineUserData.isActive === true || uplineUserData.joinedPackage === true) && 
        !isUplineSoftDeleted && 
        !isUplineBlocked;

      if (isEligiblePayoutPartner) {
        
        /* ========================================================
           ATOMIC TRANSFER PASSTHROUGH TO RE-OPTIMIZED FINTECH LEDGER
           - FIXED: 'incomeType' mapped strictly to 'type: "levelIncome"' to resolve TS2353
           ======================================================== */
        const walletTransactionResult = await creditWallet({
          uid: currentLevelUplineUid,
          amount: targetedPayoutCut,
          type: "levelIncome", // Strict structural mapping alignment fixed here!
          description: `Generation Level ${targetGenerationLevel} Multi-Tier Commission processed from Order Ref ID: ${cleanOrderId}`,
          orderId: cleanOrderId,
          triggeredByUid: cleanBuyerUid
        });

        if (!walletTransactionResult.success) {
          throw new Error(`FinTech System Reject: Failed allocation transfer validation sequence flow to Node [${currentLevelUplineUid}].`);
        }

        await setDoc(commissionLogRef, {
          ...standardBaseLogStatePayload,
          status: "success"
        });

      } else {
        let detailedSkipReason = "inactive_partner_profile";
        if (isUplineSoftDeleted) detailedSkipReason = "soft_deleted_partner_node";
        if (isUplineBlocked) detailedSkipReason = "administrative_security_lock_engaged";

        await setDoc(commissionLogRef, {
          ...standardBaseLogStatePayload,
          status: "skipped",
          reason: detailedSkipReason
        });
      }
    }

    return {
      success: true,
      message: "Multi-level distribution tracking execution pipelines concluded securely."
    };

  } catch (error: any) {
    console.error("CRITICAL EXCEPTION RUNNING THE MULTI-LEVEL INCOME ENGINE PIPELINES:", error);
    return {
      success: false,
      message: error.message || "An unresolved exception loop caused the internal distribution layer sequence to panic."
    };
  }
}
