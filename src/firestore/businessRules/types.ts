import { Timestamp } from "firebase/firestore";

// ======================================================
// Profitability
// ======================================================

export interface ProfitabilityRules {

  /**
   * Minimum order profit required
   */
  orderProfit: number;

  cashbackPercentage: number;

  cashbackExpense: number;

  referralExpense: number;

  rewardExpense: number;

  creatorExpense: number;

  protectionFundExpense: number;

}

// ======================================================
// Referral
// ======================================================

export interface ReferralRules {
  level1Commission: number;
  level2Commission: number;
  level3Commission: number;
  level4Commission: number;
}

// ======================================================
// Watch & Earn
// ======================================================

export interface WatchEarnRules {
  rewardPerVideo: number; 
  videosRequired: number;
  rewardAmount: number;
  requiredSales: number;
  maxActiveCycles: number;
  minimumWatchDuration: number;
}

// ======================================================
// Wallet
// ======================================================

export interface WalletRules {
  minimumWithdrawal: number;
  withdrawalCharge: number;
  withdrawalChargeType: "FIXED" | "PERCENTAGE";
  kycRequired: boolean;
  maxDailyWithdrawal: number;
}

// ======================================================
// Creator Economy
// ======================================================

export interface CreatorEconomyRules {
  creatorRevenueShare: number;
  affiliateRevenueShare: number;
  minimumPayout: number;
}

// ======================================================
// Feature Flags
// ======================================================

export interface FeatureFlags {
  ecommerceEnabled: boolean;
  referralEnabled: boolean;
  watchEarnEnabled: boolean;
  creatorEconomyEnabled: boolean;
  cashbackEnabled: boolean;
  adsEnabled: boolean;
  walletEnabled: boolean;
  loyaltyEnabled: boolean;
}

// ======================================================
// Metadata
// ======================================================

export interface BusinessRulesMetadata {
  version: string;
  updatedAt: Timestamp | null;
  updatedBy: string;
}

// ======================================================
// Complete Config
// ======================================================

export interface BusinessRulesConfig {
  profitability: ProfitabilityRules;
  referral: ReferralRules;
  watchEarn: WatchEarnRules;
  wallet: WalletRules;
  creatorEconomy: CreatorEconomyRules;
  featureFlags: FeatureFlags;
  metadata: BusinessRulesMetadata;
}

// ======================================================
// Cache
// ======================================================

export interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

// ======================================================
// Health Report
// ======================================================

export interface BusinessRulesHealth {
  healthy: boolean;
  version: string;
  environment: "development" | "staging" | "production";
  lastUpdated: string | null;
}

// ======================================================
// Metrics
// ======================================================

export interface BusinessRulesMetrics {
  totalReads: number;
  cacheHits: number;
  cacheMisses: number;
  firestoreReads: number;
  fallbackReads: number;
  validationFailures: number;
  lastRefresh: string | null;
}
