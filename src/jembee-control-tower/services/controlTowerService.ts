import { runAllScanners } from "@/jembee-governance/scanners";

export async function getControlTowerReport() {
  const issues = await runAllScanners();

  return {
    total: issues.length,
    critical: issues.filter(i => i.severity === "CRITICAL").length,
    warning: issues.filter(i => i.severity === "WARNING").length,
    info: issues.filter(i => i.severity === "INFO").length,
    issues,
  };
}
