// src/jembee-governance/scanners/profitabilityScanner.ts

import {
  GovernanceViolation,
} from "../types/governance.types";

export interface ProfitabilityInput {
  orderProfit: number;

  cashbackExpense?: number;
  referralExpense?: number;
  rewardExpense?: number;
  creatorExpense?: number;
  protectionFundExpense?: number;
}

export interface ProfitabilityReport {
  orderProfit: number;

  cashbackExpense: number;
  referralExpense: number;
  rewardExpense: number;
  creatorExpense: number;
  protectionFundExpense: number;

  totalExpense: number;
  netProfit: number;

  profitable: boolean;
}

export interface ProfitabilityScanResult {
  report: ProfitabilityReport;
  violations: GovernanceViolation[];
}

export class ProfitabilityScanner {
  /**
   * JembeeKart Rule
   */
  private readonly MINIMUM_NET_PROFIT = 50;

  public scan(
    input: ProfitabilityInput
  ): ProfitabilityScanResult {
    const violations: GovernanceViolation[] = [];

    const cashbackExpense =
      input.cashbackExpense ?? 0;

    const referralExpense =
      input.referralExpense ?? 0;

    const rewardExpense =
      input.rewardExpense ?? 0;

    const creatorExpense =
      input.creatorExpense ?? 0;

    const protectionFundExpense =
      input.protectionFundExpense ?? 0;

    const totalExpense =
      cashbackExpense +
      referralExpense +
      rewardExpense +
      creatorExpense +
      protectionFundExpense;

    const netProfit =
      input.orderProfit - totalExpense;

    const profitable =
      netProfit >= 0;

    /**
     * RULE 1
     * Minimum Profit
     */
    if (
      input.orderProfit <
      this.MINIMUM_NET_PROFIT
    ) {
      violations.push({
        id: "PROFIT_MINIMUM_FAILED",

        title:
          "Minimum Profit Rule Failed",

        description:
          "Order profit is below JembeeKart minimum profit requirement.",

        category: "PROFITABILITY",

        severity: "CRITICAL",

        expectedValue: `>= ₹${this.MINIMUM_NET_PROFIT}`,

        actualValue: `₹${input.orderProfit}`,

        recommendation:
          "Increase product margin before enabling rewards and commissions.",

        detectedAt:
          new Date().toISOString(),
      });
    }

    /**
     * RULE 2
     * Expense > Profit
     */
    if (
      totalExpense >
      input.orderProfit
    ) {
      violations.push({
        id: "PROFIT_LOSS_DETECTED",

        title:
          "Business Running At Loss",

        description:
          "Total payout exceeds generated profit.",

        category: "PROFITABILITY",

        severity: "CRITICAL",

        expectedValue:
          "Expense <= Profit",

        actualValue:
          `Expense ₹${totalExpense} > Profit ₹${input.orderProfit}`,

        recommendation:
          "Reduce reward, cashback, creator or referral payouts.",

        detectedAt:
          new Date().toISOString(),
      });
    }

    /**
     * RULE 3
     * Negative Net Profit
     */
    if (netProfit < 0) {
      violations.push({
        id: "NEGATIVE_NET_PROFIT",

        title:
          "Negative Net Profit",

        description:
          "Remaining profit after payouts is negative.",

        category: "PROFITABILITY",

        severity: "CRITICAL",

        expectedValue:
          "Net Profit >= 0",

        actualValue:
          `₹${netProfit}`,

        recommendation:
          "Rebalance payout structure.",

        detectedAt:
          new Date().toISOString(),
      });
    }

    /**
     * RULE 4
     * Reward Risk
     */
    if (
      rewardExpense >
      input.orderProfit * 0.5
    ) {
      violations.push({
        id: "REWARD_EXPENSE_HIGH",

        title:
          "Reward Expense Too High",

        description:
          "Reward payout exceeds 50% of order profit.",

        category: "PROFITABILITY",

        severity: "WARNING",

        actualValue:
          `₹${rewardExpense}`,

        recommendation:
          "Reduce reward value or increase unlock requirements.",

        detectedAt:
          new Date().toISOString(),
      });
    }

    /**
     * RULE 5
     * Cashback Risk
     */
    if (
      cashbackExpense >
      input.orderProfit * 0.5
    ) {
      violations.push({
        id: "CASHBACK_EXPENSE_HIGH",

        title:
          "Cashback Expense Too High",

        description:
          "Cashback exceeds 50% of profit.",

        category: "PROFITABILITY",

        severity: "WARNING",

        actualValue:
          `₹${cashbackExpense}`,

        recommendation:
          "Reduce cashback percentage.",

        detectedAt:
          new Date().toISOString(),
      });
    }

    /**
     * RULE 6
     * Referral Risk
     */
    if (
      referralExpense >
      input.orderProfit * 0.5
    ) {
      violations.push({
        id: "REFERRAL_EXPENSE_HIGH",

        title:
          "Referral Expense Too High",

        description:
          "Referral payout exceeds 50% of order profit.",

        category: "PROFITABILITY",

        severity: "WARNING",

        actualValue:
          `₹${referralExpense}`,

        recommendation:
          "Reduce MLM commission percentage.",

        detectedAt:
          new Date().toISOString(),
      });
    }

    /**
     * RULE 7
     * Creator Risk
     */
    if (
      creatorExpense >
      input.orderProfit * 0.5
    ) {
      violations.push({
        id: "CREATOR_EXPENSE_HIGH",

        title:
          "Creator Expense Too High",

        description:
          "Creator payout exceeds 50% of order profit.",

        category: "PROFITABILITY",

        severity: "WARNING",

        actualValue:
          `₹${creatorExpense}`,

        recommendation:
          "Adjust creator revenue sharing.",

        detectedAt:
          new Date().toISOString(),
      });
    }

    const report: ProfitabilityReport = {
      orderProfit: input.orderProfit,

      cashbackExpense,
      referralExpense,
      rewardExpense,
      creatorExpense,
      protectionFundExpense,

      totalExpense,

      netProfit,

      profitable,
    };

    return {
      report,
      violations,
    };
  }
}

export const profitabilityScanner =
  new ProfitabilityScanner();
