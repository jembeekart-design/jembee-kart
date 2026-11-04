import {
  BusinessRulesConfig,
  ProfitabilityRules,
  ReferralRules,
  WatchEarnRules,
  WalletRules,
  CreatorEconomyRules,
  FeatureFlags,
  BusinessRulesMetadata,
  VideoAdsRules,
} from "./types";

import {
  loadBusinessRules,
  loadProfitabilityRules,
  loadReferralRules,
  loadWatchEarnRules,
  loadVideoAdsRules,
  loadWalletRules,
  loadCreatorEconomyRules,
  loadFeatureFlags,
  loadMetadata,
  clearBusinessRulesCache,
  getBusinessRulesCacheStats,
} from "./loader";

import { auth } from "../../firebase/config";

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
  // Global Video Ads
  // ====================================================
  async getVideoAdsRules(): Promise<VideoAdsRules> {
    return loadVideoAdsRules();
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
  private async saveSection(section: string, rules: unknown): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error("Admin login required");
    const token = await user.getIdToken();
    const response = await fetch("/api/admin/business-rules", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ section, rules }),
      cache: "no-store",
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || result.success !== true) throw new Error(typeof result.message === "string" ? result.message : "Business rules could not be saved.");
    this.clearCache();
  }

  async saveProfitabilityRules(rules: ProfitabilityRules): Promise<void> {
    await this.saveSection("profitability", rules);
  }

  async saveVideoAdsRules(rules: VideoAdsRules): Promise<void> {
    await this.saveSection("videoAds", rules);
  }

  async saveWatchEarnRules(rules: WatchEarnRules): Promise<void> {
    await this.saveSection("watchEarn", rules);
  }

  async saveReferralRules(rules: ReferralRules): Promise<void> {
    await this.saveSection("referral", rules);
  }

  async saveWalletRules(rules: WalletRules): Promise<void> {
    await this.saveSection("wallet", rules);
  }

  async saveCreatorEconomyRules(rules: CreatorEconomyRules): Promise<void> {
    await this.saveSection("creatorEconomy", rules);
  }

  async saveFeatureFlags(flags: FeatureFlags): Promise<void> {
    await this.saveSection("featureFlags", flags);
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
