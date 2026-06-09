/* ========================================================
   TYPE DEFINITIONS & PLATFORM SAFETY LAYER
   ======================================================== */
export type MLMIncomeType = "directIncome" | "levelIncome";

export interface MLMLevelConfig {
  readonly level: number;
  readonly percentage: number;
  readonly incomeType: MLMIncomeType;
}

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
// Enforced through explicit type notation for clean and native IDE inference
export const MLM_LEVELS_CONFIG: readonly MLMLevelConfig[] = Object.freeze([
  { level: 1, percentage: 5, incomeType: "directIncome" }, // 5% of net product profit margin
  { level: 2, percentage: 2, incomeType: "levelIncome" }   // 2% of net product profit margin
]);

/* ========================================================
   EXPLICIT ON-DEMAND VALIDATION ENGINE
   ======================================================== */
function validateMLMConfig(): { success: boolean; totalPercentage: number; message: string } {
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

      if (config.percentage > MLM_SECURITY_GUARDS.MAX_SINGLE_LEVEL_PERCENTAGE) {
        throw new Error(
          `CRITICAL SECURITY FAILURE: Level ${config.level} percentage (${config.percentage}%) is too high. ` +
          `Single level allocation cannot exceed the maximum limit of ${MLM_SECURITY_GUARDS.MAX_SINGLE_LEVEL_PERCENTAGE}%.`
        );
      }

      if (config.level !== expectedLevel) {
        throw new Error(`Invalid MLM level sequence. Expected continuous level ${expectedLevel}, but found ${config.level}.`);
      }

      if (usedLevels.has(config.level)) {
        throw new Error(`Duplicate MLM level matrix index detected: ${config.level}`);
      }
      
      usedLevels.add(config.level);
      calculatedTotal += config.percentage;
      expectedLevel++;
    }

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
export const MLM_CONFIG_STATUS = Object.freeze(validateMLMConfig());

// RESILIENT BOOTSTRAP SHIELD: Logs runtime deviation but keeps core app alive!
if (!MLM_CONFIG_STATUS.success) {
  console.error(
    "⚠️ CRITICAL SYSTEM NOTICE: MLM Core validation failed. " +
    "Secondary subsystem disabled automatically to safeguard Core Ecommerce Engine. " +
    `Reason: ${MLM_CONFIG_STATUS.message}`
  );
}
