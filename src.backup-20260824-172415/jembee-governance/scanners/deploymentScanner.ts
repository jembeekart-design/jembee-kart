// src/jembee-governance/scanners/deploymentScanner.ts

import {
  GovernanceViolation,
} from "../types/governance.types";

import {
  DeploymentScanInput,
  DeploymentScanResult,
} from "../types/deployment.types";

import {
  GOVERNANCE_VIOLATION_IDS,
} from "../constants/governanceViolationIds";

// ======================================================
// DEPLOYMENT SCANNER
// ======================================================

export class DeploymentScanner {

  /**
   * Merge all violations from scanners
   */
  private collectViolations(
    input: DeploymentScanInput
  ): GovernanceViolation[] {

    return [

      ...(input.profitabilityViolations ?? []),

      ...(input.walletViolations ?? []),

      ...(input.mlmViolations ?? []),

      ...(input.watchEarnViolations ?? []),

      ...(input.antiFraudViolations ?? []),

      ...(input.creatorViolations ?? []),

      ...(input.firestoreViolations ?? []),

      ...(input.adminControlViolations ?? []),

    ];

  }

  /**
   * Count violations by severity
   */
  private countSeverity(
    violations: GovernanceViolation[],
    severity:
      | "INFO"
      | "WARNING"
      | "ERROR"
      | "CRITICAL"
  ): number {

    return violations.filter(
      (v) => v.severity === severity
    ).length;

  }

  /**
   * Main Scanner
   */
  public scan(
    input: DeploymentScanInput
  ): DeploymentScanResult {

    const violations =
      this.collectViolations(input);

    const blockedReasons: string[] = [];

    const criticalIssues =
      this.countSeverity(
        violations,
        "CRITICAL"
      );

    const errorIssues =
      this.countSeverity(
        violations,
        "ERROR"
      );

    const warningIssues =
      this.countSeverity(
        violations,
        "WARNING"
      );

    const infoIssues =
      this.countSeverity(
        violations,
        "INFO"
      );

    // ==================================================
    // PART 2 CONTINUES...
    // ==================================================
      // ==================================================
    // BLOCK CONDITIONS
    // ==================================================

    const hasProfitabilityFailure =
      violations.some(
        (v) =>
          v.id ===
            GOVERNANCE_VIOLATION_IDS.PROFIT_MINIMUM_FAILED ||

          v.id ===
            GOVERNANCE_VIOLATION_IDS.PROFIT_LOSS_DETECTED ||

          v.id ===
            GOVERNANCE_VIOLATION_IDS.NEGATIVE_NET_PROFIT
      );

    if (hasProfitabilityFailure) {
      blockedReasons.push(
        "Profitability rules failed."
      );
    }

    const hasWalletFailure =
      violations.some(
        (v) =>
          v.id ===
            GOVERNANCE_VIOLATION_IDS.WALLET_UNSAFE_UPDATE ||

          v.id ===
            GOVERNANCE_VIOLATION_IDS.WITHDRAWAL_KYC_MISSING ||

          v.id ===
            GOVERNANCE_VIOLATION_IDS.NEGATIVE_WALLET_BALANCE
      );

    if (hasWalletFailure) {
      blockedReasons.push(
        "Wallet security validation failed."
      );
    }

    const hasFraudFailure =
      violations.some(
        (v) =>
          v.id ===
            GOVERNANCE_VIOLATION_IDS.FRAUD_BYPASS_DETECTED ||

          v.id ===
            GOVERNANCE_VIOLATION_IDS.SELF_REFERRAL_PROTECTION_MISSING ||

          v.id ===
            GOVERNANCE_VIOLATION_IDS.DUPLICATE_ACCOUNT_DETECTED
      );

    if (hasFraudFailure) {
      blockedReasons.push(
        "Anti-fraud validation failed."
      );
    }

    const hasMlmFailure =
      violations.some(
        (v) =>
          v.id ===
            GOVERNANCE_VIOLATION_IDS.MLM_FORBIDDEN_INCOME ||

          v.id ===
            GOVERNANCE_VIOLATION_IDS.MLM_HARDCODED_PERCENTAGE ||

          v.id ===
            GOVERNANCE_VIOLATION_IDS.MLM_INVALID_COMMISSION
      );

    if (hasMlmFailure) {
      blockedReasons.push(
        "MLM compliance validation failed."
      );
    }

    const deploymentAllowed =
      blockedReasons.length === 0;

    const ready =
      deploymentAllowed &&
      criticalIssues === 0 &&
      errorIssues === 0;

    // ==================================================
    // PART 3 CONTINUES...
    // ==================================================
      // ==================================================
    // FINAL DEPLOYMENT VALIDATION
    // ==================================================

    if (!deploymentAllowed) {

      violations.push({

        id:
          GOVERNANCE_VIOLATION_IDS.DEPLOYMENT_BLOCKED,

        title:
          "Deployment Blocked",

        description:
          "One or more critical governance validations failed.",

        category:
          "DEPLOYMENT",

        severity:
          "CRITICAL",

        priority:
          "CRITICAL",

        recommendation:
          "Resolve all deployment blocking violations before releasing to production.",

        actualValue:
          blockedReasons.join(" | "),

        detectedAt:
          new Date().toISOString(),

      });

    }

    // ==================================================
    // RETURN RESULT
    // ==================================================

    return {

      deploymentAllowed,

      ready,

      totalIssues:
        violations.length,

      criticalIssues,

      errorIssues,

      warningIssues,

      infoIssues,

      blockedReasons,

      violations,

      generatedAt:
        new Date().toISOString(),

    };

  }

}

// ======================================================
// SINGLETON EXPORT
// ======================================================

export const deploymentScanner =
  new DeploymentScanner();
