// src/jembee-governance/scanners/profitabilityScanner.ts

import { GOVERNANCE_RULES } from "../config/governanceRules";
import {
  ProfitabilityReport,
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

export class ProfitabilityScanner {
  public scan(
    data: ProfitabilityInput
  ): {
    report: ProfitabilityReport;
    violations: GovernanceViolation[];
  } {
    const violations: GovernanceViolation[] = [];

    const cashbackExpense = data.cashbackExpense ?? 0;
    const referralExpense = data.referralExpense ?? 0;
    const rewardExpense = data.rewardExpense ?? 0;
    const creatorExpense = data.creatorExpense ?? 0;
    const protectionFundExpense = data.protectionFundExpense ?? 0;

    const totalExpense =
      cashbackExpense +
      referralExpense +
      rewardExpense +
      creatorExpense +
      protectionFundExpense;

    const netRemainingProfit = data.orderProfit - totalExpense;

    const profitable = netRemainingProfit >= 0;

    /**
     * Rule 1
     * Minimum Profit Validation
     */
    if (
      data.orderProfit <
      GOVERNANCE_RULES.profitability.minimumNetProfitPerOrder
    ) {
      violations.push({
        id: "PROFIT_001",
        title: "Minimum Profit Rule Failed",
        description: `Order profit is below required minimum profit of ₹${GOVERNANCE_RULES.profitability.minimumNetProfitPerOrder}.`,
        category: "PROFITABILITY",
        severity: "CRITICAL",
        expectedValue: `>= ₹${GOVERNANCE_RULES.profitability.minimumNetProfitPerOrder}`,
        actualValue: `₹${data.orderProfit}`,
        recommendation:
          "Increase product margin or reduce expenses before enabling rewards.",
        detectedAt: new Date().toISOString(),
      });
    }

    /**
     * Rule 2
     * Expense > Profit
     */
    if (totalExpense > data.orderProfit) {
      violations.push({
        id: "PROFIT_002",
        title: "Expense Greater Than Profit",
        description:
          "Total payouts exceed generated order profit. Business model is operating at a loss.",
        category: "PROFITABILITY",
        severity: "CRITICAL",
        expectedValue: `Expense <= Profit`,
        actualValue: `Expense ₹${totalExpense} > Profit ₹${data.orderProfit}`,
        recommendation:
          "Reduce cashback, rewards, referral commission or creator payouts.",
        detectedAt: new Date().toISOString(),
      });
    }

    /**
     * Rule 3
     * Negative Profit
     */
    if (netRemainingProfit < 0) {
      violations.push({
        id: "PROFIT_003",
        title: "Negative Net Profit",
        description:
          "Net remaining profit is negative after all distributions.",
        category: "PROFITABILITY",
        severity: "CRITICAL",
        expectedValue: "Net Profit >= 0",
        actualValue: `₹${netRemainingProfit}`,
        recommendation:
          "Rebalance reward system and commission structure.",
        detectedAt: new Date().toISOString(),
      });
    }

    /**
     * Rule 4
     * Reward Risk
     */
    if (rewardExpense > data.orderProfit * 0.5) {
      violations.push({
        id: "PROFIT_004",
        title: "Reward Expense Too High",
        description:
          "Reward payout exceeds 50% of generated order profit.",
        category: "PROFITABILITY",
        severity: "WARNING",
        expectedValue: "<= 50% of Profit",
        actualValue: `₹${rewardExpense}`,
        recommendation:
          "Lower reward conversion value or increase unlock requirements.",
        detectedAt: new Date().toISOString(),
      });
    }

    /**
     * Rule 5
     * Referral Risk
     */
    if (referralExpense > data.orderProfit * 0.5) {
      violations.push({
        id: "PROFIT_005",
        title: "Referral Expense Too High",
        description:
          "Referral commission exceeds 50% of generated order profit.",
        category: "PROFITABILITY",
        severity: "WARNING",
        expectedValue: "<= 50% of Profit",
        actualValue: `₹${referralExpense}`,
        recommendation:
          "Reduce MLM commission percentages from admin settings.",
        detectedAt: new Date().toISOString(),
      });
    }

    const report: ProfitabilityReport = {
      orderProfit: data.orderProfit,
      cashbackExpense,
      referralExpense,
      rewardExpense,
      creatorExpense,
      protectionFundExpense,
      totalExpense,
      netRemainingProfit,
      profitable,
    };

    return {
      report,
      violations,
    };
  }
}

export const profitabilityScanner = new ProfitabilityScanner();
