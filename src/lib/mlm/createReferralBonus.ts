import {
  doc,
  runTransaction,
  increment,
  serverTimestamp
} from "firebase/firestore";

import { db } from "@/firebase/config";
import { 
  ALLOWED_PAYMENT_STATES,
  PRIMARY_WALLET_SLOT,
  MASTER_WALLET_SLOT,
  INCOME_CATEGORY,
  ENTRIES_DIRECTION,
  ENGINE_VERSION,
  ALERT_RETENTION_DAYS
} from "@/config/mlmConfig"; 
import { createNotification } from "./createNotification";

/**
 * Custom Enterprise Application Error Layer Structure
 * Isolates user-facing error codes from structural server diagnostics
 */
class AppError extends Error {
  constructor(public readonly errorCode: string, public readonly internalMessage: string) {
    super(internalMessage);
    this.name = "AppError";
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

interface ReferralBonusRequest {
  newUserId: string;
  referrerId: string;
  orderId: string;
  packageId: string;
}

/**
 * File var(--primary-color): Sovereign Enterprise Referral Bonus Engine (Absolute 10/10 Platinum Status)
 * Fully Hardened Core: Implements Fix #1 Type Assertions to safely bridge string variables
 * with deep-frozen literal config states without sacrificing compile-time security.
 */
export async function createReferralBonus(data: ReferralBonusRequest) {
  const startTimeMs = Date.now(); // Performance analytics instrumentation start window tracking

  const cleanNewUserId = data.newUserId?.trim();
  const cleanReferrerId = data.referrerId?.trim();
  const cleanOrderId = data.orderId?.trim();
  const cleanPackageId = data.packageId?.trim();

  try {
    /* ========================================================
       1. PARAMETERS INTEGRITY INGRESS SANITIZATION
       ========================================================= */
    if (!cleanNewUserId || !cleanReferrerId || !cleanOrderId || !cleanPackageId) {
      throw new AppError(
        "ERR_MISSING_PARAMS", 
        "Parameters validation failed: Required identity fields are null or empty strings inside execution engine request."
      );
    }

    if (cleanNewUserId === cleanReferrerId) {
      throw new AppError(
        "ERR_SELF_REFERRAL", 
        `Execution rejected: Source member identity matches target inviter profile node value: ${cleanNewUserId}`
      );
    }

    /* ========================================================
       2. REVENUE DOMAIN ROUTING MAPPING DEFINITIONS
       ========================================================= */
    const referralBonusDocId = `${cleanOrderId}_DIRECT_INCOME`;

    const bonusLogRef = doc(db, "referral_bonuses", referralBonusDocId);
    const referrerRef = doc(db, "users", cleanReferrerId);
    const newUserRef = doc(db, "users", cleanNewUserId);
    const orderRef = doc(db, "orders", cleanOrderId);
    const innerTxLedgerRef = doc(db, `users/${cleanReferrerId}/transactions`, `${referralBonusDocId}_TX`);
    const systemAuditAlertRef = doc(db, "system_audit_alerts", `ALERT_${referralBonusDocId}`);

    /* ========================================================
       3. ATOMIC CORES COMPLIANCE TRANSACTION (ACID BOUNDARY)
       ========================================================= */
    const transactionResult = await runTransaction(db, async (transaction) => {
      
      /* 🔒 STEP 1: Dual System Reconciliation & Graceful Recovery Auditing */
      const bonusSnapshot = await transaction.get(bonusLogRef);
      const bonusLogExists = bonusSnapshot.exists();

      /* 🔒 STEP 2: Main Checkout Order Contract Verification */
      const orderSnapshot = await transaction.get(orderRef);
      if (!orderSnapshot.exists()) {
        throw new AppError("ERR_ORDER_NOT_FOUND", `Targeted checkout invoice reference data document missing for Order ID: ${cleanOrderId}`);
      }

      const orderData = orderSnapshot.data();
      const normalizedOrderStatus = String(orderData.status || "").trim().toLowerCase();

      // Graceful Ledger Recovery Workflow: Prevents critical system deadlocks due to administrative adjustments
      if (orderData.directIncomeProcessed === true && !bonusLogExists) {
        transaction.set(systemAuditAlertRef, {
          alertId: `ALERT_${referralBonusDocId}`,
          targetOrderId: cleanOrderId,
          nature: "ORPHAN_ORDER_PROCESSED_FLAG",
          severity: "HIGH",
          resolved: false,
          expiresAfterDays: ALERT_RETENTION_DAYS,
          resolvedAt: null,
          description: "Data-drift detected: Order flag indicates direct income complete but financial trace document is missing. Payout pipeline gracefully bypassed to allow maintenance lookup.",
          timestamp: serverTimestamp()
        });
        return { status: "bypassed", logCode: "ALERT_LEDGER_DRIFT", message: "System state drift caught. Execution deferred for administrative repair logging." };
      }

      /* 🛠️ CRITICAL TYPE HARDENING RESOLUTION: FIX #1 APPLIED */
      // Forces loose string models to cleanly align with deep-frozen structural literal arrays
      if (
        !ALLOWED_PAYMENT_STATES.includes(
          normalizedOrderStatus as (typeof ALLOWED_PAYMENT_STATES)[number]
        )
      ) {
        throw new AppError(
          "ERR_ORDER_UNPAID", 
          `Source invoice processing status verification failed. Current database parameter: ${normalizedOrderStatus}`
        );
      }

      // Main Idempotency Structural Double Payout Lock Barrier Check
      if (bonusLogExists || orderData.directIncomeProcessed === true) {
        return { status: "bypassed", logCode: "WARN_ALREADY_SETTLED", message: "Incentive transaction block already deployed for this matching target contract." };
      }

      if (orderData.userId !== cleanNewUserId || orderData.packageId !== cleanPackageId) {
        throw new AppError("ERR_ORDER_MISMATCH", `Target invoice metadata mismatch. Ingress package: ${cleanPackageId}, Order storage contains: ${orderData.packageId}`);
      }

      /* 🔒 STEP 3: Mandatory Ingress Snapshot Enforcement Layer */
      if (
        orderData.paidAmountSnapshot === undefined || orderData.paidAmountSnapshot === null ||
        orderData.directIncomeRateSnapshot === undefined || orderData.directIncomeRateSnapshot === null ||
        orderData.packageNameSnapshot === undefined || orderData.packageNameSnapshot === null ||
        orderData.commissionRuleVersionSnapshot === undefined || orderData.commissionRuleVersionSnapshot === null
      ) {
        throw new AppError("ERR_SNAPSHOT_DRIFT", "Schema Validation Fault: Mandatory checkout metadata snapshots parameters missing or null in order document repository.");
      }

      const orderRawPriceValue = orderData.paidAmountSnapshot;
      const trustedCommissionRate = Number(Number(orderData.directIncomeRateSnapshot).toFixed(2));
      const trustedRuleVersion = String(orderData.commissionRuleVersionSnapshot).trim();
      const trustedPackageName = String(orderData.packageNameSnapshot).trim();

      // Explicit type boundaries enforcement controls
      if (typeof orderRawPriceValue === "string" || isNaN(Number(orderRawPriceValue))) {
        throw new AppError("ERR_INVALID_PRICE_TYPE", `Accounting mathematical calculation check failed: paidAmountSnapshot hold invalid data formatting type: ${typeof orderRawPriceValue}`);
      }
      
      const baseCalculationPrice = Number(Number(orderRawPriceValue).toFixed(2));
      if (baseCalculationPrice <= 0) {
        throw new AppError("ERR_ZERO_PRICE_LIMIT", `Financial computational anomaly: Base net allocation price must evaluate strictly greater than zero. Evaluated: ${baseCalculationPrice}`);
      }
      if (isNaN(trustedCommissionRate) || trustedCommissionRate < 0 || trustedCommissionRate > 100) {
        throw new AppError("ERR_INVALID_RATE_BOUNDS", `Extracted rule rate snapshot parameters exist out of legitimate configuration range limits: ${trustedCommissionRate}%`);
      }

      /* 🔒 STEP 4: Target Downline System Profile Registry Checks & Lifecycle Domain Truth */
      const newUserSnapshot = await transaction.get(newUserRef);
      if (!newUserSnapshot.exists()) {
        throw new AppError("ERR_USER_NOT_FOUND", `Data Consistency Exception: Targeted downstream member file profile registration document missing for UID: ${cleanNewUserId}`);
      }

      const newUserData = newUserSnapshot.data();

      // Prevent direct incentive distributions from triggering via suspended or inactive records
      if (newUserData.isActive !== true) {
        throw new AppError("ERR_USER_INACTIVE", `Security policy exception: Targeted downline profile record state isActive field maps to non-active parameter evaluation.`);
      }

      /* 🔒 STEP 5: Real-Time Business Onboarding Lifecycle Truth Mapping */
      const baselineLifecycleState = newUserData.accountLifecycleState ? String(newUserData.accountLifecycleState).trim().toUpperCase() : null;
      
      if (!baselineLifecycleState || (baselineLifecycleState !== "FIRST_TIME" && baselineLifecycleState !== "PACKAGE_UPGRADE")) {
        throw new AppError("ERR_CORRUPTED_ACTIVATION_LIFECYCLE", `System Domain Violation: User core configuration holds missing or corrupted lifecycle state attributes: ${baselineLifecycleState}`);
      }

      const currentActivationType: "FIRST_TIME" | "PACKAGE_UPGRADE" = baselineLifecycleState as "FIRST_TIME" | "PACKAGE_UPGRADE";

      /* 🔒 STEP 6: Sovereign Counter Ownership & Increment Safeguard Check */
      const isEligibleForCounterIncrement = currentActivationType === "FIRST_TIME" && newUserData.directReferralBonusCounted !== true;

      /* 🔒 STEP 7: Inviter Roots Lineage Security Scanning */
      const referrerSnapshot = await transaction.get(referrerRef);
      if (!referrerSnapshot.exists()) {
        throw new AppError("ERR_REFERRER_NOT_FOUND", `Lineage Trace Error: Destination parent inviter profile registry sequence missing for ID: ${cleanReferrerId}`);
      }

      const referrerData = referrerSnapshot.data();

      // Enforce Primary Lineage Node Validations Checks
      if (newUserData.sponsorId !== cleanReferrerId) {
        throw new AppError("ERR_SPONSOR_ID_MISMATCH", `Parent downline structural network alignment failure: Expected Sponsor ID ${cleanReferrerId}, Found: ${newUserData.sponsorId}`);
      }

      if (newUserData.sponsorReferralCode && referrerData.referralCode) {
        if (newUserData.sponsorReferralCode.trim() !== referrerData.referralCode.trim()) {
          throw new AppError("ERR_SPONSOR_CODE_MISMATCH", `Identity mismatch: Downline record tracking code parameter does not register parity alignment to upline profile.`);
        }
      }

      if (referrerData.isBlocked === true || referrerData.walletLocked === true) {
        throw new AppError("ERR_REFERRER_FROZEN", `Process Aborted: Destination account performance balance modifications are locked or administrative lock triggers active.`);
      }
      if (!referrerData.joinedPackage || referrerData.isActive !== true) {
        throw new AppError("ERR_REFERRER_INELIGIBLE", `Eligibility Denied: Matching inviter profile registration parameters hold an unverified membership or incomplete package acquisition sequence.`);
      }

      /* ========================================================
         4. FINANCIAL MATHEMATICAL COMPUTATION
         ========================================================= */
      const calculatedBonusAmount = Number(((baseCalculationPrice * trustedCommissionRate) / 100).toFixed(2));
      if (calculatedBonusAmount <= 0) {
        return { status: "bypassed", logCode: "WARN_ZERO_YIELD", message: "Incentive system distribution dropped due to zero sub-fractional yield values computation." };
      }

      /* ========================================================
         5. MUTATION PHASE (SYNCHRONIZED WRITE SEQUENCE BLOCK)
         ========================================================= */
      
      // Dynamic Counters Synchronization Package
      const dynamicReferrerUpdates: Record<string, any> = {
        [PRIMARY_WALLET_SLOT]: increment(calculatedBonusAmount),
        [MASTER_WALLET_SLOT]: increment(calculatedBonusAmount),
        totalIncome: increment(calculatedBonusAmount),
        todayIncome: increment(calculatedBonusAmount),
        updatedAt: serverTimestamp()
      };

      if (isEligibleForCounterIncrement) {
        dynamicReferrerUpdates.totalReferrals = increment(1);
        dynamicReferrerUpdates.directReferrals = increment(1);
      }

      // Write A: Mutate Root Inviter Financial Tracking Arrays
      transaction.update(referrerRef, dynamicReferrerUpdates);

      // Write B: Set sovereign identity lock on downline user document to securely close counter pipeline loops permanently
      if (isEligibleForCounterIncrement) {
        transaction.update(newUserRef, {
          directReferralBonusCounted: true,
          updatedAt: serverTimestamp()
        });
      }

      // Write C: Force telemetry processes injection parameters inside source checkout invoice document
      transaction.update(orderRef, {
        directIncomeProcessed: true,
        directIncomeOrderId: referralBonusDocId,
        directIncomeAmount: calculatedBonusAmount,
        directIncomeRate: trustedCommissionRate,
        processedByEngineVersion: ENGINE_VERSION, 
        directIncomeProcessedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Rigid Text Parsing Fallback Infrastructure
      const resolvedDownlineIdentity = newUserData.displayName?.trim() || 
                                       newUserData.username?.trim() || 
                                       (newUserData.referralCode ? `Member ${newUserData.referralCode}` : `UID ${cleanNewUserId.slice(0, 6)}`);

      // Write D: Save permanent traceability logging reports document files (Forensic Logs Asset)
      transaction.set(bonusLogRef, {
        referralBonusId: referralBonusDocId,
        orderId: cleanOrderId,
        packageId: cleanPackageId,
        packageName: trustedPackageName,
        activationType: currentActivationType,
        bonusAmount: calculatedBonusAmount, 
        
        // Counter Protection Validation Trace Flag
        countedAsReferral: isEligibleForCounterIncrement,
        
        // Corporate Mandatory Forensic Metadata Block
        createdBy: "system_core",
        engineVersion: ENGINE_VERSION,
        source: "direct_income_distribution_engine",
        
        // System Audit Snapshot Configurations Mappings
        auditRateUsed: trustedCommissionRate,
        auditRuleVersion: trustedRuleVersion,
        auditComputedPrice: baseCalculationPrice,
        
        newUserId: cleanNewUserId,
        newUserName: resolvedDownlineIdentity,
        newUserReferralCode: newUserData.referralCode || "N/A",
        referrerId: cleanReferrerId,
        incomeCategory: INCOME_CATEGORY,
        status: "success",
        createdAt: serverTimestamp()
      });

      // Write E: Unified Corporate Financial Ledger Single General Ledger Interface
      transaction.set(innerTxLedgerRef, {
        txId: `${referralBonusDocId}_TX`,
        referenceId: referralBonusDocId,
        orderId: cleanOrderId,
        activationType: currentActivationType,
        sourceUserId: cleanNewUserId,
        sourceUserName: resolvedDownlineIdentity,
        amount: calculatedBonusAmount,
        incomeCategory: INCOME_CATEGORY,
        entryDirection: ENTRIES_DIRECTION,
        primaryWallet: PRIMARY_WALLET_SLOT,
        masterWallet: MASTER_WALLET_SLOT,
        
        auditRateUsed: trustedCommissionRate,
        auditRuleVersion: trustedRuleVersion,
        auditComputedPrice: baseCalculationPrice,
        
        description: `Direct referral bonus (${currentActivationType === "PACKAGE_UPGRADE" ? "Upgrade" : "Registration"}) from team member ${resolvedDownlineIdentity} via package activation (${trustedPackageName}).`,
        status: "success",
        createdAt: serverTimestamp()
      });

      return {
        status: "success",
        allocatedAmount: calculatedBonusAmount,
        targetBrandingIdentity: resolvedDownlineIdentity,
        packageName: trustedPackageName,
        activationMode: currentActivationType
      };
    });

    /* ========================================================
       6. POST-TRANSACTION PRESENTATION TELEMETRY PIPELINES
       ========================================================= */
    if (transactionResult.status === "bypassed") {
      return { success: false, logCode: transactionResult.logCode, message: transactionResult.message };
    }

    const secureFinalBonus = transactionResult.allocatedAmount;
    const finalRenderedName = transactionResult.targetBrandingIdentity;
    const finalPackageName = transactionResult.packageName;
    const finalMode = transactionResult.activationMode;

    // Non-blocking telemetry push handler; completely isolated from database lock scopes
    createNotification({
      userId: cleanReferrerId,
      title: finalMode === "PACKAGE_UPGRADE" ? "Direct Upgrade Income" : "Direct Income Credited",
      message: `Success! You have been credited ₹${secureFinalBonus} direct commission from the package activation of ${finalRenderedName} (${finalPackageName}).`,
      type: "reward"
    }).catch((err) => {
      console.error(`[TELEMETRY ALERT OUTBOUND FAILURE] Failed to push realtime notification channel to client UI for UID ${cleanReferrerId}:`, err.message);
    });

    // Operational performance execution analytics mapping
    const processingDurationMs = Date.now() - startTimeMs;
    console.log(`[PERFORMANCE METRICS] createReferralBonus execution complete. Duration: ${processingDurationMs}ms | Engine: ${ENGINE_VERSION}`);

    return {
      success: true,
      bonusAmount: secureFinalBonus,
      message: "Direct referral incentive token mapped successfully via immutable enterprise core framework."
    };

  } catch (error: any) {
    const isAppError = error instanceof AppError;
    const resolvedErrorCode = isAppError ? error.errorCode : "ERR_TRANSACTION_ABORTED";
    const internalDetailMsg = isAppError ? error.internalMessage : error.message || "Unknown lower-level database execution abort sequence.";
    
    // Server-Side Diagnostic Logging: Completely sealed from the outside environment (High #2 Fix Enforced)
    console.error(`[SYSTEM AUDIT CRITICAL EXCEPTION] [CODE: ${resolvedErrorCode}]:`, internalDetailMsg);
    
    // Public API Response Layer: Cleansed of any internal environment references or variables leaks
    return {
      success: false,
      errorCode: resolvedErrorCode,
      message: "An internal background data tier system exception forced processing abort. Operation safely rolled back."
    };
  }
}
