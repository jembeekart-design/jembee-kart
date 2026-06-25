import {
  doc,
  getDoc,
  Timestamp,
} from "firebase/firestore";

import { db } from "./firebase";

// ======================================================
// JEMBEEKART BUSINESS RULES ENGINE
// Production Ready
// Part 1
// Imports + Types + Default Configuration
// ======================================================

// ======================================================
// PROFITABILITY
// ======================================================

export interface ProfitabilityRules {
  orderProfit: number;
  cashbackExpense: number;
  referralExpense: number;
  rewardExpense: number;
  creatorExpense: number;
  protectionFundExpense: number;
}

// ======================================================
// REFERRAL
// ======================================================

export interface ReferralRules {
  level1Commission: number;
  level2Commission: number;
  level3Commission: number;
  level4Commission: number;
}

// ======================================================
// WATCH & EARN
// ======================================================

export interface WatchEarnRules {
  videosRequired: number;
  rewardAmount: number;
  requiredSales: number;
}

// ======================================================
// WALLET
// ======================================================

export interface WalletRules {
  minimumWithdrawal: number;
  withdrawalCharge: number;
  kycRequired: boolean;
}

// ======================================================
// CREATOR ECONOMY
// ======================================================

export interface CreatorEconomyRules {
  creatorRevenueShare: number;
  affiliateRevenueShare: number;
}

// ======================================================
// FEATURE FLAGS
// ======================================================

export interface FeatureFlags {
  ecommerceEnabled: boolean;
  referralEnabled: boolean;
  watchEarnEnabled: boolean;
  creatorEconomyEnabled: boolean;
  cashbackEnabled: boolean;
  adsEnabled: boolean;
  walletEnabled: boolean;
}

// ======================================================
// METADATA
// ======================================================

export interface BusinessRulesMetadata {
  version: string;
  updatedAt: Timestamp | null;
  updatedBy: string;
}

// ======================================================
// COMPLETE CONFIG
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
// DEFAULT CONFIG
// Used if Firestore is unavailable
// ======================================================

export const DEFAULT_BUSINESS_RULES: BusinessRulesConfig = {
  profitability: {
    orderProfit: 100,
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
    videosRequired: 100,
    rewardAmount: 50,
    requiredSales: 5,
  },

  wallet: {
    minimumWithdrawal: 200,
    withdrawalCharge: 0,
    kycRequired: true,
  },

  creatorEconomy: {
    creatorRevenueShare: 20,
    affiliateRevenueShare: 10,
  },

  featureFlags: {
    ecommerceEnabled: true,
    referralEnabled: true,
    watchEarnEnabled: true,
    creatorEconomyEnabled: true,
    cashbackEnabled: true,
    adsEnabled: true,
    walletEnabled: true,
  },

  metadata: {
    version: "1.0.0",
    updatedAt: null,
    updatedBy: "system",
  },
};
