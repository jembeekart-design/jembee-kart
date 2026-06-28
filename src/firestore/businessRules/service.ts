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
  loadBusinessRules,
  loadProfitabilityRules,
  loadReferralRules,
  loadWatchEarnRules,
  loadWalletRules,
  loadCreatorEconomyRules,
  loadFeatureFlags,
  loadMetadata,
  clearBusinessRulesCache,
  getBusinessRulesCacheStats,
} from "./loader";

import { doc, setDoc } from "firebase/firestore";
import { db } from "../../firebase/config";
import {
  BUSINESS_RULES_COLLECTION,
  BUSINESS_RULE_DOCUMENTS,
} from "./defaults";

// ======================================================
// JembeeKart Business Rules Service
// Production Ready
// ======================================================

class BusinessRulesService {

  // ====================================================
  // Complete Config
  // ====================================================

  async getAllRules(): Promise<BusinessRulesConfig> {
    return loadBusinessRules();
  }

  // ====================================================
  // Profitability
  // ====================================================

  async getProfitabilityRules(): Promise<ProfitabilityRules> {
    return loadProfitabilityRules();
  }

  // ====================================================
  // Referral
  // ====================================================

  async getReferralRules(): Promise<ReferralRules> {
    return loadReferralRules();
  }

  // ====================================================
  // Watch & Earn
  // ====================================================

  async getWatchEarnRules(): Promise<WatchEarnRules> {
    return loadWatchEarnRules();
  }

  // ====================================================
  // Wallet
  // ====================================================

  async getWalletRules(): Promise<WalletRules> {
    return loadWalletRules();
  }

  // ====================================================
  // Creator Economy
  // ====================================================

  async getCreatorEconomyRules(): Promise<CreatorEconomyRules> {
    return loadCreatorEconomyRules();
  }

  // ====================================================
  // Feature Flags
  // ====================================================

  async getFeatureFlags(): Promise<FeatureFlags> {
    return loadFeatureFlags();
  }

  // ====================================================
  // Metadata
  // ====================================================

  async getMetadata(): Promise<BusinessRulesMetadata> {
    return loadMetadata();
  }
 async saveProfitabilityRules(
  rules: ProfitabilityRules
): Promise<void> {
  await setDoc(
    doc(
      db,
      BUSINESS_RULES_COLLECTION,
      BUSINESS_RULE_DOCUMENTS.profitability
    ),
    rules,
    {
      merge: true,
    }
  );

  this.clearCache();
}

  async saveWatchEarnRules(
  rules: WatchEarnRules
): Promise<void> {

  await setDoc(
    doc(
      db,
      BUSINESS_RULES_COLLECTION,
      BUSINESS_RULE_DOCUMENTS.watchEarn
    ),
    rules,
    {
      merge: true,
    }
  );

  this.clearCache();
}

  async saveReferralRules(
  rules: ReferralRules
): Promise<void> {

  await setDoc(
    doc(
      db,
      BUSINESS_RULES_COLLECTION,
      BUSINESS_RULE_DOCUMENTS.referral
    ),
    rules,
    {
      merge: true,
    }
  );

  this.clearCache();

}

  async saveWalletRules(
  rules: WalletRules
): Promise<void> {

  await setDoc(
    doc(
      db,
      BUSINESS_RULES_COLLECTION,
      BUSINESS_RULE_DOCUMENTS.wallet
    ),
    rules,
    {
      merge: true,
    }
  );

  this.clearCache();

}

  async saveCreatorEconomyRules(
  rules: CreatorEconomyRules
): Promise<void> {

  await setDoc(
    doc(
      db,
      BUSINESS_RULES_COLLECTION,
      BUSINESS_RULE_DOCUMENTS.creatorEconomy
    ),
    rules,
    {
      merge: true,
    }
  );

  this.clearCache();

}
  
  // ====================================================
  // Version
  // ====================================================

  async getVersion(): Promise<string> {
    const metadata = await this.getMetadata();
    return metadata.version;
  }

  // ====================================================
  // Health
  // ====================================================

  async isHealthy(): Promise<boolean> {
    try {
      await this.getAllRules();
      return true;
    } catch {
      return false;
    }
  }

  // ====================================================
  // Cache
  // ====================================================

  clearCache(): void {
    clearBusinessRulesCache();
  }

  getCacheStats() {
    return getBusinessRulesCacheStats();
  }

  // ====================================================
  // Refresh
  // ====================================================

  async refresh(): Promise<BusinessRulesConfig> {
    this.clearCache();
    return this.getAllRules();
  }

  // ====================================================
  // Environment
  // ====================================================

  getEnvironment():
    | "development"
    | "staging"
    | "production" {

    switch (process.env.NODE_ENV) {

      case "production":
        return "production";

      case "test":
        return "staging";

      default:
        return "development";
    }
  }

  // ====================================================
  // Health Report
  // ====================================================

  async getHealthReport() {

    const metadata =
      await this.getMetadata();

    return {

      healthy:
        await this.isHealthy(),

      version:
        metadata.version,

      updatedAt:
        metadata.updatedAt,

      updatedBy:
        metadata.updatedBy,

      environment:
        this.getEnvironment(),

      cache:
        this.getCacheStats(),

      generatedAt:
        new Date().toISOString(),

    };
  }
}

// ======================================================
// Singleton
// ======================================================

export const businessRules =
  new BusinessRulesService();
