// ======================================================
// DEPLOYMENT SCAN RESULT
// ======================================================

import { GovernanceViolation } from "./governance.types";

export interface DeploymentScanResult {

  /**
   * Final Decision
   */
  deploymentAllowed: boolean;

  /**
   * Ready for Production
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
   * Deployment Block Reasons
   */
  blockedReasons: string[];

  /**
   * All Violations
   */
  violations: GovernanceViolation[];

  /**
   * Report Metadata
   */
  generatedAt: string;

}
