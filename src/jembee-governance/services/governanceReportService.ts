import {
  GovernanceDashboardReport,
  GovernanceViolation,
} from "../types/governance.types";

// ======================================================
// Core Scanners
// ======================================================

import { firestoreScanner } from "../scanners/firestoreScanner";
import { securityScanner } from "../scanners/securityScanner";
import { themeScanner } from "../scanners/themeScanner";
import { duplicateCodeScanner } from "../scanners/duplicateCodeScanner";
import { pageConnectionScanner } from "../scanners/pageConnectionScanner";
import { hardcodedRuleScanner } from "../scanners/hardcodedRuleScanner";

// ======================================================
// Enterprise Scanners
// ======================================================

import { adminControlScanner } from "../scanners/adminControlScanner";
import { profitabilityScanner } from "../scanners/profitabilityScanner";
import { mlmComplianceScanner } from "../scanners/mlmComplianceScanner";
import { walletScanner } from "../scanners/walletScanner";
import { watchEarnScanner } from "../scanners/watchEarnScanner";
import { antiFraudScanner } from "../scanners/antiFraudScanner";
import { creatorEconomyScanner } from "../scanners/creatorEconomyScanner";
import { deploymentScanner } from "../scanners/deploymentScanner";

// ======================================================
// Configuration Services
// ======================================================

import { governanceConfigService } from "./governanceConfigService";
import { governanceHealthService } from "./governanceHealthService";
import { profitabilityConfigService } from "./profitabilityConfigService";

// ======================================================
// Utilities
// ======================================================

import { deduplicateViolations } from "../utils/deduplicateViolations";
import { calculateScores } from "../utils/calculateScores";

// ======================================================
// Governance Report Service
// ======================================================

export class GovernanceReportService {

  /**
   * Latest Reports
   */
  async getLatestReports() {

    return [
      {
        id: "latest-governance-report",
        title: "JembeeKart Governance Report",
        createdAt: new Date().toISOString(),
        status: "SUCCESS",
      },
    ];

  }

