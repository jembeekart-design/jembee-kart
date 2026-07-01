import { governanceEngine } from "@/jembee-governance";

export async function getControlTowerReport() {
  const report = await governanceEngine.run();

  return {
    total: report.totalViolations,
    critical: report.criticalCount,
    warning: report.warningCount,
    info: report.infoCount,
    issues: report.violations,
  };
}
