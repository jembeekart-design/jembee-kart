// src/jembee-governance/services/governanceReportService.ts

import { firestoreScanner } from "../scanners/firestoreScanner";
import { securityScanner } from "../scanners/securityScanner";
import { themeScanner } from "../scanners/themeScanner";
import { duplicateCodeScanner } from "../scanners/duplicateCodeScanner";
import { pageConnectionScanner } from "../scanners/pageConnectionScanner";
import { hardcodedRuleScanner } from "../scanners/hardcodedRuleScanner";

import { deduplicateViolations } from "../utils/deduplicateViolations";
import { calculateScores } from "../utils/calculateScores";

export class GovernanceReportService {
  public generate(projectRoot: string) {
    const firestoreResult =
      firestoreScanner.scanProject(projectRoot);

    const securityResult =
      securityScanner.scanProject(projectRoot);

    const themeResult =
      themeScanner.scanProject(projectRoot);

    const duplicateResult =
      duplicateCodeScanner.scanProject(projectRoot);

    const pageConnectionResult =
      pageConnectionScanner.scanProject(projectRoot);

    const hardcodedResult =
      hardcodedRuleScanner.scanProject(projectRoot);

    let violations = [
      ...firestoreResult.violations,
      ...securityResult.violations,
      ...themeResult.violations,
      ...duplicateResult.violations,
      ...pageConnectionResult.violations,
      ...hardcodedResult.violations,
    ];

    violations =
      deduplicateViolations(violations);

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

      profitabilityViolations:
        hardcodedResult.violations.length,
    });

    const criticalCount =
      violations.filter(
        (v) => v.severity === "CRITICAL"
      ).length;

    const errorCount =
      violations.filter(
        (v) => v.severity === "ERROR"
      ).length;

    const warningCount =
      violations.filter(
        (v) => v.severity === "WARNING"
      ).length;

    return {
      generatedAt:
        new Date().toISOString(),

      deploymentStatus:
        criticalCount === 0
          ? "PASS"
          : "FAIL",

      totalViolations:
        violations.length,

      criticalCount,
      errorCount,
      warningCount,

      architectureScore,
      securityScore,
      themeScore,
      adminControlScore,
      profitabilityScore,
      overallScore,

      firestore: {
        collectionsScanned:
          firestoreResult.collectionsScanned,
      },

      security:
        securityResult.report,

      theme: {
        filesScanned:
          themeResult.filesScanned,
      },

      duplicateCode: {
        filesScanned:
          duplicateResult.filesScanned,
      },

      pageConnections: {
        pagesScanned:
          pageConnectionResult.pagesScanned,
      },

      hardcodedRules: {
        filesScanned:
          hardcodedResult.filesScanned,
      },

      violations,
    };
  }
}

export const governanceReportService =
  new GovernanceReportService();
