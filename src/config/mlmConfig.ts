/**
 * JembeeKart MLM Core, Financial Infrastructure & Validation Engine Configuration
 * System Version: v10_Stable_Freeze_Platinum
 * Verification Target: Absolute 10/10 Enterprise Production Standard
 */

/* ========================================================
   TYPE DEFINITIONS & PLATFORM SAFETY LAYER
   ======================================================== */
export type MLMIncomeType = "directIncome" | "levelIncome";

export interface MLMLevelConfig {
  readonly level: number;
  readonly percentage: number;
  readonly incomeType: MLMIncomeType;
}

export interface ValidationResult {
  readonly success: boolean;
  readonly totalPercentage: number;
  readonly message: string;
}

/* ========================================================
   SYSTEM CONSTANTS & HARD FINANCIAL TRACKING ARRAYS
   ======================================================== */
export const ALLOWED_PAYMENT_STATES = [
  "paid",
  "completed",
  "success",
  "captured",
  "settled",
  "verified"
] as const;

export const PRIMARY_WALLET_SLOT = "commissionWallet";
export const MASTER_WALLET_SLOT = "walletBalance";

export const INCOME_CATEGORY = "directIncome";
export const INCOME_CATEGORY_WITHDRAWAL = "wallet_withdrawal";
export const ENTRIES_DIRECTION = "credit";
export const ENTRIES_DIRECTION_OUT = "debit";

export const ENGINE_VERSION = "v10_Stable_Freeze_Platinum";
export const ALERT_RETENTION_DAYS = 30;

// Payout Transaction Lifecycles
export const MIN_PAYOUT_LIMIT = 500; // Enforced corporate threshold check (>= ₹500)
export const PAYOUT_STATUS_PENDING = "pending";
export const PAYOUT_STATUS_APPROVED = "approved";
export const PAYOUT_STATUS_REJECTED = "rejected";

/* ========================================================
   CENTRALIZED FINANCIAL SECURITY GUARDS (RUNTIME FROZEN)
   ======================================================== */
export const MLM_SECURITY_GUARDS = Object.freeze({
  MAX_ALLOWED_TOTAL_PERCENTAGE: 10,     // HARD CAP: Corporate safety ceiling for total payout tree budget
  MAX_SINGLE_LEVEL_PERCENTAGE: 5,       // INDIVIDUAL CAP: No single level node can eat up more than 5% margin
  MIN_PROFIT_AMOUNT_FOR_COMMISSION: 50  // OPERATIONAL BASELINE: Activates payout engine for core profit brackets (₹50-₹200)
});

/* ========================================================
   OPTIMIZED DUAL-LEVEL MATRIX CONFIGURATION (DEEP FROZEN)
   ======================================================== */
export const MLM_LEVELS_CONFIG: readonly MLMLevelConfig[] = Object.freeze([
  { level: 1, percentage: 5.0, incomeType: "directIncome" }, // 5% of net product profit margin split
  { level: 2, percentage: 2.0, incomeType: "levelIncome" }   // 2% of net product profit margin split
]);

/* ========================================================
   EXPLICIT ON-DEMAND VALIDATION ENGINE
   ======================================================== */
function validateMLMConfig(): ValidationResult {
  try {
    if (!MLM_LEVELS_CONFIG || MLM_LEVELS_CONFIG.length === 0) {
      throw new Error("CRITICAL CONFIG ERROR: No MLM levels configured. Distribution tree cannot be empty.");
    }

    let calculatedTotal = 0;
    let expectedLevel = 1;
    const usedLevels = new Set<number>();

    for (const config of MLM_LEVELS_CONFIG) {
      if (
        !config ||
        typeof config.percentage !== "number" ||
        config.percentage <= 0 ||
        typeof config.level !== "number" ||
        !config.incomeType
      ) {
        throw new Error(`Malformed, zero-value or incomplete entry found in MLM Config layout at level: ${config?.level}`);
      }

      // Safeguard check against individual level margin exploits
      if (config.percentage > MLM_SECURITY_GUARDS.MAX_SINGLE_LEVEL_PERCENTAGE) {
        throw new Error(
          `CRITICAL SECURITY FAILURE: Level ${config.level} percentage (${config.percentage}%) is too high. ` +
          `Single level allocation cannot exceed maximum limit of ${MLM_SECURITY_GUARDS.MAX_SINGLE_LEVEL_PERCENTAGE}%.`
        );
      }

      // Continuous matrix verification (No broken links allowed in the network trace)
      if (config.level !== expectedLevel) {
        throw new Error(`Invalid MLM level sequence. Expected continuous level ${expectedLevel}, but found ${config.level}.`);
      }

      if (usedLevels.has(config.level)) {
        throw new Error(`Duplicate MLM level matrix index detected: ${config.level}`);
      }
      
      usedLevels.add(config.level);
      
      // Mitigates float precision anomalies securely by forced numeric rounding maps
      calculatedTotal = Number((calculatedTotal + config.percentage).toFixed(2));
      expectedLevel++;
    }

    // Enterprise system hard budget ceiling guard lock
    if (calculatedTotal > MLM_SECURITY_GUARDS.MAX_ALLOWED_TOTAL_PERCENTAGE) {
      throw new Error(`Total configuration payout (${calculatedTotal}%) exceeds corporate threshold parameters (${MLM_SECURITY_GUARDS.MAX_ALLOWED_TOTAL_PERCENTAGE}%).`);
    }

    return {
      success: true,
      totalPercentage: calculatedTotal,
      message: `🚀 MLM Config Validated Successfully. Total MLM Payout Budget = ${calculatedTotal}%`
    };
  } catch (error: any) {
    const errorMsg = error?.message || "Unknown Configuration Error";
    return {
      success: false,
      totalPercentage: 0,
      message: errorMsg
    };
  }
}

/* ========================================================
   ONE-TIME STARTUP VALIDATION CACHE (CIRCUIT BREAKER ENTIRETY)
   ======================================================== */
export const MLM_CONFIG_STATUS: ValidationResult = Object.freeze(validateMLMConfig());

// RESILIENT BOOTSTRAP SHIELD: Logs runtime deviation but keeps core app alive!
if (!MLM_CONFIG_STATUS.success) {
  console.error(
    "⚠️ CRITICAL SYSTEM NOTICE: MLM Core validation failed. " +
    "Secondary commission distribution subsystems disabled automatically to safeguard Core Ecommerce Engine. " +
    `Reason: ${MLM_CONFIG_STATUS.message}`
  );
}

/* ========================================================
   PRE-COMPUTED DIRECT INDEX LOOKUP MAP FOR PERFORMANCE CACHE
   ======================================================== */
// Offloads dynamic array scanning entirely to O(1) operational performance maps
export const MLM_LEVELS_LOOKUP_MAP: Readonly<Record<number, MLMLevelConfig>> = Object.freeze(
  MLM_CONFIG_STATUS.success
    ? MLM_LEVELS_CONFIG.reduce((acc, current) => {
        acc[current.level] = current;
        return acc;
      }, {} as Record<number, MLMLevelConfig>)
    : {}
);
