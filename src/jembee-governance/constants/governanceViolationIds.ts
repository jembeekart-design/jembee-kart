// src/jembee-governance/constants/governanceViolationIds.ts

// ======================================================
// JEMBEEKART GOVERNANCE ENGINE
// VIOLATION IDS
// ======================================================

export const GOVERNANCE_VIOLATION_IDS = {

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

  // ====================================================
  // WALLET
  // ====================================================

  WALLET_UNSAFE_UPDATE:
    "WALLET_UNSAFE_UPDATE",

  WITHDRAWAL_KYC_MISSING:
    "WITHDRAWAL_KYC_MISSING",

  NEGATIVE_WALLET_BALANCE:
    "NEGATIVE_WALLET_BALANCE",

  WALLET_MISMATCH:
    "WALLET_MISMATCH",

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

  // ====================================================
  // WATCH & EARN
  // ====================================================

  WATCH_EARN_RULE_FAILED:
    "WATCH_EARN_RULE_FAILED",

  WATCH_EARN_INVALID_REWARD:
    "WATCH_EARN_INVALID_REWARD",

  WATCH_EARN_UNLOCK_FAILED:
    "WATCH_EARN_UNLOCK_FAILED",

  // ====================================================
  // FIRESTORE
  // ====================================================

  FIRESTORE_RULE_MISSING:
    "FIRESTORE_RULE_MISSING",

  FIRESTORE_COLLECTION_MISSING:
    "FIRESTORE_COLLECTION_MISSING",

  FIRESTORE_INDEX_MISSING:
    "FIRESTORE_INDEX_MISSING",

  // ====================================================
  // ADMIN CONTROL
  // ====================================================

  ADMIN_CONTROL_MISSING:
    "ADMIN_CONTROL_MISSING",

  FEATURE_FLAG_MISSING:
    "FEATURE_FLAG_MISSING",

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
  // ANTI FRAUD
  // ====================================================

  FRAUD_BYPASS_DETECTED:
    "FRAUD_BYPASS_DETECTED",

  SELF_REFERRAL_PROTECTION_MISSING:
    "SELF_REFERRAL_PROTECTION_MISSING",

  DUPLICATE_ACCOUNT_DETECTED:
    "DUPLICATE_ACCOUNT_DETECTED",

  // ====================================================
  // CREATOR ECONOMY
  // ====================================================

  CREATOR_REVENUE_INVALID:
    "CREATOR_REVENUE_INVALID",

  CREATOR_PAYOUT_FAILED:
    "CREATOR_PAYOUT_FAILED",

  // ====================================================
  // DEPLOYMENT
  // ====================================================

  DEPLOYMENT_BLOCKED:
    "DEPLOYMENT_BLOCKED",

  DEPLOYMENT_CONFIGURATION_INVALID:
    "DEPLOYMENT_CONFIGURATION_INVALID",

} as const;

// ======================================================
// TYPE
// ======================================================

export type GovernanceViolationId =
  typeof GOVERNANCE_VIOLATION_IDS[
    keyof typeof GOVERNANCE_VIOLATION_IDS
  ];
