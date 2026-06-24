// src/jembee-governance/types/governance.types.ts

// ======================================================
// 1. BASE GOVERNANCE TYPES
// ======================================================
export type SeverityLevel = "INFO" | "WARNING" | "ERROR" | "CRITICAL";
export type DeploymentStatus = "PASS" | "BLOCKED";

export type ViolationCategory =
  | "ARCHITECTURE" | "PROFITABILITY" | "SECURITY" | "THEME" | "ADMIN_CONTROL"
  | "HARDCODED_RULE" | "PAGE_CONNECTION" | "DUPLICATE_CODE" | "WATCH_EARN" | "REFERRAL"
  | "MLM" | "CREATOR" | "DATABASE" | "FIRESTORE" | "ANTI_FRAUD" | "PERFORMANCE"
  | "CREATOR_ECONOMY" | "DEPLOYMENT" | "MLM_COMPLIANCE" | "WALLET";

export interface GovernanceViolation {
  id: string; title: string; description: string; category: ViolationCategory; severity: SeverityLevel;
  filePath?: string; pageName?: string; moduleName?: string; lineNumber?: number;
  expectedValue?: string; actualValue?: string; recommendation?: string; detectedAt: string;
}

export interface GovernanceHistory { scanDate: string; overallScore: number; }

// ======================================================
// 2. ENTERPRISE TYPES (JembeeKart Master Model)
// ======================================================
export type GovernancePriority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
export type GovernanceFixStatus = "PENDING" | "IN_PROGRESS" | "FIXED";
export type GovernanceFinalStatus = "PASS" | "WARNING" | "FAIL" | "CRITICAL";
export type FeatureCategory = "ECOMMERCE" | "REFERRAL" | "WATCH_EARN" | "CREATOR" | "ADS";

export interface JembeeKartGovernanceReport {
  // Audit Standard
  auditId: string; // GOV-2026-0001
  auditSequence?: number;
  scannerName: string; scannerVersion: string;
  problem: string; rootCause?: string;
  
  // Location & Routing
  fileName: string; folderPath: string; routePath?: string;
  exactLineNumber?: number; pageName: string; moduleName: string;
  
  // Connection Analysis
  currentConnection?: string;
  requiredConnection?: string;
  missingConnectionSuggestion?: string;
  dependencyPages?: string[];
  dependencyCollections?: string[];
  dependencyApis?: string[];
  
  // Business Model Impact (0-100)
  ecommerceImpact?: number;
  referralImpact?: number;
  watchEarnImpact?: number;
  creatorEconomyImpact?: number;
  advertisingImpact?: number;
  walletImpact?: number;
  
  // Fix Information
  changeRequired?: string;
  exactFixLocation?: string;
  suggestedCode?: string;
  autoFixAvailable?: boolean;
  autoFixScript?: string;
  autoFixConfidence?: number;
  
  // Testing & Governance Score
  testingRequired?: boolean;
  testCases?: string[];
  expectedGovernanceScoreGain?: number;
  rescanRequired?: boolean;
  
  // Firestore & Security & Admin
  firestoreCollectionsRequired?: string[];
  authenticationCheck?: boolean;
  rolePermissionCheck?: boolean;
  themeEngineConnected?: boolean;
  analyticsConnected?: boolean;
  auditLogAvailable?: boolean;
  
  // Enterprise Tracking
  jiraTicketId?: string; slaDueDate?: string; sprintAssigned?: string;
  ownerEmail?: string; slackChannel?: string;
  
  // Metadata & Status
  featureCategory: FeatureCategory;
  priority: GovernancePriority;
  severityScore: number;
  revenueImpact?: number;
  profitLeakageRisk?: number;
  gdprImpact?: boolean; pciDssImpact?: boolean;
  adminControlled?: boolean;
  fixStatus: GovernanceFixStatus;
  finalStatus: GovernanceFinalStatus;
  detectedDate: string;
}

export interface JembeeKartAuditMaster {
  batchId: string;
  totalReports: number;
  criticalIssues: number;
  scanTimestamp: string;
  reports: JembeeKartGovernanceReport[];
  summary: {
    totalRevenueAtRisk: number;
    totalAffectedUsers: number;
    estimatedFixManHours: number;
  };
}

// ======================================================
// 3. MASTER DASHBOARD INTERFACE
// ======================================================
export interface GovernanceDashboardReport {
  deploymentStatus: DeploymentStatus;
  generatedAt: string;
  version?: string;
  
  filesScanned: number;
  pagesScanned: number;
  collectionsScanned: number;
  totalViolations: number;

  overallScore: number;
  architectureScore: number;
  profitabilityScore: number;
  securityScore: number;
  themeScore: number;
  adminControlScore: number;

  violations: GovernanceViolation[];
  enterpriseViolations: JembeeKartGovernanceReport[];
  enterpriseAudit?: JembeeKartAuditMaster;

  totalRevenueAtRisk: number;
  totalAffectedUsers: number;
  criticalCount?: number;
  errorCount?: number;
  warningCount?: number;

  history?: GovernanceHistory[];
  mlmGovernance?: {
    healthScore: number; totalOrdersAudited: number; totalCommissionPaid: number;
    totalCommissionReversed: number; duplicateCommissionCount: number; 
    walletMismatchCount: number; profitLeakageCount: number;
  };
  walletGovernance?: { integrityScore: number; totalUsersAudited: number; mismatchCount: number; };
  mlmAuditItems?: { orderId: string; profit: number; commission: number; status: string; issues?: string; }[];
}

// ======================================================
// 4. SCANNER CONTRACTS & UTILITIES
// ======================================================
export interface GovernanceScanner {
  scannerName: string;
  scan(context: ScannerContext): Promise<JembeeKartGovernanceReport[]>;
}

export interface ScannerContext { projectRoot: string; scanTime: string; }

export interface GovernanceScannerConfig {
  enableDeepScan: boolean;
  includePaths: string[];
  excludePaths: string[];
  maxConcurrency: number;
}

export interface GovernanceFixRequest {
  auditId: string;
  targetBranch: string;
  applyAutoFix: boolean;
  developerNotes?: string;
}

export interface GovernanceFixResult {
  success: boolean;
  message: string;
  commitHash?: string;
  error?: string;
}
// ======================================================
// 6. PAGE CONNECTION TYPES (Added at the end of file)
// ======================================================

export interface PageConnectionReport {
  pageName: string;
  route: string;
  routeExists: boolean;
  navbarConnected: boolean;
  footerConnected: boolean;
  deepLinkConnected: boolean;
  
  // Naye Fields (Master Model Integration)
  requiredParentRoute?: string;
  actualParentRoutes?: string[];
  businessFlow?: string;
  businessImpact?: string;
  missingConnectionSuggestion?: string;
  priority?: GovernancePriority;
  expectedGovernanceScoreGain?: number;
  
  passed: boolean;
}

