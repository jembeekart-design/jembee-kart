import {
  businessRules,
  WalletRules,
} from "@/firestore/businessRules";

export interface WalletScannerConfig {
  minimumWithdrawal: number;
  withdrawalCharge: number;
  withdrawalChargeType: "FIXED" | "PERCENTAGE";
  kycRequired: boolean;
  maxDailyWithdrawal: number;
}

export class WalletConfigService {

  /**
   * Get Wallet Rules
   */
  async getRules(): Promise<WalletRules> {
    return businessRules.getWalletRules();
  }

  /**
   * Scanner Configuration
   */
  async getScannerConfig(): Promise<WalletScannerConfig> {

    const rules =
      await this.getRules();

    return {
      minimumWithdrawal:
        rules.minimumWithdrawal,

      withdrawalCharge:
        rules.withdrawalCharge,

      withdrawalChargeType:
        rules.withdrawalChargeType,

      kycRequired:
        rules.kycRequired,

      maxDailyWithdrawal:
        rules.maxDailyWithdrawal,
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
        rules.minimumWithdrawal
      ) &&
      rules.minimumWithdrawal >= 0 &&

      Number.isFinite(
        rules.withdrawalCharge
      ) &&
      rules.withdrawalCharge >= 0 &&

      Number.isFinite(
        rules.maxDailyWithdrawal
      ) &&
      rules.maxDailyWithdrawal >= 0 &&

      (
        rules.withdrawalChargeType ===
          "FIXED" ||
        rules.withdrawalChargeType ===
          "PERCENTAGE"
      ) &&

      typeof rules.kycRequired ===
        "boolean"
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

export const walletConfigService =
  new WalletConfigService();
