// src/jembee-governance/reports/complianceReportGenerator.ts

import {
  GovernanceDashboardReport,
} from "../types/governance.types";

import { governanceReportService } from "../services/governanceReportService";

export interface ComplianceReportOptions {
  projectRoot: string;
}

export class ComplianceReportGenerator {
  public async generate(
  options: ComplianceReportOptions
): Promise<GovernanceDashboardReport> {
  return await governanceReportService.generate(
    options.projectRoot
  );
}

  public printConsoleReport(
    report: GovernanceDashboardReport
  ): void {
    console.log("");
    console.log("=================================");
    console.log("JEMBEEKART GOVERNANCE REPORT");
    console.log("=================================");
    console.log(`Status: ${report.deploymentStatus}`);
    console.log(`Score: ${report.overallScore}%`);
    console.log(`Violations: ${report.totalViolations}`);
    console.log(`Critical: ${report.criticalCount ?? 0}`);
    console.log(`Errors: ${report.errorCount ?? 0}`);
    console.log(`Warnings: ${report.warningCount ?? 0}`);
    console.log("=================================");
  }
}

export const complianceReportGenerator =
  new ComplianceReportGenerator();
