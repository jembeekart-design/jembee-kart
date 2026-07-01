import { mockIssues } from "../mock/issues";

export async function getControlTowerReport() {
  return {
    total: mockIssues.length,
    critical: mockIssues.filter(i => i.severity === "CRITICAL").length,
    warning: mockIssues.filter(i => i.severity === "WARNING").length,
    info: mockIssues.filter(i => i.severity === "INFO").length,
    issues: mockIssues,
  };
}
