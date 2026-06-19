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

export interface ComplianceReportOptions {
  projectRoot: string;
}

export class ComplianceReportGenerator {
  public generate(
    options: ComplianceReportOptions
  ): GovernanceDashboardReport {
    const { projectRoot } = options;

    // =========================
    // Run All Scanners
    // =========================

    const securityResult =
      securityScanner.scanProject(projectRoot);

    const themeResult =
      themeScanner.scanProject(projectRoot);

    const duplicateResult =
      duplicateCodeScanner.scanProject(projectRoot);

    const hardcodedResult =
      hardcodedRuleScanner.scanProject(projectRoot);

    const pageResult =
      pageConnectionScanner.scanProject(projectRoot);

    // =========================
    // Collect Violations
    // =========================

    const violations: GovernanceViolation[] = [
      ...securityResult.violations,
      ...themeResult.violations,
      ...duplicateResult.violations,
      ...hardcodedResult.violations,
      ...pageResult.violations,
    ];

    // =========================
    // Statistics
    // =========================

    const criticalViolations =
      violations.filter(
        (v) => v.severity === "CRITICAL"
      ).length;

    const warningViolations =
      violations.filter(
        (v) => v.severity === "WARNING"
      ).length;

    // =========================
    // Scores
    // =========================

    const architectureScore =
      this.calculateArchitectureScore(
        hardcodedResult.violations.length,
        duplicateResult.violations.length
      );

    const securityScore =
      this.calculateSecurityScore(
        securityResult.violations.length
      );

    const themeScore =
      this.calculateThemeScore(
        themeResult.violations.length
      );

    const adminControlScore =
      this.calculateAdminControlScore(
        hardcodedResult.violations.length
      );

    const profitabilityScore = 100;

    const overallScore = Math.round(
      (
        architectureScore +
        securityScore +
        themeScore +
        adminControlScore +
        profitabilityScore
      ) / 5
    );

    // =========================
    // Deployment Decision
    // =========================

    const deploymentStatus =
      criticalViolations > 0
        ? "BLOCKED"
        : "PASS";

    // =========================
    // Final Report
    // =========================

    const report: GovernanceDashboardReport = {
      deploymentStatus,

      generatedAt:
        new Date().toISOString(),

      filesScanned:
        securityResult.filesScanned,

      pagesScanned:
        pageResult.pagesScanned,

      collectionsScanned: 0,

      totalViolations:
        violations.length,

      criticalViolations,

      architectureScore,

      profitabilityScore,

      securityScore,

      themeScore,

      adminControlScore,

      overallScore,

      violations,
    };

    return report;
  }

  private calculateSecurityScore(
    issues: number
  ): number {
    return Math.max(
      0,
      100 - issues * 5
    );
  }

  private calculateThemeScore(
    issues: number
  ): number {
    return Math.max(
      0,
      100 - issues * 3
    );
  }

  private calculateArchitectureScore(
    hardcodedIssues: number,
    duplicateIssues: number
  ): number {
    return Math.max(
      0,
      100 -
        hardcodedIssues * 4 -
        duplicateIssues * 2
    );
  }

  private calculateAdminControlScore(
    hardcodedIssues: number
  ): number {
    return Math.max(
      0,
      100 - hardcodedIssues * 5
    );
  }

  public printConsoleReport(
    report: GovernanceDashboardReport
  ): void {
    console.log(
      "\n════════════════════════════════════════════"
    );

    console.log(
      "JEMBEEKART COMPLIANCE REPORT"
    );

    console.log(
      "════════════════════════════════════════════"
    );

    console.log(
      `Deployment Status : ${report.deploymentStatus}`
    );

    console.log(
      `Overall Score     : ${report.overallScore}%`
    );

    console.log(
      `Architecture      : ${report.architectureScore}%`
    );

    console.log(
      `Security          : ${report.securityScore}%`
    );

    console.log(
      `Theme             : ${report.themeScore}%`
    );

    console.log(
      `Admin Control     : ${report.adminControlScore}%`
    );

    console.log(
      `Profitability     : ${report.profitabilityScore}%`
    );

    console.log(
      `Violations        : ${report.totalViolations}`
    );

    console.log(
      `Critical          : ${report.criticalViolations}`
    );

    console.log(
      "════════════════════════════════════════════\n"
    );

    report.violations.forEach(
      (violation) => {
        console.log(
          `[${violation.severity}] ${violation.title}`
        );

        console.log(
          `${violation.description}`
        );

        if (violation.filePath) {
          console.log(
            `File: ${violation.filePath}`
          );
        }

        console.log(
          "----------------------------------------"
        );
      }
    );
  }
}

export const complianceReportGenerator =
  new ComplianceReportGenerator();
