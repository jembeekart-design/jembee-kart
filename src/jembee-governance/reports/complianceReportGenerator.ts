// src/jembee-governance/reports/complianceReportGenerator.ts

import {
  GovernanceDashboardReport,
  GovernanceViolation,
} from "../types/governance.types";

// Scanners
import { securityScanner } from "../scanners/securityScanner";
import { themeScanner } from "../scanners/themeScanner";
import { duplicateCodeScanner } from "../scanners/duplicateCodeScanner";
import { hardcodedRuleScanner } from "../scanners/hardcodedRuleScanner";
import { pageConnectionScanner } from "../scanners/pageConnectionScanner";
import { firestoreScanner } from "../scanners/firestoreScanner";
import { adminControlScanner } from "../scanners/adminControlScanner";
import { profitabilityScanner } from "../scanners/profitabilityScanner";
import { mlmComplianceScanner } from "../scanners/mlmComplianceScanner";
import { watchEarnScanner } from "../scanners/watchEarnScanner";
import { walletScanner } from "../scanners/walletScanner";
import { antiFraudScanner } from "../scanners/antiFraudScanner";
import { creatorEconomyScanner } from "../scanners/creatorEconomyScanner";
import { deploymentScanner } from "../scanners/deploymentScanner";
import { deduplicateViolations } from "../utils/deduplicateViolations";

export interface ComplianceReportOptions {
  projectRoot: string;
}

export class ComplianceReportGenerator {
  public generate(options: ComplianceReportOptions): GovernanceDashboardReport {
    const { projectRoot } = options;

    // 1. Run all project scanners
    const securityResult = securityScanner.scanProject(projectRoot);
    const themeResult = themeScanner.scanProject(projectRoot);
    const duplicateResult = duplicateCodeScanner.scanProject(projectRoot);
    const hardcodedResult = hardcodedRuleScanner.scanProject(projectRoot);
    const pageResult = pageConnectionScanner.scanProject(projectRoot);
    const firestoreResult = firestoreScanner.scanProject(projectRoot);
    const adminControlResult = adminControlScanner.scanProject(projectRoot);
    const mlmResult = mlmComplianceScanner.scanProject(projectRoot);
    const watchEarnResult = watchEarnScanner.scanProject(projectRoot);
    const walletResult = walletScanner.scanProject(projectRoot);
    const antiFraudResult = antiFraudScanner.scanProject(projectRoot);
    const creatorResult = creatorEconomyScanner.scanProject(projectRoot);

    /**
     * TODO: Future - Connect to actual Firestore Config
     */
    const profitabilityResult = profitabilityScanner.scan({
      orderProfit: 50,
      cashbackExpense: 5,
      referralExpense: 5,
      rewardExpense: 5,
      creatorExpense: 5,
      protectionFundExpense: 5,
    });

    // 2. Deployment Scanner
    const deploymentResult = deploymentScanner.scan({
      profitabilityViolations: profitabilityResult.violations,
      walletViolations: walletResult.violations,
      mlmViolations: mlmResult.violations,
      watchEarnViolations: watchEarnResult.violations,
      antiFraudViolations: antiFraudResult.violations,
      creatorViolations: creatorResult.violations,
      firestoreViolations: firestoreResult.violations,
      adminControlViolations: adminControlResult.violations,
    });

    // 3. Aggregate all violations
    const violations: GovernanceViolation[] = [
      ...securityResult.violations,
      ...themeResult.violations,
      ...duplicateResult.violations,
      ...hardcodedResult.violations,
      ...pageResult.violations,
      ...firestoreResult.violations,
      ...adminControlResult.violations,
      ...profitabilityResult.violations,
      ...mlmResult.violations,
      ...watchEarnResult.violations,
      ...walletResult.violations,
      ...antiFraudResult.violations,
      ...creatorResult.violations,
      ...deploymentResult.violations,
    ];

    const criticalViolations = violations.filter(
      (v) => v.severity === "CRITICAL"
    ).length;

    // 4. Calculate Scores
    const architectureScore = this.calculateArchitectureScore(
      hardcodedResult.violations.length,
      duplicateResult.violations.length
    );

    const securityScore = this.calculateSecurityScore(
      securityResult.violations.length
    );

    const themeScore = this.calculateThemeScore(
      themeResult.violations.length
    );

    const adminControlScore = this.calculateAdminControlScore(
      hardcodedResult.violations.length
    );

    const profitabilityScore =
      profitabilityResult.violations.length === 0
        ? 100
        : Math.max(0, 100 - profitabilityResult.violations.length * 10);

    const overallScore = Math.round(
      (architectureScore +
        securityScore +
        themeScore +
        adminControlScore +
        profitabilityScore) / 5
    );

    const deploymentStatus = deploymentResult.deploymentAllowed ? "PASS" : "BLOCKED";

    return {
      deploymentStatus,
      generatedAt: new Date().toISOString(),
      filesScanned: securityResult.filesScanned,
      pagesScanned: pageResult.pagesScanned,
      collectionsScanned: firestoreResult.collectionsScanned,
      totalViolations: violations.length,
      criticalViolations,
      architectureScore,
      profitabilityScore,
      securityScore,
      themeScore,
      adminControlScore,
      overallScore,
      violations,
    };
  }

  private calculateSecurityScore(issues: number): number {
    return Math.max(0, 100 - issues * 5);
  }

  private calculateThemeScore(issues: number): number {
    return Math.max(0, 100 - issues * 3);
  }

  private calculateArchitectureScore(hardcodedIssues: number, duplicateIssues: number): number {
    return Math.max(0, 100 - hardcodedIssues * 4 - duplicateIssues * 2);
  }

  private calculateAdminControlScore(hardcodedIssues: number): number {
    return Math.max(0, 100 - hardcodedIssues * 5);
  }

  public printConsoleReport(report: GovernanceDashboardReport): void {
    console.log("\n════════════════════════════════════════════");
    console.log("JEMBEEKART COMPLIANCE REPORT");
    console.log("════════════════════════════════════════════");
    console.log(`Deployment Status : ${report.deploymentStatus}`);
    console.log(`Overall Score     : ${report.overallScore}%`);
    console.log(`Architecture      : ${report.architectureScore}%`);
    console.log(`Security          : ${report.securityScore}%`);
    console.log(`Theme             : ${report.themeScore}%`);
    console.log(`Admin Control     : ${report.adminControlScore}%`);
    console.log(`Profitability     : ${report.profitabilityScore}%`);
    console.log(`Violations        : ${report.totalViolations}`);
    console.log(`Critical          : ${report.criticalViolations}`);
    console.log("════════════════════════════════════════════\n");

    report.violations.forEach((violation) => {
      console.log(`[${violation.severity}] ${violation.title}`);
      console.log(`${violation.description}`);
      if (violation.filePath) {
        console.log(`File: ${violation.filePath}`);
      }
      console.log("----------------------------------------");
    });
  }
}

export const complianceReportGenerator = new ComplianceReportGenerator();
