import {
  ActivityLog,
  BuildInfo,
  ErrorLog,
  GovernanceReport,
  MissionSummary,
  PerformanceMetrics,
  ReportItem,
  ScannerResult,
  SystemHealth,
  NotificationItem,
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

export async function getPerformanceMetrics() {
  return request<PerformanceMetrics>(
    `${BASE_URL}/performance`
  );
}

export async function getNotifications() {
  return request<NotificationItem[]>(
    `${BASE_URL}/notifications`
  );
}

export async function getAuditLogs() {
  return request<ActivityLog[]>(
    `${BASE_URL}/audit-logs`
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
