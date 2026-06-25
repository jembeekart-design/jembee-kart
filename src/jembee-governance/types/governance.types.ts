// src/jembee-governance/types/governance.types.ts

// ======================================================
// JEMBEEKART GOVERNANCE ENGINE
// TYPES
// PART 1
// BASE TYPES
// ======================================================

// ======================================================
// SEVERITY
// ======================================================

export type SeverityLevel =
  | "INFO"
  | "WARNING"
  | "ERROR"
  | "CRITICAL";

// ======================================================
// PRIORITY
// ======================================================

export type GovernancePriority =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "CRITICAL";

// ======================================================
// STATUS
// ======================================================

export type GovernanceStatus =
  | "PASS"
  | "WARNING"
  | "FAIL"
  | "CRITICAL";

// ======================================================
// DEPLOYMENT STATUS
// ======================================================

export type DeploymentStatus =
  | "PASS"
  | "BLOCKED";

// ======================================================
// FIX STATUS
// ======================================================

export type GovernanceFixStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "FIXED"
  | "IGNORED";

// ======================================================
// FEATURE CATEGORY
// ======================================================

export type FeatureCategory =
  | "ECOMMERCE"
  | "REFERRAL"
  | "WATCH_EARN"
  | "CREATOR"
  | "SELLER"
  | "WALLET"
  | "ADS"
  | "ADMIN";

// ======================================================
// GOVERNANCE CATEGORY
// ======================================================

export type ViolationCategory =
  | "ARCHITECTURE"
  | "SECURITY"
  | "THEME"
  | "FIRESTORE"
  | "ADMIN_CONTROL"
  | "HARDCODED_RULE"
  | "PAGE_CONNECTION"
  | "DUPLICATE_CODE"
  | "PROFITABILITY"
  | "MLM"
  | "WATCH_EARN"
  | "WALLET"
  | "CREATOR_ECONOMY"
  | "ANTI_FRAUD"
  | "DEPLOYMENT"
  | "PERFORMANCE";

// ======================================================
// GOVERNANCE VIOLATION
// ======================================================

export interface GovernanceViolation {

  id: string;

  title: string;

  description: string;

  category: ViolationCategory;

  severity: SeverityLevel;

  priority: GovernancePriority;

  filePath?: string;

  pageName?: string;

  moduleName?: string;

  lineNumber?: number;

  expectedValue?: string;

  actualValue?: string;

  recommendation?: string;

  autoFixAvailable?: boolean;

  documentationUrl?: string;

  detectedAt: string;

}

// ======================================================
// GOVERNANCE HISTORY
// ======================================================

export interface GovernanceHistory {

  scanId: string;

  scanDate: string;

  overallScore: number;

  totalViolations: number;

}

// ======================================================
// PART 2 STARTS HERE
// ======================================================
// ======================================================
// PART 2
// DASHBOARD TYPES
// ======================================================

// ======================================================
// GOVERNANCE SCORES
// ======================================================

export interface GovernanceScores {

  overall: number;

  architecture: number;

  security: number;

  profitability: number;

  theme: number;

  firestore: number;

  adminControl: number;

  duplicateCode: number;

  hardcodedRule: number;

  pageConnection: number;

  deployment: number;

  performance: number;

  scalability: number;

  compliance: number;

}

// ======================================================
// GOVERNANCE STATISTICS
// ======================================================

export interface GovernanceStatistics {

  filesScanned: number;

  pagesScanned: number;

  collectionsScanned: number;

  totalViolations: number;

  critical: number;

  errors: number;

  warnings: number;

  information: number;

}

// ======================================================
// GOVERNANCE SUMMARY
// ======================================================

export interface GovernanceSummary {

  projectRoot: string;

  generatedAt: string;

  deploymentReady: boolean;

  overallHealth:
    | "HEALTHY"
    | "UNHEALTHY";

  filesScanned: number;

}

// ======================================================
// GOVERNANCE HEALTH
// ======================================================

export interface GovernanceHealth {

  healthy: boolean;

  configurationLoaded: boolean;

  businessRulesHealthy: boolean;

  timestamp: string;

}

// ======================================================
// PART 3 STARTS HERE
// ======================================================
// ======================================================
// PART 3
// GOVERNANCE REPORT TYPES
// ======================================================

// ======================================================
// CORE SCANNER RESULTS
// ======================================================

export interface CoreScannerResults {

  firestore: unknown;

