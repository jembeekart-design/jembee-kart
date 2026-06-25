// src/jembee-governance/types/deployment.types.ts

import { GovernanceViolation } from "./governance.types";

// ======================================================
// DEPLOYMENT SCAN INPUT
// ======================================================

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

// ======================================================
// DEPLOYMENT SCAN RESULT
// ======================================================

export interface DeploymentScanResult {

  /**
   * Final Decision
   */
  deploymentAllowed: boolean;

  /**
   * Ready For Production
   */
  ready: boolean;

  /**
   * Issue Counts
   */
  totalIssues: number;

  criticalIssues: number;

  errorIssues: number;

  warningIssues: number;

  infoIssues: number;

  /**
   * Block Reasons
   */
  blockedReasons: string[];

  /**
   * All Violations
   */
  violations: GovernanceViolation[];

  /**
   * Report Time
   */
  generatedAt: string;

}

// ======================================================
// DEPLOYMENT SUMMARY
// ======================================================

export interface DeploymentSummary {

  deploymentAllowed: boolean;

  ready: boolean;

  totalIssues: number;

  blockedReasons: string[];

  generatedAt: string;

}

// ======================================================
// DEPLOYMENT STATUS
// ======================================================

export type DeploymentStatus =
  | "READY"
  | "WARNING"
  | "BLOCKED";
