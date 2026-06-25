import {
  doc,
  getDoc,
  DocumentData,
} from "firebase/firestore";

import { db } from "../firebase";

import {
  BusinessRulesConfig,
  ProfitabilityRules,
  ReferralRules,
  WatchEarnRules,
  WalletRules,
  CreatorEconomyRules,
  FeatureFlags,
  BusinessRulesMetadata,
} from "./types";

import {
  DEFAULT_BUSINESS_RULES,
  BUSINESS_RULES_COLLECTION,
  BUSINESS_RULE_DOCUMENTS,
} from "./defaults";

import { businessRulesCache } from "./cache";

import {
  validateProfitabilityRules,
  validateReferralRules,
  validateWatchEarnRules,
  validateWalletRules,
  validateCreatorEconomyRules,
  validateFeatureFlags,
} from "./validator";

// ======================================================
// Generic Loader
// ======================================================

async function loadRule<T>(
  documentId: string,
  fallback: T,
  validator?: (value: T) => T
): Promise<T> {

  const cached =
    businessRulesCache.get<T>(documentId);

  if (cached) {
    return cached;
  }

  try {

    const snapshot = await getDoc(
      doc(
        db,
        BUSINESS_RULES_COLLECTION,
        documentId
      )
    );

    if (!snapshot.exists()) {

      businessRulesCache.set(
        documentId,
        fallback
      );

      return fallback;

    }

    const data =
      snapshot.data() as T;

    const value =
      validator
        ? validator(data)
        : data;

    businessRulesCache.set(
      documentId,
      value
    );

    return value;

  } catch (error) {

    console.error(
      `[BusinessRules] Failed loading ${documentId}`,
      error
    );

    businessRulesCache.set(
      documentId,
      fallback
    );

    return fallback;

  }

}

// ======================================================
// Individual Loaders
// ======================================================

export const loadProfitabilityRules =
() =>
  loadRule<ProfitabilityRules>(
    BUSINESS_RULE_DOCUMENTS.profitability,
    DEFAULT_BUSINESS_RULES.profitability,
    validateProfitabilityRules
  );

export const loadReferralRules =
() =>
  loadRule<ReferralRules>(
    BUSINESS_RULE_DOCUMENTS.referral,
    DEFAULT_BUSINESS_RULES.referral,
    validateReferralRules
  );

export const loadWatchEarnRules =
() =>
  loadRule<WatchEarnRules>(
    BUSINESS_RULE_DOCUMENTS.watchEarn,
    DEFAULT_BUSINESS_RULES.watchEarn,
    validateWatchEarnRules
  );

export const loadWalletRules =
() =>
  loadRule<WalletRules>(
    BUSINESS_RULE_DOCUMENTS.wallet,
    DEFAULT_BUSINESS_RULES.wallet,
    validateWalletRules
  );

export const loadCreatorEconomyRules =
() =>
  loadRule<CreatorEconomyRules>(
    BUSINESS_RULE_DOCUMENTS.creatorEconomy,
    DEFAULT_BUSINESS_RULES.creatorEconomy,
    validateCreatorEconomyRules
  );

export const loadFeatureFlags =
() =>
  loadRule<FeatureFlags>(
    BUSINESS_RULE_DOCUMENTS.featureFlags,
    DEFAULT_BUSINESS_RULES.featureFlags,
    validateFeatureFlags
  );

export const loadMetadata =
() =>
  loadRule<BusinessRulesMetadata>(
    BUSINESS_RULE_DOCUMENTS.metadata,
    DEFAULT_BUSINESS_RULES.metadata
  );

// ======================================================
// Complete Config Loader
// ======================================================

export async function loadBusinessRules():

Promise<BusinessRulesConfig> {

  const [

    profitability,

    referral,

    watchEarn,

    wallet,

    creatorEconomy,

    featureFlags,

    metadata,

  ] = await Promise.all([

    loadProfitabilityRules(),

    loadReferralRules(),

    loadWatchEarnRules(),

    loadWalletRules(),

    loadCreatorEconomyRules(),

    loadFeatureFlags(),

    loadMetadata(),

  ]);

  return {

    profitability,

    referral,

    watchEarn,

    wallet,

    creatorEconomy,

    featureFlags,

    metadata,

  };

}

// ======================================================
// Cache Helpers
// ======================================================

export function clearBusinessRulesCache(): void {

  businessRulesCache.clear();

}

export function getBusinessRulesCacheStats() {

  return businessRulesCache.getStats();

}