  security: unknown;

  theme: unknown;

  duplicateCode: unknown;

  pageConnection: unknown;

  hardcodedRules: unknown;

}

// ======================================================
// ENTERPRISE SCANNER RESULTS
// ======================================================

export interface EnterpriseScannerResults {

  adminControl: unknown;

  wallet: unknown;

  mlm: unknown;

  watchEarn: unknown;

  creatorEconomy: unknown;

  antiFraud: unknown;

  profitability: unknown;

  deployment: unknown;

}

// ======================================================
// GOVERNANCE DASHBOARD REPORT
// ======================================================

export interface GovernanceDashboardReport {

  generatedAt: string;

  deploymentStatus: DeploymentStatus;

  critical: number;

  errors: number;
  
  configuration: unknown;

  health: GovernanceHealth;

  summary: GovernanceSummary;

  statistics: GovernanceStatistics;

  scores: GovernanceScores;

  violations: GovernanceViolation[];

  coreScanners: CoreScannerResults;

  enterpriseScanners:
    EnterpriseScannerResults;

}

// ======================================================
// GOVERNANCE ENGINE REPORT
// ======================================================

export interface GovernanceEngineReport {

  success: boolean;

  report: GovernanceDashboardReport;

  durationMs: number;

  generatedAt: string;

}

// ======================================================
// PART 4 STARTS HERE
// ======================================================
// ======================================================
// PART 4
// GOVERNANCE ENGINE CONTRACTS
// ======================================================

// ======================================================
// SCANNER CONTEXT
// ======================================================

export interface ScannerContext {

  projectRoot: string;

  scanStartedAt: string;

  configuration: unknown;

}

// ======================================================
// GOVERNANCE SCANNER
// ======================================================

export interface GovernanceScanner {

  readonly scannerName: string;

  readonly version: string;

  scan(
    context: ScannerContext
  ): Promise<GovernanceViolation[]>;

}

// ======================================================
// SCANNER CONFIGURATION
// ======================================================

export interface GovernanceScannerConfig {

  enableDeepScan: boolean;

  includePaths: string[];

  excludePaths: string[];

  maxConcurrency: number;

  failFast: boolean;

}

// ======================================================
// GOVERNANCE ENGINE CONFIG
// ======================================================

export interface GovernanceEngineConfig {

  enableCoreScanners: boolean;

  enableEnterpriseScanners: boolean;

  enableDeploymentValidation: boolean;

  enableScoreCalculation: boolean;

  enableDeduplication: boolean;

  enableHealthCheck: boolean;

}

// ======================================================
// GOVERNANCE EXECUTION REPORT
// ======================================================

export interface GovernanceExecutionReport {

  scanStartedAt: string;

  scanCompletedAt: string;

  executionTimeMs: number;

  filesScanned: number;

  totalViolations: number;

  overallScore: number;

}

// ======================================================
// GOVERNANCE HEALTH REPORT
// ======================================================

export interface GovernanceHealthReport {

  healthy: boolean;

  configurationLoaded: boolean;

  businessRulesHealthy: boolean;

  deploymentReady: boolean;

  generatedAt: string;

}

// ======================================================
// PART 5 STARTS HERE
// ======================================================
// ======================================================
// PART 5
// AUDIT & GOVERNANCE MANAGEMENT
// ======================================================

// ======================================================
// GOVERNANCE AUDIT
// ======================================================

export interface GovernanceAudit {

  auditId: string;

  projectName: string;

  version: string;

  scanStartedAt: string;

  scanCompletedAt: string;

  durationMs: number;

  overallScore: number;

  deploymentStatus:
    DeploymentStatus;

  totalViolations: number;

}

// ======================================================
// GOVERNANCE FIX REQUEST
// ======================================================

export interface GovernanceFixRequest {

  violationId: string;

  requestedBy: string;

  requestedAt: string;

  priority:
    GovernancePriority;

  autoFix: boolean;

  notes?: string;

}

// ======================================================
// GOVERNANCE FIX RESULT
// ======================================================

export interface GovernanceFixResult {

  success: boolean;

  violationId: string;

  fixedAt: string;

  fixedBy: string;

  message: string;

}

// ======================================================
// GOVERNANCE VERSION
// ======================================================

export interface GovernanceVersion {

  version: string;

  buildNumber: string;

  commitHash?: string;

  generatedAt: string;

}

