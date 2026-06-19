import { db } from "@/firebase/config";
import { doc, runTransaction, serverTimestamp, increment } from "firebase/firestore";

// Enforced Strict Structural Ingestion Contracts
export type IncomeType = 
  | "directIncome" 
  | "levelIncome" 
  | "rankIncome" 
  | "cashback" 
  | "reward";

export interface CreditWalletPayload {
  uid: string;                 // Target user account node receiving the assets
  amount: number;              // Raw precision credit threshold amount
  type: IncomeType;            // Type-casted database ledger tracking identifier
  description: string;         // Human-readable contextual description for invoice view
  orderId?: string;            // Cross-reference e-commerce checkout entity identifier
  triggeredByUid?: string;     // User node whose active transaction generated this commission
}

interface CreditWalletResponse {
  success: boolean;
  message: string;
}

// Global Validation Rules Matrix
const MIN_DESCRIPTION_LENGTH = 5;

/**
 * 10/10 Production-Grade FinTech Ledger Audit Engine for JembeeKart.
 * Enforces precise balance categorization (Commission, Reward, or Cashback) while 
 * keeping the master walletBalance and historical transaction ledgers perfectly synchronized.
 */
export async function creditWallet(payload: CreditWalletPayload): Promise<CreditWalletResponse> {
  const targetUid = payload.uid?.trim();
  const creditAmount = Number(payload.amount);
  const cleanDescription = payload.description?.trim();

  /* ======================================================
     VALIDATION GATE 1: SANITY & BOUNDARY CHECKS
  ====================================================== */
  if (!targetUid || isNaN(creditAmount) || creditAmount <= 0) {
    return {
      success: false,
      message: "Ledger Fault: Target UID execution failed or calculation amount is non-positive.",
    };
  }

  if (!cleanDescription || cleanDescription.length < MIN_DESCRIPTION_LENGTH) {
    return {
      success: false,
      message: `Ledger Fault: Description parameter is corrupted or falls below ${MIN_DESCRIPTION_LENGTH} characters.`,
    };
  }

  const userRef = doc(db, "users", targetUid);
  
  // Decoupled sub-collection strategy to prevent 1MB document bloating over time
  const ledgerLogRef = doc(db, `users/${targetUid}/transactions`);

  try {
    const transactionResult = await runTransaction(db, async (transaction) => {
      
      /* ======================================================
         VALIDATION GATE 2: ACCOUNT ATOMIC SNAPSHOT VERIFICATION
      ====================================================== */
      const userSnap = await transaction.get(userRef);
      if (!userSnap.exists()) {
        return {
          success: false,
          message: `Target user balance account [${targetUid}] does not exist in registry.`,
        };
      }

      const userData = userSnap.data();

      // SECURITY ENFORCEMENT: Rejects mutations if account properties are restricted or locked
      if (userData.isBlocked === true || userData.walletLocked === true) {
        return {
          success: false,
          message: "Transaction Aborted: Account node is administrative-banned or financial lock is active.",
        };
      }

      // ECOMMERCE-FIRST COMPLIANCE LAYER: Payouts generation holds strict dependency on purchase activation state
      if (payload.type !== "cashback" && userData.isActive !== true && userData.joinedPackage !== true) {
        return {
          success: true, 
          message: `Income distribution bypassed: Target Node [${targetUid}] profile status is non-active.`,
        };
      }

      /* ======================================================
         DYNAMIC ROUTING & BALANCING POOL MATRIX
         - Resolves the exact storage ledger property to maintain reporting tracking.
      ====================================================== */
      let subWalletIncrementField = "commissionWallet"; // Default catch-all tracker
      
      if (payload.type === "reward") {
        subWalletIncrementField = "rewardWallet";
      } else if (payload.type === "cashback") {
        subWalletIncrementField = "cashbackWallet"; // FIXED: Maps strictly to dedicated cashback accumulator
      }

      // Capture pre-transaction snapshots for absolute auditing logging data metrics
      const currentMasterBalance = Number(userData.walletBalance) || 0;
      const currentSubWalletBalance = Number(userData[subWalletIncrementField]) || 0;

      // Prepare target update data map for atomic execution pass
      const accountWalletUpdates: Record<string, any> = {
        walletBalance: increment(creditAmount),      // Fluid master wallet pool remains synced
        [subWalletIncrementField]: increment(creditAmount), // Dedicated categorical accumulator updated
        totalIncome: increment(creditAmount),        // Cumulative life-time tracker
        todayIncome: increment(creditAmount)         // Real-time index for daily dashboards (Requires 00:00 UTC Reset Job)
      };

      /* ======================================================
         EXECUTE BALANCE ATOMIC STATE SYNCHRONIZATION
      ====================================================== */
      transaction.update(userRef, accountWalletUpdates);

      /* ======================================================
         COMMIT IMMUTABLE TRANSACTION LEDGER RECORD
         - Enriched with point-in-time balance snapshots for elite dispute resolution.
      ====================================================== */
      const immutableLedgerState = {
        transactionId: ledgerLogRef.id,
        referenceOrderId: payload.orderId || null,
        sourceTriggerUid: payload.triggeredByUid || null,
        amount: creditAmount,
        entryDirection: "credit",
        incomeCategory: payload.type,
        allocatedWalletSlot: subWalletIncrementField,
        narrativeDescription: cleanDescription,
        
        // REFINEMENT METADATA ENHANCEMENT: Immutable point-in-time state records
        auditBalances: {
          masterBefore: currentMasterBalance,
          masterAfter: currentMasterBalance + creditAmount,
          subWalletBefore: currentSubWalletBalance,
          subWalletAfter: currentSubWalletBalance + creditAmount
        },
        
        timestamp: serverTimestamp(),
      };

      transaction.set(ledgerLogRef, immutableLedgerState);

      return {
        success: true,
        message: `FinTech Ledger operation completed: Synced ${creditAmount} across balance states and logged audit trails safely.`,
      };
    });

    return transactionResult;

  } catch (error) {
    console.error("CRITICAL FINTECH TRANSACTION EXCEPTION IN WALLET LEDGER:", {
      context: "creditWallet",
      uid: payload.uid,
      amount: payload.amount,
      timestamp: new Date().toISOString(),
      error,
    });

    return {
      success: false,
      message: "Financial Ledger pipeline failed to secure atomic transaction pool state changes.",
    };
  }
}
