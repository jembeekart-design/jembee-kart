import {
  businessRules,
  CreatorEconomyRules,
} from "@/firestore/businessRules";

export interface CreatorEconomyScannerConfig {
  creatorRevenueShare: number;
  affiliateRevenueShare: number;
  minimumPayout: number;
}

export class CreatorEconomyConfigService {

  /**
   * Get Creator Economy Rules
   */
  async getRules(): Promise<CreatorEconomyRules> {

    return businessRules.getCreatorEconomyRules();

  }

  /**
   * Scanner Configuration
   */
  async getScannerConfig():
  Promise<CreatorEconomyScannerConfig> {

    const rules =
      await this.getRules();

    return {

      creatorRevenueShare:
        rules.creatorRevenueShare,

      affiliateRevenueShare:
        rules.affiliateRevenueShare,

      minimumPayout:
        rules.minimumPayout,

    };

  }

  /**
   * Validate Configuration
   */
  async validate(): Promise<boolean> {

    const rules =
      await this.getRules();

    return (

      Number.isFinite(
        rules.creatorRevenueShare
      ) &&
      rules.creatorRevenueShare >= 0 &&

      Number.isFinite(
        rules.affiliateRevenueShare
      ) &&
      rules.affiliateRevenueShare >= 0 &&

      Number.isFinite(
        rules.minimumPayout
      ) &&
      rules.minimumPayout >= 0

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
   * Refresh Configuration
   */
  refresh(): void {

    businessRules.clearCache();

  }

}

export const creatorEconomyConfigService =
  new CreatorEconomyConfigService();
