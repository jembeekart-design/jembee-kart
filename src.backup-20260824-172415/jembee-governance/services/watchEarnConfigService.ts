// src/jembee-governance/services/watchEarnConfigService.ts

import {
  businessRules,
  WatchEarnRules,
} from "@/firestore/businessRules";

export class WatchEarnConfigService {

  /**
   * Get Watch & Earn Rules
   */
  async getRules(): Promise<WatchEarnRules> {
    return businessRules.getWatchEarnRules();
  }

  /**
   * Scanner Configuration
   */
  async getScannerConfig(): Promise<WatchEarnRules> {
    return this.getRules();
  }

  /**
   * Validate Configuration
   */
  async validate(): Promise<boolean> {

    const rules =
      await this.getRules();

    return (
      Number.isFinite(rules.videosRequired) &&
      rules.videosRequired > 0 &&

      Number.isFinite(rules.rewardAmount) &&
      rules.rewardAmount >= 0 &&

      Number.isFinite(rules.requiredSales) &&
      rules.requiredSales >= 0 &&

      Number.isFinite(rules.maxActiveCycles) &&
      rules.maxActiveCycles > 0 &&

      Number.isFinite(rules.minimumWatchDuration) &&
      rules.minimumWatchDuration > 0
    );

  }

  /**
   * Health Check
   */
  async health(): Promise<boolean> {

    try {

      return await this.validate();

    } catch {

      return false;

    }

  }

  /**
   * Refresh Cache
   */
  refresh(): void {

    businessRules.clearCache();

  }

}

export const watchEarnConfigService =
  new WatchEarnConfigService();
