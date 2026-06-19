// src/jembee-governance/index.ts

import { complianceReportGenerator } from "./reports/complianceReportGenerator";
import { GovernanceDashboardReport } from "./types/governance.types";

export class JembeeGovernanceEngine {
  /**
   * Run Full Governance Scan
   */
  public async run(): Promise<GovernanceDashboardReport> {
    const projectRoot = process.cwd();

    console.log("");
    console.log(
      "══════════════════════════════════════════════════════"
    );
    console.log(
      "      JEMBEEKART GOVERNANCE ENGINE STARTED"
    );
    console.log(
      "══════════════════════════════════════════════════════"
    );
    console.log("");

    const report =
      complianceReportGenerator.generate({
        projectRoot,
      });

    complianceReportGenerator.printConsoleReport(
      report
    );

    console.log("");
    console.log(
      "══════════════════════════════════════════════════════"
    );
    console.log("SCAN COMPLETED");
    console.log(
      "══════════════════════════════════════════════════════"
    );
    console.log("");

    return report;
  }

  /**
   * Validate Before Build
   */
  public async validateForDeployment(): Promise<void> {
    const report = await this.run();

    if (report.deploymentStatus === "BLOCKED") {
      throw new Error(
        [
          "",
          "❌ DEPLOYMENT BLOCKED BY GOVERNANCE SYSTEM",
          `Critical Issues: ${report.criticalViolations}`,
          `Total Violations: ${report.totalViolations}`,
          "",
        ].join("\n")
      );
    }

    console.log("");
    console.log(
      "✅ GOVERNANCE VALIDATION PASSED"
    );
    console.log("");
  }
}

export const governanceEngine =
  new JembeeGovernanceEngine();

/**
 * Auto Run
 */
governanceEngine
  .validateForDeployment()
  .catch((error) => {
    console.error(
      "Governance Engine Failed:"
    );

    console.error(error);

    throw error;
  });
