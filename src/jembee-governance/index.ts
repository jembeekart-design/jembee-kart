// src/jembee-governance/index.ts

import { complianceReportGenerator } from "./reports/complianceReportGenerator";
import { GovernanceDashboardReport } from "./types/governance.types";

export class JembeeGovernanceEngine {
  public async run(): Promise<GovernanceDashboardReport> {
    const projectRoot = process.cwd();

    console.log("");
    console.log("══════════════════════════════════════════════════════");
    console.log("      JEMBEEKART GOVERNANCE ENGINE STARTED");
    console.log("══════════════════════════════════════════════════════");
    console.log("");

    const report =
      complianceReportGenerator.generate({
        projectRoot,
      });

    complianceReportGenerator.printConsoleReport(
      report
    );

    console.log("");
    console.log("══════════════════════════════════════════════════════");
    console.log("SCAN COMPLETED");
    console.log("══════════════════════════════════════════════════════");
    console.log("");

    return report;
  }

  /**
   * Deployment Validation
   */
  public async validateForDeployment(): Promise<void> {
    const report = await this.run();

    if (report.deploymentStatus === "BLOCKED") {
      console.warn("");
      console.warn("⚠ GOVERNANCE VIOLATIONS DETECTED");

      console.warn(
        `Critical Issues: ${report.criticalCount ?? 0}`
      );

      console.warn(
        `Error Issues: ${report.errorCount ?? 0}`
      );

      console.warn(
        `Warning Issues: ${report.warningCount ?? 0}`
      );

      console.warn(
        `Total Violations: ${report.totalViolations}`
      );

      console.warn(
        "Deployment allowed (Warn Mode)"
      );

      console.warn("");

      return;
    }

    console.log("");
    console.log("✅ GOVERNANCE VALIDATION PASSED");
    console.log("");
  }
}

export const governanceEngine =
  new JembeeGovernanceEngine();

governanceEngine
  .validateForDeployment()
  .catch((error) => {
    console.error(
      "Governance Engine Failed:"
    );

    console.error(error);

    process.exitCode = 1;
  });
