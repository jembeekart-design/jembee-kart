// src/jembee-governance/services/profitabilityConfigService.ts

import {
  businessRules,
  ProfitabilityRules,
} from "@/firestore/businessRules";

export interface ProfitabilityScannerInput {
  orderProfit: number;
  cashbackExpense: number;
  referralExpense: number;
  rewardExpense: number;
  creatorExpense: number;
  protectionFundExpense: number;
}

export class ProfitabilityConfigService {

  /**
   * Load Profitability Configuration
   */
  async getRules(): Promise<ProfitabilityRules> {
    return businessRules.getProfitabilityRules();
  }

  /**
   * Build Scanner Input
   * orderProfit must come from Order Engine /
   * Analytics Service / Profit Engine
   */
  async buildScannerInput(
    orderProfit: number
  ): Promise<ProfitabilityScannerInput> {

    const rules =
      await this.getRules();

    return {
      orderProfit,

      cashbackExpense:
        rules.cashbackExpense,

      referralExpense:
        rules.referralExpense,

      rewardExpense:
        rules.rewardExpense,

      creatorExpense:
        rules.creatorExpense,

      protectionFundExpense:
        rules.protectionFundExpense,
    };
  }

  /**
   * Validate Configuration
   */
  async validate(): Promise<boolean> {

    const rules =
      await this.getRules();

    const values = [
      rules.cashbackExpense,
      rules.referralExpense,
      rules.rewardExpense,
      rules.creatorExpense,
      rules.protectionFundExpense,
    ];

    return values.every(
      (value) =>
        typeof value === "number" &&
        Number.isFinite(value) &&
        value >= 0
    );
  }

  /**
   * Health Check
   */
  async health(): Promise<boolean> {

    try {

      const valid =
        await this.validate();

      return valid;

    } catch {

      return false;

    }

  }

  /**
   * Refresh Config Cache
   */
  refresh(): void {

    businessRules.clearCache();

  }

}

export const profitabilityConfigService =
  new ProfitabilityConfigService();
