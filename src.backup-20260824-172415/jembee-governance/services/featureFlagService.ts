import {
  businessRules,
  FeatureFlags,
} from "@/firestore/businessRules";

export class FeatureFlagService {

  /**
   * Load Feature Flags
   */
  async getFlags(): Promise<FeatureFlags> {

    return businessRules.getFeatureFlags();

  }

  /**
   * Ecommerce
   */
  async ecommerceEnabled(): Promise<boolean> {

    return (
      await this.getFlags()
    ).ecommerceEnabled;

  }

  /**
   * Referral
   */
  async referralEnabled(): Promise<boolean> {

    return (
      await this.getFlags()
    ).referralEnabled;

  }

  /**
   * Watch Earn
   */
  async watchEarnEnabled(): Promise<boolean> {

    return (
      await this.getFlags()
    ).watchEarnEnabled;

  }

  /**
   * Creator Economy
   */
  async creatorEconomyEnabled(): Promise<boolean> {

    return (
      await this.getFlags()
    ).creatorEconomyEnabled;

  }

  /**
   * Cashback
   */
  async cashbackEnabled(): Promise<boolean> {

    return (
      await this.getFlags()
    ).cashbackEnabled;

  }

  /**
   * Wallet
   */
  async walletEnabled(): Promise<boolean> {

    return (
      await this.getFlags()
    ).walletEnabled;

  }

  /**
   * Ads
   */
  async adsEnabled(): Promise<boolean> {

    return (
      await this.getFlags()
    ).adsEnabled;

  }

  /**
   * Loyalty
   */
  async loyaltyEnabled(): Promise<boolean> {

    return (
      await this.getFlags()
    ).loyaltyEnabled;

  }

  /**
   * Health Check
   */
  async health(): Promise<boolean> {

    try {

      await this.getFlags();

      return true;

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

export const featureFlagService =
  new FeatureFlagService();
