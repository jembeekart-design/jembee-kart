// src/jembee-governance/services/mlmConfigService.ts

import {
  businessRules,
  ReferralRules,
} from "@/firestore/businessRules";

export interface MlmScannerConfig {
  level1Commission: number;
  level2Commission: number;
  level3Commission: number;
  level4Commission: number;
}

export class MlmConfigService {

  /**
   * Get Referral / MLM Rules
   */
  async getRules(): Promise<ReferralRules> {
    return businessRules.getReferralRules();
  }

  /**
   * Build Scanner Configuration
   */
  async getScannerConfig(): Promise<MlmScannerConfig> {

    const rules =
      await this.getRules();

    return {
      level1Commission:
        rules.level1Commission,

      level2Commission:
        rules.level2Commission,

      level3Commission:
        rules.level3Commission,

      level4Commission:
        rules.level4Commission,
    };

  }

  /**
   * Validate Configuration
   */
  async validate(): Promise<boolean> {

    const rules =
      await this.getRules();

    return [

      rules.level1Commission,
      rules.level2Commission,
      rules.level3Commission,
      rules.level4Commission,

    ].every(

      (value) =>
        Number.isFinite(value) &&
        value >= 0

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
   * Clear Cache
   */
  refresh(): void {

    businessRules.clearCache();

  }

}

export const mlmConfigService =
  new MlmConfigService();
