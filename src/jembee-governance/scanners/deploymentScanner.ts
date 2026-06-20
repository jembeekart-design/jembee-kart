// src/jembee-governance/scanners/deploymentScanner.ts

import {
  GovernanceViolation,
} from "../types/governance.types";

export interface DeploymentScanInput {
  profitabilityViolations?: GovernanceViolation[];
  walletViolations?: GovernanceViolation[];
  mlmViolations?: GovernanceViolation[];
  watchEarnViolations?: GovernanceViolation[];
  antiFraudViolations?: GovernanceViolation[];
  creatorViolations?: GovernanceViolation[];
  firestoreViolations?: GovernanceViolation[];
  adminControlViolations?: GovernanceViolation[];
}

export interface DeploymentScanResult {
  deploymentAllowed: boolean;

  criticalIssues: number;
  warningIssues: number;

  violations: GovernanceViolation[];
}

export class DeploymentScanner {
  public scan(
    input: DeploymentScanInput
  ): DeploymentScanResult {
    const violations: GovernanceViolation[] = [
      ...(input.profitabilityViolations ?? []),
      ...(input.walletViolations ?? []),
      ...(input.mlmViolations ?? []),
      ...(input.watchEarnViolations ?? []),
      ...(input.antiFraudViolations ?? []),
      ...(input.creatorViolations ?? []),
      ...(input.firestoreViolations ?? []),
      ...(input.adminControlViolations ?? []),
    ];

    const criticalIssues =
      violations.filter(
        (v) =>
          v.severity === "CRITICAL"
      ).length;

    const warningIssues =
      violations.filter(
        (v) =>
          v.severity === "WARNING"
      ).length;

    /**
     * BLOCK CONDITIONS
     */

    const hasProfitabilityFailure =
      violations.some(
        (v) =>
          v.id ===
            "PROFIT_LOSS_DETECTED" ||
          v.id ===
            "NEGATIVE_NET_PROFIT" ||
          v.id ===
            "PROFIT_MINIMUM_FAILED"
      );

    const hasWalletFailure =
      violations.some(
        (v) =>
          v.id ===
            "WALLET_UNSAFE_UPDATE" ||
          v.id ===
            "WITHDRAWAL_KYC_MISSING"
      );

    const hasFraudFailure =
      violations.some(
        (v) =>
          v.id ===
            "FRAUD_BYPASS_DETECTED" ||
          v.id ===
            "SELF_REFERRAL_PROTECTION_MISSING"
      );

    const hasMlmFailure =
      violations.some(
        (v) =>
          v.id ===
            "MLM_FORBIDDEN_INCOME" ||
          v.id ===
            "MLM_HARDCODED_PERCENTAGE"
      );

    const deploymentAllowed =
      !hasProfitabilityFailure &&
      !hasWalletFailure &&
      !hasFraudFailure &&
      !hasMlmFailure;

    /**
     * Final Deployment Block
     */
    if (!deploymentAllowed) {
      violations.push({
        id: "DEPLOYMENT_BLOCKED",

        title:
          "Deployment Blocked",

        description:
          "Critical governance rules failed.",

        category: "DEPLOYMENT",

        severity: "CRITICAL",

        recommendation:
          "Resolve blocking issues before deployment.",

        detectedAt:
          new Date().toISOString(),
      });
    }

    return {
      deploymentAllowed,

      criticalIssues,
      warningIssues,

      violations,
    };
  }
}

export const deploymentScanner =
  new DeploymentScanner();
