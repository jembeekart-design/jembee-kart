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
