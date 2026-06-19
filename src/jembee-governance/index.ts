// src/jembee-governance/index.ts

import path from "path";

import { complianceReportGenerator } from "./reports/complianceReportGenerator";
import { GovernanceDashboardReport } from "./types/governance.types";

/**
 * JEMBEEKART GOVERNANCE ENGINE
 *
 * Usage:
 *
 * npx ts-node src/jembee-governance/index.ts
 *
 * or
 *
 * npm run governance
 */

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
   * CI/CD Validation
   *
   * Throws Error if deployment
   * should be blocked.
   */
  public async validateForDeployment(): Promise<void> {
    const report = await this.run();

    if (report.deploymentStatus === "BLOCKED") {
      console.error("");
      console.error(
        "❌ DEPLOYMENT BLOCKED BY GOVERNANCE SYSTEM"
      );
      console.error("");

      console.error(
        `Critical Issues: ${report.criticalViolations}`
      );

      console.error(
        `Total Violations: ${report.totalViolations}`
      );

      console.error("");

      process.exit(1);
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
 * Direct Execution
 *
 * npm run governance
 */
if (require.main === module) {
  governanceEngine
    .validateForDeployment()
    .catch((error) => {
      console.error(
        "Governance Engine Failed:"
      );

      console.error(error);

      process.exit(1);
    });
}
