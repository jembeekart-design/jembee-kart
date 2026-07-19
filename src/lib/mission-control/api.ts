import {
  ActivityLog,
  BuildInfo,
  ErrorLog,
  GovernanceReport,
  MissionSummary,
  ReportItem,
  ScannerResult,
  SystemHealth,
} from "@/types/mission-control";

const BASE_URL = "/api/mission-control";

async function request<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Mission Control API Error: ${response.status}`);
  }

  return response.json();
}

/* -------------------------------------------------------------------------- */
/*                                  GET APIs                                  */
/* -------------------------------------------------------------------------- */

export async function getMissionSummary() {
  return request<MissionSummary>(
    `${BASE_URL}/summary`
  );
}

export async function getSystemHealth() {
  return request<SystemHealth>(
    `${BASE_URL}/system-health`
  );
}

export async function getScannerResults() {
  return request<ScannerResult[]>(
    `${BASE_URL}/scanner-results`
  );
}

export async function getGovernanceReport() {
  return request<GovernanceReport>(
    `${BASE_URL}/governance`
  );
}

export async function getBuildInfo() {
  return request<BuildInfo>(
    `${BASE_URL}/build`
  );
}

export async function getActivityLogs() {
  return request<ActivityLog[]>(
    `${BASE_URL}/activity`
  );
}

export async function getReports() {
  return request<ReportItem[]>(
    `${BASE_URL}/reports`
  );
}

export async function getErrorLogs() {
  return request<ErrorLog[]>(
    `${BASE_URL}/error-logs`
  );
}

/* -------------------------------------------------------------------------- */
/*                              ACTION / POST APIs                            */
/* -------------------------------------------------------------------------- */

export async function runAllScanners() {
  return request<{ success: boolean; message?: string }>(
    `${BASE_URL}/run`
  );
}

export async function runAutoFix() {
  return request<{ success: boolean; message?: string }>(
    `${BASE_URL}/autofix`
  );
}

export async function rollbackProject() {
  return request<{ success: boolean; message?: string }>(
    `${BASE_URL}/rollback`
  );
}

export async function createBackup() {
  return request<{ success: boolean; message?: string }>(
    `${BASE_URL}/backup`
  );
}
