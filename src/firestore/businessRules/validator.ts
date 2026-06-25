import {
  ProfitabilityRules,
  ReferralRules,
  WatchEarnRules,
  WalletRules,
  CreatorEconomyRules,
  FeatureFlags,
  BusinessRulesConfig,
} from "./types";

// ======================================================
// Generic Validators
// ======================================================

function ensureNumber(
  value: unknown,
  field: string
): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new Error(`${field} must be a valid number.`);
  }

  return value;
}

function ensureBoolean(
  value: unknown,
  field: string
): boolean {
  if (typeof value !== "boolean") {
    throw new Error(`${field} must be boolean.`);
  }

  return value;
}

function ensurePositive(
  value: number,
  field: string
): number {
  if (value < 0) {
    throw new Error(`${field} cannot be negative.`);
  }

  return value;
}

function ensurePercentage(
  value: number,
  field: string
): number {
  if (value < 0 || value > 100) {
    throw new Error(`${field} must be between 0 and 100.`);
  }

  return value;
}

// ======================================================
// Profitability
// ======================================================

export function validateProfitabilityRules(
  rules: ProfitabilityRules
): ProfitabilityRules {

  ensurePositive(
    ensureNumber(rules.orderProfit, "orderProfit"),
    "orderProfit"
  );

  ensurePositive(
    ensureNumber(rules.cashbackExpense, "cashbackExpense"),
    "cashbackExpense"
  );

  ensurePositive(
    ensureNumber(rules.referralExpense, "referralExpense"),
    "referralExpense"
  );

  ensurePositive(
    ensureNumber(rules.rewardExpense, "rewardExpense"),
    "rewardExpense"
  );

  ensurePositive(
    ensureNumber(rules.creatorExpense, "creatorExpense"),
    "creatorExpense"
  );

  ensurePositive(
    ensureNumber(
      rules.protectionFundExpense,
      "protectionFundExpense"
    ),
    "protectionFundExpense"
  );

  return rules;
}

// ======================================================
// Referral
// ======================================================

export function validateReferralRules(
  rules: ReferralRules
): ReferralRules {

  ensurePercentage(
    ensureNumber(
      rules.level1Commission,
      "level1Commission"
    ),
    "level1Commission"
  );

  ensurePercentage(
    ensureNumber(
      rules.level2Commission,
      "level2Commission"
    ),
    "level2Commission"
  );

  ensurePercentage(
    ensureNumber(
      rules.level3Commission,
      "level3Commission"
    ),
    "level3Commission"
  );

  ensurePercentage(
    ensureNumber(
      rules.level4Commission,
      "level4Commission"
    ),
    "level4Commission"
  );

  return rules;
}

// ======================================================
// Watch & Earn
// ======================================================

export function validateWatchEarnRules(
  rules: WatchEarnRules
): WatchEarnRules {

  ensurePositive(
    ensureNumber(
      rules.videosRequired,
      "videosRequired"
    ),
    "videosRequired"
  );

  ensurePositive(
    ensureNumber(
      rules.rewardAmount,
      "rewardAmount"
    ),
    "rewardAmount"
  );

  ensurePositive(
    ensureNumber(
      rules.requiredSales,
      "requiredSales"
    ),
    "requiredSales"
  );

  ensurePositive(
    ensureNumber(
      rules.maxActiveCycles,
      "maxActiveCycles"
    ),
    "maxActiveCycles"
  );

  ensurePositive(
    ensureNumber(
      rules.minimumWatchDuration,
      "minimumWatchDuration"
    ),
    "minimumWatchDuration"
  );

  return rules;
}

// ======================================================
// Wallet
// ======================================================

export function validateWalletRules(
  rules: WalletRules
): WalletRules {

  ensurePositive(
    ensureNumber(
      rules.minimumWithdrawal,
      "minimumWithdrawal"
    ),
    "minimumWithdrawal"
  );

  ensurePositive(
    ensureNumber(
      rules.withdrawalCharge,
      "withdrawalCharge"
    ),
    "withdrawalCharge"
  );

  ensureBoolean(
    rules.kycRequired,
    "kycRequired"
  );

  ensurePositive(
    ensureNumber(
      rules.maxDailyWithdrawal,
      "maxDailyWithdrawal"
    ),
    "maxDailyWithdrawal"
  );

  return rules;
}

// ======================================================
// Creator Economy
// ======================================================

export function validateCreatorEconomyRules(
  rules: CreatorEconomyRules
): CreatorEconomyRules {

  ensurePercentage(
    ensureNumber(
      rules.creatorRevenueShare,
      "creatorRevenueShare"
    ),
    "creatorRevenueShare"
  );

  ensurePercentage(
    ensureNumber(
      rules.affiliateRevenueShare,
      "affiliateRevenueShare"
    ),
    "affiliateRevenueShare"
  );

  ensurePositive(
    ensureNumber(
      rules.minimumPayout,
      "minimumPayout"
    ),
    "minimumPayout"
  );

  return rules;
}

// ======================================================
// Feature Flags
// ======================================================

export function validateFeatureFlags(
  flags: FeatureFlags
): FeatureFlags {

  ensureBoolean(flags.ecommerceEnabled, "ecommerceEnabled");
  ensureBoolean(flags.referralEnabled, "referralEnabled");
  ensureBoolean(flags.watchEarnEnabled, "watchEarnEnabled");
  ensureBoolean(flags.creatorEconomyEnabled, "creatorEconomyEnabled");
  ensureBoolean(flags.cashbackEnabled, "cashbackEnabled");
  ensureBoolean(flags.adsEnabled, "adsEnabled");
  ensureBoolean(flags.walletEnabled, "walletEnabled");
  ensureBoolean(flags.loyaltyEnabled, "loyaltyEnabled");

  return flags;
}

// ======================================================
// Complete Config
// ======================================================

export function validateBusinessRules(
  config: BusinessRulesConfig
): BusinessRulesConfig {

  validateProfitabilityRules(config.profitability);
  validateReferralRules(config.referral);
  validateWatchEarnRules(config.watchEarn);
  validateWalletRules(config.wallet);
  validateCreatorEconomyRules(config.creatorEconomy);
  validateFeatureFlags(config.featureFlags);

  return config;
}
