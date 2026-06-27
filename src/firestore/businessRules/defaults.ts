import {
  BusinessRulesConfig,
} from "./types";

// ======================================================
// DEFAULT BUSINESS RULES
// Used only if Firestore data is unavailable.
// Production values should always come from Firestore.
// ======================================================

export const DEFAULT_BUSINESS_RULES: BusinessRulesConfig = {
  profitability: {
    orderProfit: 100,
    cashbackPercentage: 5,
    cashbackExpense: 10,
    referralExpense: 10,
    rewardExpense: 10,
    creatorExpense: 5,
    protectionFundExpense: 5,
  },

  referral: {
    level1Commission: 10,
    level2Commission: 5,
    level3Commission: 2,
    level4Commission: 1,
  },

  watchEarn: {
    rewardPerVideo: 1,
    watchDurationPerReward: 30,
    videosRequired: 100,
    rewardAmount: 50,
    requiredSales: 5,
    maxActiveCycles: 1,
    minimumWatchDuration: 30,
  },

  wallet: {
    minimumWithdrawal: 200,
    withdrawalCharge: 0,
    withdrawalChargeType: "FIXED",
    kycRequired: true,
    maxDailyWithdrawal: 3,
  },

  creatorEconomy: {
    creatorRevenueShare: 20,
    affiliateRevenueShare: 10,
    minimumPayout: 500,
  },

  featureFlags: {
    ecommerceEnabled: true,
    referralEnabled: true,
    watchEarnEnabled: true,
    creatorEconomyEnabled: true,
    cashbackEnabled: true,
    adsEnabled: true,
    walletEnabled: true,
    loyaltyEnabled: true,
  },

  metadata: {
    version: "1.0.0",
    updatedAt: null,
    updatedBy: "system",
  },
};

// ======================================================
// CACHE SETTINGS
// ======================================================

export const BUSINESS_RULES_COLLECTION =
  "business_rules";

export const BUSINESS_RULES_CACHE_TTL =
  5 * 60 * 1000;

// ======================================================
// DOCUMENT IDS
// ======================================================

export const BUSINESS_RULE_DOCUMENTS = {
  profitability: "profitability",
  referral: "referral",
  watchEarn: "watchEarn",
  wallet: "wallet",
  creatorEconomy: "creatorEconomy",
  featureFlags: "featureFlags",
  metadata: "metadata",
} as const;
