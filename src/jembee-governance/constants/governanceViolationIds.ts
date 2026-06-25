// src/jembee-governance/constants/governanceViolationIds.ts

// ======================================================
// JEMBEEKART GOVERNANCE ENGINE
// SHARED GOVERNANCE VIOLATION IDS
// ======================================================

export const GOVERNANCE_VIOLATION_IDS = Object.freeze({

  // ====================================================
  // ARCHITECTURE
  // ====================================================

  ARCHITECTURE_RULE_FAILED:
    "ARCHITECTURE_RULE_FAILED",

  ARCHITECTURE_LAYER_VIOLATION:
    "ARCHITECTURE_LAYER_VIOLATION",

  // ====================================================
  // PROFITABILITY
  // ====================================================

  PROFIT_MINIMUM_FAILED:
    "PROFIT_MINIMUM_FAILED",

  PROFIT_LOSS_DETECTED:
    "PROFIT_LOSS_DETECTED",

  NEGATIVE_NET_PROFIT:
    "NEGATIVE_NET_PROFIT",

  REWARD_EXPENSE_HIGH:
    "REWARD_EXPENSE_HIGH",

  CASHBACK_EXPENSE_HIGH:
    "CASHBACK_EXPENSE_HIGH",

  REFERRAL_EXPENSE_HIGH:
    "REFERRAL_EXPENSE_HIGH",

  CREATOR_EXPENSE_HIGH:
    "CREATOR_EXPENSE_HIGH",

  PROTECTION_FUND_HIGH:
    "PROTECTION_FUND_HIGH",

  // ====================================================
  // WALLET
  // ====================================================

  WALLET_UNSAFE_UPDATE:
    "WALLET_UNSAFE_UPDATE",

  WALLET_MISMATCH:
    "WALLET_MISMATCH",

  NEGATIVE_WALLET_BALANCE:
    "NEGATIVE_WALLET_BALANCE",

  WITHDRAWAL_KYC_MISSING:
    "WITHDRAWAL_KYC_MISSING",

  // ====================================================
  // MLM
  // ====================================================

  MLM_FORBIDDEN_INCOME:
    "MLM_FORBIDDEN_INCOME",

  MLM_HARDCODED_PERCENTAGE:
    "MLM_HARDCODED_PERCENTAGE",

  MLM_INVALID_COMMISSION:
    "MLM_INVALID_COMMISSION",

  MLM_DUPLICATE_COMMISSION:
    "MLM_DUPLICATE_COMMISSION",

  MLM_PARENT_CHAIN_INVALID:
    "MLM_PARENT_CHAIN_INVALID",

  // ====================================================
  // WATCH & EARN
  // ====================================================

  WATCH_EARN_RULE_FAILED:
    "WATCH_EARN_RULE_FAILED",

  WATCH_EARN_INVALID_REWARD:
    "WATCH_EARN_INVALID_REWARD",

  WATCH_EARN_UNLOCK_FAILED:
    "WATCH_EARN_UNLOCK_FAILED",

  WATCH_EARN_DUPLICATE_REWARD:
    "WATCH_EARN_DUPLICATE_REWARD",

  // ====================================================
  // FIRESTORE
  // ====================================================

  FIRESTORE_COLLECTION_MISSING:
    "FIRESTORE_COLLECTION_MISSING",

  FIRESTORE_RULE_MISSING:
    "FIRESTORE_RULE_MISSING",

  FIRESTORE_INDEX_MISSING:
    "FIRESTORE_INDEX_MISSING",

  FIRESTORE_PERMISSION_MISSING:
    "FIRESTORE_PERMISSION_MISSING",

  // ====================================================
  // SECURITY
  // ====================================================

  API_KEY_EXPOSED:
    "API_KEY_EXPOSED",

  FIREBASE_SECRET_EXPOSED:
    "FIREBASE_SECRET_EXPOSED",

  ADMIN_BYPASS_DETECTED:
    "ADMIN_BYPASS_DETECTED",

  // ====================================================
  // ADMIN CONTROL
  // ====================================================

  ADMIN_CONTROL_MISSING:
    "ADMIN_CONTROL_MISSING",

  FEATURE_FLAG_MISSING:
    "FEATURE_FLAG_MISSING",

  // ====================================================
  // THEME
  // ====================================================

  THEME_NOT_ADMIN_CONTROLLED:
    "THEME_NOT_ADMIN_CONTROLLED",

  HARDCODED_THEME_COLOR:
    "HARDCODED_THEME_COLOR",

  // ====================================================
  // PAGE CONNECTION
  // ====================================================

  BROKEN_PAGE_CONNECTION:
    "BROKEN_PAGE_CONNECTION",

  ORPHAN_PAGE:
    "ORPHAN_PAGE",

  // ====================================================
  // DUPLICATE CODE
  // ====================================================

  DUPLICATE_CODE_FOUND:
    "DUPLICATE_CODE_FOUND",

  // ====================================================
  // CREATOR ECONOMY
  // ====================================================

  CREATOR_REVENUE_INVALID:
    "CREATOR_REVENUE_INVALID",

  CREATOR_PAYOUT_FAILED:
    "CREATOR_PAYOUT_FAILED",

  // ====================================================
  // ANTI FRAUD
  // ====================================================

  FRAUD_BYPASS_DETECTED:
    "FRAUD_BYPASS_DETECTED",

  SELF_REFERRAL_PROTECTION_MISSING:
    "SELF_REFERRAL_PROTECTION_MISSING",

  DUPLICATE_ACCOUNT_DETECTED:
    "DUPLICATE_ACCOUNT_DETECTED",

  // ====================================================
  // PERFORMANCE
  // ====================================================

  PERFORMANCE_DEGRADED:
    "PERFORMANCE_DEGRADED",

  // ====================================================
  // DEPLOYMENT
  // ====================================================

  DEPLOYMENT_BLOCKED:
    "DEPLOYMENT_BLOCKED",

  DEPLOYMENT_CONFIGURATION_INVALID:
    "DEPLOYMENT_CONFIGURATION_INVALID",

} as const);

// ======================================================
// TYPES
// ======================================================

export type GovernanceViolationId =
  (typeof GOVERNANCE_VIOLATION_IDS)[keyof typeof GOVERNANCE_VIOLATION_IDS];