  /**
   * Generate Governance Report
   */
  async generate(
    projectRoot: string
  ): Promise<GovernanceDashboardReport> {

    // ==================================================
    // PART 2 STARTS HERE
    // ==================================================
      // ======================================================
    // Load Governance Configuration
    // ======================================================

    const configuration =
      await governanceConfigService.getConfiguration();

    const healthReport =
      await governanceHealthService.check();

    // ======================================================
    // Execute Core Scanners
    // ======================================================

    const firestoreResult =
      firestoreScanner.scanProject(
        projectRoot
      );

    const securityResult =
      securityScanner.scanProject(
        projectRoot
      );

    const themeResult =
      themeScanner.scanProject(
        projectRoot
      );

    const duplicateResult =
      duplicateCodeScanner.scanProject(
        projectRoot
      );

    const pageConnectionResult =
      pageConnectionScanner.scanProject(
        projectRoot
      );

    const hardcodedResult =
      hardcodedRuleScanner.scanProject(
        projectRoot
      );

    // ======================================================
    // Core Scan Summary
    // ======================================================

    const coreResults = {

      firestore:
        firestoreResult,

      security:
        securityResult,

      theme:
        themeResult,

      duplicateCode:
        duplicateResult,

      pageConnection:
        pageConnectionResult,

      hardcodedRules:
        hardcodedResult,

    };

    // ======================================================
    // PART 3 STARTS HERE
    // ======================================================
      // ======================================================
    // Execute Enterprise Scanners
    // ======================================================

    const adminControlResult =
      adminControlScanner.scanProject(
        projectRoot
      );

    const walletResult =
      walletScanner.scanProject(
        projectRoot
      );

    const mlmResult =
      mlmComplianceScanner.scanProject(
        projectRoot
      );

    const watchEarnResult =
      watchEarnScanner.scanProject(
        projectRoot
      );

    const creatorResult =
      creatorEconomyScanner.scanProject(
        projectRoot
      );

    const antiFraudResult =
      antiFraudScanner.scanProject(
        projectRoot
      );

    // ======================================================
    // Profitability Analysis
    // Runtime orderProfit should come from
    // Order Engine / Analytics Service
    // ======================================================

    const profitabilityInput =
      await profitabilityConfigService.buildScannerInput(
        configuration.profitability.orderProfit
      );

    const profitabilityResult =
      profitabilityScanner.scan(
        profitabilityInput
      );

    // ======================================================
    // Enterprise Scan Summary
    // ======================================================

    const enterpriseResults = {

      adminControl:
        adminControlResult,

      wallet:
        walletResult,

      mlm:
        mlmResult,

      watchEarn:
        watchEarnResult,

      creatorEconomy:
        creatorResult,

      antiFraud:
        antiFraudResult,

      profitability:
        profitabilityResult,

    };

    // ======================================================
    // PART 4 STARTS HERE
    // ======================================================
      // ======================================================
    // Deployment Validation
    // ======================================================

    const deploymentResult =
      deploymentScanner.scan({

        profitabilityViolations:
          profitabilityResult.violations,

        walletViolations:
          walletResult.violations,

        mlmViolations:
          mlmResult.violations,

        watchEarnViolations:
          watchEarnResult.violations,

        antiFraudViolations:
          antiFraudResult.violations,

        creatorViolations:
          creatorResult.violations,

        firestoreViolations:
          firestoreResult.violations,

        adminControlViolations:
          adminControlResult.violations,

      });

    // ======================================================
    // Deployment Summary
    // ======================================================

    const deploymentSummary = {

      deployment:
        deploymentResult,

      configuration,

      health:
        healthReport,

    };

    // ======================================================
    // Merge All Violations
    // ======================================================

    const allViolations: GovernanceViolation[] = [

      ...firestoreResult.violations,

      ...securityResult.violations,

      ...themeResult.violations,

      ...duplicateResult.violations,

      ...pageConnectionResult.violations,

      ...hardcodedResult.violations,

      ...adminControlResult.violations,

      ...walletResult.violations,

      ...mlmResult.violations,

      ...watchEarnResult.violations,

      ...creatorResult.violations,

      ...antiFraudResult.violations,

      ...profitabilityResult.violations,

      ...deploymentResult.violations,

    ];

    // ======================================================
    // PART 5 STARTS HERE
    // ======================================================
      // ======================================================
    // Remove Duplicate Violations
    // ======================================================

    const violations =
      deduplicateViolations(
        allViolations
      );

    // ======================================================
    // Violation Summary
    // ======================================================

    const criticalViolations =
      violations.filter(
        (v) =>
          v.severity ===
          "CRITICAL"
      );

    const errorViolations =
      violations.filter(
        (v) =>
          v.severity ===
          "ERROR"
      );

    const warningViolations =
      violations.filter(
        (v) =>
          v.severity ===
          "WARNING"
      );

    const infoViolations =
      violations.filter(
        (v) =>
          v.severity ===
          "INFO"
      );

    // ======================================================
    // Governance Scores
    // ======================================================

    const scores = calculateScores({

  architectureViolations:
    violations.filter(
      v => v.category === "ARCHITECTURE"
    ).length,

  securityViolations:
    violations.filter(
      v => v.category === "SECURITY"
    ).length,

  themeViolations:
    violations.filter(
      v => v.category === "THEME"
    ).length,

  adminControlViolations:
    violations.filter(
      v => v.category === "ADMIN_CONTROL"
    ).length,

  profitabilityViolations:
    violations.filter(
      v => v.category === "PROFITABILITY"
    ).length,
deploymentViolations:
  violations.filter(
    v => v.category === "DEPLOYMENT"
  ).length,
});

    // ======================================================
    // Statistics
    // ======================================================

    const statistics = {

      totalViolations:
        violations.length,

      critical:
        criticalViolations.length,

      errors:
        errorViolations.length,

      warnings:
        warningViolations.length,

      information:
        infoViolations.length,

      overallScore:
  scores.overallScore,

architectureScore:
  scores.architectureScore,

securityScore:
  scores.securityScore,

profitabilityScore:
  scores.profitabilityScore,

deploymentScore:
  scores.deploymentScore,

    };

    // ======================================================
    // PART 6 STARTS HERE
    // ======================================================
      // ======================================================
    // Build Governance Dashboard Report
    // ======================================================

    const dashboardReport: GovernanceDashboardReport = {

      generatedAt:
        new Date().toISOString(),

      configuration,

      health:
        healthReport,

      statistics,

      scores,

      violations,

      coreScanners: {

        firestore:
          firestoreResult,

        security:
          securityResult,

        theme:
          themeResult,

        duplicateCode:
          duplicateResult,

        pageConnection:
          pageConnectionResult,

        hardcodedRules:
          hardcodedResult,

      },

      enterpriseScanners: {

        adminControl:
          adminControlResult,

        wallet:
          walletResult,

        mlm:
          mlmResult,

        watchEarn:
          watchEarnResult,

        creatorEconomy:
          creatorResult,

        antiFraud:
          antiFraudResult,

        profitability:
          profitabilityResult,

        deployment:
          deploymentResult,

      },

    };

    // ======================================================
    // PART 7 STARTS HERE
    // ======================================================
      // ======================================================
    // Finalize Governance Report
    // ======================================================

    dashboardReport.summary = {

      projectRoot,

      generatedAt:
        new Date().toISOString(),

      filesScanned: 0,
      deploymentReady:
        deploymentResult.ready,

      overallHealth:
        healthReport.healthy
          ? "HEALTHY"
          : "UNHEALTHY",

    };

    // ======================================================
    // Return Final Report
    // ======================================================

    return dashboardReport;

  }

}

// ======================================================
// Singleton Export
// ======================================================

export const governanceReportService =
  new GovernanceReportService();
