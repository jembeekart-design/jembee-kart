// src/jembee-governance/reports/complianceReportGenerator.ts

import {
  GovernanceDashboardReport,
  GovernanceViolation,
} from "../types/governance.types";

import { securityScanner } from "../scanners/securityScanner";
import { themeScanner } from "../scanners/themeScanner";
import { duplicateCodeScanner } from "../scanners/duplicateCodeScanner";
import { hardcodedRuleScanner } from "../scanners/hardcodedRuleScanner";
import { pageConnectionScanner } from "../scanners/pageConnectionScanner";
import { firestoreScanner } from "../scanners/firestoreScanner";

import { deduplicateViolations } from "../utils/deduplicateViolations";
import { calculateScores } from "../utils/calculateScores";

export interface ComplianceReportOptions {
  projectRoot: string;
}

export class ComplianceReportGenerator {
  public generate(
    options: ComplianceReportOptions
  ): GovernanceDashboardReport {
    const { projectRoot } = options;

    const securityResult = securityScanner.scanProject(projectRoot);
    const themeResult = themeScanner.scanProject(projectRoot);
    const duplicateResult = duplicateCodeScanner.scanProject(projectRoot);
    const hardcodedResult = hardcodedRuleScanner.scanProject(projectRoot);
    const pageResult = pageConnectionScanner.scanProject(projectRoot);
    const firestoreResult = firestoreScanner.scanProject(projectRoot);

    const violations: GovernanceViolation[] =
      deduplicateViolations([
        ...securityResult.violations,
        ...themeResult.violations,
        ...duplicateResult.violations,
        ...hardcodedResult.violations,
        ...pageResult.violations,
        ...firestoreResult.violations,
      ]);

    const criticalCount = violations.filter(
      (v) => v.severity === "CRITICAL"
    ).length;

    const {
      architectureScore,
      securityScore,
      themeScore,
      adminControlScore,
      profitabilityScore,
      overallScore,
    } = calculateScores({
      architectureViolations:
        duplicateResult.violations.length +
        hardcodedResult.violations.length,
      securityViolations:
        securityResult.violations.length,
      themeViolations:
        themeResult.violations.length,
      adminControlViolations:
        firestoreResult.violations.length,
      profitabilityViolations: 0,
    });

    return {
      deploymentStatus:
        criticalCount === 0 ? "PASS" : "BLOCKED",

      generatedAt: new Date().toISOString(),

      version: "2.0.0",

      filesScanned:
        securityResult.filesScanned +
        themeResult.filesScanned +
        duplicateResult.filesScanned +
        hardcodedResult.filesScanned,

      pagesScanned:
        pageResult.pagesScanned,

      collectionsScanned:
        firestoreResult.collectionsScanned,

      totalViolations: violations.length,

      criticalViolations: criticalCount,
      criticalCount,

      errorCount: violations.filter(
        (v) => v.severity === "ERROR"
      ).length,

      warningCount: violations.filter(
        (v) => v.severity === "WARNING"
      ).length,

      duplicateCodeCount:
        duplicateResult.violations.length,

      hardcodedRuleCount:
        hardcodedResult.violations.length,

      architectureScore,
      profitabilityScore,
      securityScore,
      themeScore,
      adminControlScore,

      duplicateCodeScore: 100,
      hardcodedRuleScore: 100,
      pageConnectionScore: 100,

      overallScore,

      history: [],

      mlmGovernance: {
        healthScore: 100,
        totalOrdersAudited: 0,
        totalCommissionPaid: 0,
        totalCommissionReversed: 0,
        duplicateCommissionCount: 0,
        walletMismatchCount: 0,
        profitLeakageCount: 0,
      },

      walletGovernance: {
        integrityScore: 100,
        totalUsersAudited: 0,
        mismatchCount: 0,
      },

      mlmAuditItems: [],

      violations,
    };
  }
}

export const complianceReportGenerator =
  new ComplianceReportGenerator();
