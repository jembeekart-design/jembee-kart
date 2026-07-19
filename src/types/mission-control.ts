export type HealthStatus =
  | "healthy"
  | "warning"
  | "critical"
  | "offline";

export interface MissionSummary {
  success: boolean;
  generatedAt: string;
  duration: number;
}

export interface ScannerResult {
  id: string;
  name: string;
  description: string;
  status: HealthStatus;
  issues: number;
  warnings: number;
  scannedFiles: number;
  duration: number;
  lastRun: string;
}

export interface SystemHealth {
  cpu: number;
  memory: number;
  disk: number;
  uptime: number;
  api: HealthStatus;
  database: HealthStatus;
  storage: HealthStatus;
}

export interface BuildInfo {
  environment: "development" | "staging" | "production";
  branch: string;
  commit: string;
  buildStatus: HealthStatus;
  deployedAt: string;
}

export interface GovernanceReport {
  complianceScore: number;
  hardcodedRules: number;
  adminCoverage: number;
  firestoreHealth: number;
  securityScore: number;
}

export interface ActivityLog {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  type:
    | "scanner"
    | "autofix"
    | "build"
    | "security"
    | "system";
}

export interface ReportItem {
  id: string;
  name: string;
  description: string;
  generatedAt?: string;
  downloadUrl?: string;
}

export interface AutomationAction {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

export interface ErrorLog {
  id: string;
  title: string;
  message: string;
  severity: "low" | "medium" | "high" | "critical";
  createdAt: string;
  resolved: boolean;
}

/* -------------------------------------------------------------------------- */
/*                             Performance Metrics                            */
/* -------------------------------------------------------------------------- */

export interface PerformanceMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  responseTime: number;
  requestsPerMinute: number;
  cacheHitRate: number;
  databaseLatency: number;
}

/* -------------------------------------------------------------------------- */
/*                               Notifications                                */
/* -------------------------------------------------------------------------- */

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  createdAt: string;
  read: boolean;
}

/* -------------------------------------------------------------------------- */
/*                                  Storage                                   */
/* -------------------------------------------------------------------------- */

export interface StorageInfo {
  total: number;
  used: number;
  free: number;
  usagePercentage: number;
}

/* -------------------------------------------------------------------------- */
/*                                  Security                                  */
/* -------------------------------------------------------------------------- */

export interface SecurityEvent {
  id: string;
  title: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  createdAt: string;
}

/* -------------------------------------------------------------------------- */
/*                               Admin Sessions                               */
/* -------------------------------------------------------------------------- */

export interface AdminSession {
  id: string;
  userId: string;
  name: string;
  email: string;
  loginAt: string;
  lastActive: string;
  ipAddress: string;
  status: "online" | "offline";
}

/* -------------------------------------------------------------------------- */
/*                              Feature Flags                                 */
/* -------------------------------------------------------------------------- */

export interface FeatureFlag {
  id: string;
  name: string;
  enabled: boolean;
  description: string;
}

/* -------------------------------------------------------------------------- */
/*                                Backup Info                                 */
/* -------------------------------------------------------------------------- */

export interface BackupInfo {
  id: string;
  filename: string;
  size: number;
  createdAt: string;
  status: "success" | "failed" | "running";
}

/* -------------------------------------------------------------------------- */
/*                               Deployment Info                              */
/* -------------------------------------------------------------------------- */

export interface DeploymentInfo {
  id: string;
  version: string;
  branch: string;
  commit: string;
  environment: "development" | "staging" | "production";
  status: "success" | "failed" | "running";
  deployedAt: string;
}