// ======================================================
// GOVERNANCE METADATA
// ======================================================

export interface GovernanceMetadata {

  engine: string;

  engineVersion: string;

  project: string;

  generatedBy: string;

  generatedAt: string;

}

// ======================================================
// GOVERNANCE REPORT PACKAGE
// ======================================================

export interface GovernanceReportPackage {

  metadata:
    GovernanceMetadata;

  audit:
    GovernanceAudit;

  dashboard:
    GovernanceDashboardReport;

}

// ======================================================
// PART 6 STARTS HERE
// ======================================================
// ======================================================
// PART 6
// DASHBOARD UI & REPORT TYPES
// ======================================================

// ======================================================
// DASHBOARD CARD
// ======================================================

export interface GovernanceDashboardCard {

  id: string;

  title: string;

  value: string | number;

  description?: string;

  severity?: SeverityLevel;

  score?: number;

  icon?: string;

}

// ======================================================
// DASHBOARD SECTION
// ======================================================

export interface GovernanceDashboardSection {

  id: string;

  title: string;

  description?: string;

  cards: GovernanceDashboardCard[];

}

// ======================================================
// GOVERNANCE ALERT
// ======================================================

export interface GovernanceAlert {

  id: string;

  title: string;

  message: string;

  severity: SeverityLevel;

  createdAt: string;

  actionRequired: boolean;

}

// ======================================================
// GOVERNANCE RECOMMENDATION
// ======================================================

export interface GovernanceRecommendation {

  id: string;

  title: string;

  description: string;

  priority: GovernancePriority;

  estimatedImpact: string;

  estimatedEffort: string;

}

// ======================================================
// GOVERNANCE NAVIGATION ITEM
// ======================================================

export interface GovernanceNavigationItem {

  id: string;

  label: string;

  route: string;

  icon?: string;

  enabled: boolean;

}

// ======================================================
// GOVERNANCE SIDEBAR
// ======================================================

export interface GovernanceSidebar {

  title: string;

  items: GovernanceNavigationItem[];

}

// ======================================================
// GOVERNANCE DASHBOARD CONFIG
// ======================================================

export interface GovernanceDashboardConfig {

  refreshInterval: number;

  showCharts: boolean;

  showRecommendations: boolean;

  showAlerts: boolean;

  enableRealtime: boolean;

}

// ======================================================
// PART 7 STARTS HERE
// ======================================================
// ======================================================
// PART 7
// ANALYTICS, EXPORT & REPORTING
// ======================================================

// ======================================================
// GOVERNANCE TREND
// ======================================================

export interface GovernanceTrend {

  period: string;

  overallScore: number;

  criticalCount: number;

  warningCount: number;

  totalViolations: number;

}

// ======================================================
// GOVERNANCE ANALYTICS
// ======================================================

export interface GovernanceAnalytics {

  averageScore: number;

  bestScore: number;

  lowestScore: number;

  totalScans: number;

  averageExecutionTime: number;

  trends: GovernanceTrend[];

}

// ======================================================
// GOVERNANCE CHART DATA
// ======================================================

export interface GovernanceChartData {

  label: string;

  value: number;

}

// ======================================================
// GOVERNANCE EXPORT OPTIONS
// ======================================================

export interface GovernanceExportOptions {

  includeViolations: boolean;

  includeStatistics: boolean;

  includeScores: boolean;

  includeRecommendations: boolean;

  includeScannerReports: boolean;

  format:
    | "JSON"
    | "PDF"
    | "CSV"
    | "XLSX";

}

// ======================================================
// GOVERNANCE EXPORT RESULT
// ======================================================

export interface GovernanceExportResult {

  success: boolean;

  exportedAt: string;

  fileName: string;

  format: string;

}

// ======================================================
// GOVERNANCE SCAN SESSION
// ======================================================

export interface GovernanceScanSession {

  sessionId: string;

  projectRoot: string;

  startedAt: string;

  completedAt?: string;

  status:
    | "RUNNING"
    | "COMPLETED"
    | "FAILED";

  report?: GovernanceDashboardReport;

}

// ======================================================
// GOVERNANCE REPORT SUMMARY
// ======================================================

export interface GovernanceReportSummary {

  totalFiles: number;

  totalScanners: number;

  passedScanners: number;

  failedScanners: number;

  overallScore: number;

  deploymentReady: boolean;

}

// ======================================================
// END OF GOVERNANCE TYPES
// ======================================================
