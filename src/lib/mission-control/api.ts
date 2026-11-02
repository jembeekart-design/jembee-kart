import { auth } from "@/firebase/config";
import {
  ActivityLog,
  AdminSession,
  SecurityEvent,
  StorageInfo,
  ApiEndpoint,
  DeploymentInfo,
  FeatureFlag,
  SchedulerJob,
  BackupInfo,
  BuildInfo,
  ErrorLog,
  GovernanceReport,
  MissionSummary,
  NotificationItem,
  PerformanceMetrics,
  ReportItem,
  ScannerResult,
  SystemHealth,
} from "@/types/mission-control";

const BASE_URL = "/api/mission-control";

async function request<T>(url: string, init: RequestInit = {}): Promise<T> {
  const user = auth.currentUser;
  if (!user) throw new Error("Admin login required");
  const token = await user.getIdToken();
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(url, { ...init, cache: "no-store", headers });

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
    "/api/governance/report"
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
  return request<{ success: boolean; message?: string }>(`${BASE_URL}/run`, { method: "POST" });
}

export async function runAutoFix() {
  return request<{ success: boolean; message?: string }>(`${BASE_URL}/autofix`, { method: "POST" });
}

export async function rollbackProject() {
  return request<{ success: boolean; message?: string }>(`${BASE_URL}/rollback`, { method: "POST" });
}

export async function createBackup() {
  return request<{ success: boolean; message?: string }>(`${BASE_URL}/backup`, { method: "POST" });
}

export async function getBackups() {
  return request<BackupInfo[]>(
    `${BASE_URL}/backups`
  );
}

export async function restoreBackup(
  backupId: string
) {
  return request<{ success: boolean }>(`${BASE_URL}/backups/${encodeURIComponent(backupId)}/restore`, { method: "POST" });
}

export async function getFeatureFlags() {
  return request<FeatureFlag[]>(
    `${BASE_URL}/feature-flags`
  );
}

export async function updateFeatureFlag(
  id: string,
  enabled: boolean
) {
  return request<{ success: boolean }>(`${BASE_URL}/feature-flags/${encodeURIComponent(id)}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ enabled }) });
}
export async function getSchedulerJobs() {
  return request<SchedulerJob[]>(
    `${BASE_URL}/scheduler`
  );
}

export async function runSchedulerJob(
  jobId: string
) {
  return request<{ success: boolean }>(`${BASE_URL}/scheduler/${encodeURIComponent(jobId)}/run`, { method: "POST" });
}

export async function toggleSchedulerJob(
  jobId: string,
  enabled: boolean
) {
  return request<{ success: boolean }>(`${BASE_URL}/scheduler?jobId=${encodeURIComponent(jobId)}&enabled=${enabled}`, { method: "PATCH" });
}

export async function getDeployments() {
  return request<DeploymentInfo[]>(
    `${BASE_URL}/deployments`
  );
}

export async function redeployProject(
  deploymentId: string
) {
  return request<{ success: boolean }>(`${BASE_URL}/deployments/${encodeURIComponent(deploymentId)}/redeploy`, { method: "POST" });
}

export async function getApiMonitor() {
  return request<ApiEndpoint[]>(
    `${BASE_URL}/api-monitor`
  );
}

export async function retryApiEndpoint(
  endpointId: string
) {
  return request<{ success: boolean }>(`${BASE_URL}/api-monitor/${encodeURIComponent(endpointId)}/retry`, { method: "POST" });
}

export async function getStorageInfo() {
  return request<StorageInfo>(
    `${BASE_URL}/storage`
  );
}

export async function getSecurityEvents() {
  return request<SecurityEvent[]>(
    `${BASE_URL}/security`
  );
}

export async function resolveSecurityEvent(
  eventId: string
) {
  return request<{ success: boolean }>(`${BASE_URL}/security/${encodeURIComponent(eventId)}/resolve`, { method: "POST" });
}

export async function getAdminSessions() {
  return request<AdminSession[]>(
    `${BASE_URL}/users`
  );
}

export async function terminateAdminSession(
  sessionId: string
) {
  return request<{ success: boolean }>(`${BASE_URL}/users/${encodeURIComponent(sessionId)}/terminate`, { method: "POST" });
}
export async function getRealtimeStatus() {
  return request<SystemHealth>(
    `${BASE_URL}/realtime`
  );
}
