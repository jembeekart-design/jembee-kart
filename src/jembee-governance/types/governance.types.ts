// src/jembee-governance/types/governance.types.ts

// ======================================================
// JEMBEEKART GOVERNANCE ENGINE
// TYPES FILE
// PART 1 - BASE TYPES & CORE INTERFACES
// ======================================================

// ======================================================
// BASE ENUMS
// ======================================================

export type SeverityLevel =
  | "INFO"
  | "WARNING"
  | "ERROR"
  | "CRITICAL";

export type DeploymentStatus =
  | "PASS"
  | "BLOCKED";

export type GovernancePriority =
  | "CRITICAL"
  | "HIGH"
  | "MEDIUM"
  | "LOW";

export type GovernanceFixStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "FIXED";

export type GovernanceFinalStatus =
  | "PASS"
  | "WARNING"
  | "FAIL"
  | "CRITICAL";

export type FeatureCategory =
  | "ECOMMERCE"
  | "REFERRAL"
  | "WATCH_EARN"
  | "CREATOR"
  | "ADS";

export type FirestoreStatus =
  | "CONNECTED"
  | "PARTIAL"
  | "DISCONNECTED";

export type ProductionRisk =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "CRITICAL";

// ======================================================
// GOVERNANCE CATEGORY
// ======================================================

export type ViolationCategory =
  | "ARCHITECTURE"
  | "PROFITABILITY"
  | "SECURITY"
  | "THEME"
  | "ADMIN_CONTROL"
  | "HARDCODED_RULE"
  | "PAGE_CONNECTION"
  | "DUPLICATE_CODE"
  | "WATCH_EARN"
  | "REFERRAL"
  | "MLM"
  | "CREATOR"
  | "DATABASE"
  | "FIRESTORE"
  | "ANTI_FRAUD"
  | "PERFORMANCE"
  | "CREATOR_ECONOMY"
  | "DEPLOYMENT"
  | "MLM_COMPLIANCE"
  | "WALLET";

// ======================================================
// GOVERNANCE VIOLATION
// ======================================================

export interface GovernanceViolation {
  id: string;

  title: string;

  description: string;

  category: ViolationCategory;

  severity: SeverityLevel;

  filePath?: string;

  pageName?: string;

  moduleName?: string;

  lineNumber?: number;

  expectedValue?: string;

  actualValue?: string;

  recommendation?: string;

  detectedAt: string;
}

// ======================================================
// GOVERNANCE HISTORY
// ======================================================

export interface GovernanceHistory {

  scanDate: string;

  overallScore: number;

}

// ======================================================
// MAIN GOVERNANCE REPORT
// ======================================================

export interface JembeeKartGovernanceReport {

  // Identification

  auditId: string;

  auditSequence?: number;

  scannerName: string;

  scannerVersion: string;

  detectedDate: string;

  lastModifiedDate?: string;

  // Problem

  problem: string;

  rootCause?: string;

  // Location

  fileName: string;

  folderPath: string;

  routePath?: string;

  exactLineNumber?: number;

  pageName: string;

  moduleName: string;

  featureCategory: FeatureCategory;

  // Priority

  priority: GovernancePriority;

  severityScore: number;

  // Status

  fixStatus: GovernanceFixStatus;

  finalStatus: GovernanceFinalStatus;

}
// ======================================================
// JEMBEEKART AUDIT MASTER
// ======================================================

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

    estimatedBusinessLoss: number;

    estimatedProfitLeakage: number;
  };
}

// ======================================================
// GOVERNANCE DASHBOARD REPORT
// ======================================================

export interface GovernanceDashboardReport {

  // Deployment

  deploymentStatus: DeploymentStatus;

  generatedAt: string;

  version?: string;

  // Scan Statistics

  filesScanned: number;

  pagesScanned: number;

  collectionsScanned: number;

  totalViolations: number;

  // Dashboard Counters

  criticalCount?: number;

  errorCount?: number;

  warningCount?: number;

  infoCount?: number;

  duplicateCodeCount?: number;

  hardcodedRuleCount?: number;

  pageConnectionCount?: number;

  securityIssueCount?: number;

  firestoreIssueCount?: number;

  adminControlIssueCount?: number;

  // Scores

  overallScore: number;

  architectureScore: number;

  profitabilityScore: number;

  securityScore: number;

  themeScore: number;

  adminControlScore: number;

  duplicateCodeScore?: number;

  hardcodedRuleScore?: number;

  pageConnectionScore?: number;

  deploymentScore?: number;

  performanceScore?: number;

  scalabilityScore?: number;

  complianceScore?: number;

  // Business

  totalRevenueAtRisk: number;

  totalAffectedUsers: number;

  totalProfitLeakage?: number;

  totalOrdersAffected?: number;

  totalWalletMismatch?: number;

  // Data

  violations: GovernanceViolation[];

  enterpriseViolations: JembeeKartGovernanceReport[];

  enterpriseAudit?: JembeeKartAuditMaster;

  history?: GovernanceHistory[];

  // MLM Governance

  mlmGovernance?: {

    healthScore: number;

    totalOrdersAudited: number;

    totalCommissionPaid: number;

    totalCommissionReversed: number;

    duplicateCommissionCount: number;

    walletMismatchCount: number;

    profitLeakageCount: number;

  };

  // Wallet Governance

  walletGovernance?: {

    integrityScore: number;

    totalUsersAudited: number;

    mismatchCount: number;

    negativeBalanceCount?: number;

    lockedWalletCount?: number;

  };

  // Audit Table

  mlmAuditItems?: {

    orderId: string;

    userId?: string;

    profit: number;

    commission: number;

    status: string;

    issues?: string;

  }[];

}
// PART 1
BASE TYPES & CORE INTERFACES

// PART 2
SCANNER CONTRACTS & ENGINE TYPES

export interface GovernanceScanner {
...
}

export interface ScannerContext {
...
}

export interface GovernanceScannerConfig {
...
}

export interface GovernanceFixRequest {
...
}

export interface GovernanceFixResult {
...
}

// PART 3
ENTERPRISE SCANNER REPORTS
ArchitectureReport
DuplicateCodeReport
SecurityReport
ThemeReport
FirestoreReport
HardcodedRuleReport
PageConnectionReport
AdminControlReport
ProfitabilityReport
WalletReport
MlmComplianceReport
ReferralReport
WatchEarnReport
CreatorEconomyReport
AntiFraudReport
PerformanceReport
DeploymentReport

// PART 4
INFRASTRUCTURE & GOVERNANCE REPORTS
AnalyticsReport
NotificationReport
ApiReport
AuthenticationReport
AuthorizationReport
RolePermissionReport
AuditLogReport
FeatureFlagReport
RealtimeReport
DatabaseIntegrityReport
DependencyReport
RouteReport
ConfigReport
ComplianceReport
RiskAssessmentReport
PolicyReport
VersionReport
MigrationReport
ConfigurationDriftReport
LicenseComplianceReport
CodeQualityReport
TechnicalDebtReport
DocumentationReport

// PART 5
DEVOPS + CLOUD + DATABASE + COMMERCE + FINANCE + USER + AI + TEST REPORTS
BuildReport
CICDReport
DockerReport
EnvironmentReport
ReleaseReport
RollbackReport
FirebaseReport
CloudFunctionReport
CloudStorageReport
CDNReport
HostingReport
FirestoreIndexReport
FirestoreRulesReport
TransactionReport
DataConsistencyReport
MigrationHistoryReport
EcommerceReport
SellerReport
ProductReport
InventoryReport
PricingReport
OrderReport
PaymentReport
ShippingReport
TaxReport
InvoiceReport
RefundReport
ReturnReport
WalletTransactionReport
PayoutReport
SettlementReport
ProfitLossReport
RevenueLeakageReport
UserReport
UserActivityReport
SessionReport
DeviceReport
KYCReport
PromptSecurityReport
AIUsageReport
AIModelReport
AITrainingReport
UnitTestReport
IntegrationTestReport
E2ETestReport
RegressionTestReport
TestCoverageReport
// ======================================================
// PART 3
// ENTERPRISE SCANNER REPORTS
// ======================================================

export interface ArchitectureReport {
  passed: boolean;
  architectureScore: number;
  totalModules: number;
  cleanModules: number;
  violationCount: number;
}

export interface DuplicateCodeReport {
  moduleName: string;
  duplicateFiles: string[];
  similarityPercentage: number;

  priority?: GovernancePriority;
  businessImpact?: string;
  recommendation?: string;

  passed: boolean;
}

export interface SecurityReport {
  apiKeyExposed: boolean;
  secretFound: boolean;
  adminBypassDetected: boolean;
  firestoreRulesMissing: boolean;
  totalSecurityIssues: number;
  securityScore?: number;
}

export interface ThemeReport {
  pageName: string;
  adminThemeConnected: boolean;
  hardcodedColorsFound: boolean;
  hardcodedFontsFound: boolean;
  hardcodedIconsFound?: boolean;
  passed: boolean;
}

export interface FirestoreReport {
  collectionName: string;
  exists: boolean;
  readRuleExists: boolean;
  writeRuleExists: boolean;
  indexesConfigured: boolean;
  realtimeEnabled?: boolean;
  passed: boolean;
}

export interface HardcodedRuleReport {
  filePath: string;
  ruleName: string;
  hardcodedValue: string;
  recommendation: string;
  severity: SeverityLevel;
  passed: boolean;
}

export interface PageConnectionReport {
  pageName: string;
  route: string;

  routeExists: boolean;

  navbarConnected: boolean;

  footerConnected: boolean;

  deepLinkConnected: boolean;

  requiredParentRoute?: string;

  actualParentRoutes?: string[];

  businessFlow?: string;

  businessImpact?: string;

  missingConnectionSuggestion?: string;

  priority?: GovernancePriority;

  expectedGovernanceScoreGain?: number;

  passed: boolean;
}

export interface AdminControlReport {
  moduleName: string;
  firestoreControlled: boolean;
  featureFlagEnabled: boolean;
  adminPanelConnected: boolean;
  passed: boolean;
}

export interface ProfitabilityReport {
  orderProfit: number;
  cashbackExpense: number;
  referralExpense: number;
  rewardExpense: number;
  creatorExpense: number;
  protectionFundExpense: number;
  totalExpense: number;
  netRemainingProfit: number;
  profitable: boolean;
}

export interface WalletReport {
  walletIntegrityScore: number;
  totalWalletsAudited: number;
  mismatchCount: number;
  negativeBalanceCount: number;
  lockedWalletCount: number;
}

export interface MlmComplianceReport {
  commissionRulesPassed: boolean;
  duplicateCommissionFound: boolean;
  levelValidationPassed: boolean;
  sponsorTreeValid: boolean;
  totalViolations: number;
}

export interface ReferralReport {
  totalReferrals: number;
  activeReferrals: number;
  invalidReferrals: number;
  commissionGenerated: number;
}

export interface WatchEarnReport {
  totalVideos: number;
  validVideos: number;
  invalidVideos: number;
  rewardCycles: number;
  lockedRewards: number;
}

export interface CreatorEconomyReport {
  creatorsAudited: number;
  monetizedCreators: number;
  pendingPayments: number;
  creatorRevenue: number;
}

export interface AntiFraudReport {
  suspiciousUsers: number;
  fakeOrders: number;
  fakeReferrals: number;
  blockedAccounts: number;
  fraudScore: number;
}

export interface PerformanceReport {
  averageResponseTime: number;
  slowPages: number;
  memoryUsage: number;
  cpuUsage: number;
  performanceScore: number;
}

export interface DeploymentReport {
  deploymentId: string;
  provider: string;
  status: DeploymentStatus;
  buildTime: number;
  deployedAt: string;
}
// ======================================================
// PART 4
// INFRASTRUCTURE & GOVERNANCE REPORTS
// ======================================================

export interface AnalyticsReport {
  analyticsConnected: boolean;
  provider: string;
  trackingEvents: number;
  missingEvents: string[];
  passed: boolean;
}

export interface NotificationReport {
  emailEnabled: boolean;
  pushEnabled: boolean;
  smsEnabled: boolean;
  whatsappEnabled: boolean;
  failedNotifications: number;
  passed: boolean;
}

export interface ApiReport {
  apiName: string;
  endpoint: string;
  method: string;
  authenticated: boolean;
  responseTime: number;
  statusCode: number;
  rateLimited: boolean;
  passed: boolean;
}

export interface AuthenticationReport {
  authenticationEnabled: boolean;
  jwtEnabled: boolean;
  sessionProtected: boolean;
  mfaEnabled: boolean;
  anonymousAccessDetected: boolean;
  passed: boolean;
}

export interface AuthorizationReport {
  roleBasedAccessEnabled: boolean;
  permissionValidationEnabled: boolean;
  unauthorizedRoutes: string[];
  adminRoutesProtected: boolean;
  passed: boolean;
}

export interface RolePermissionReport {
  roleName: string;
  totalPermissions: number;
  missingPermissions: string[];
  extraPermissions: string[];
  passed: boolean;
}

export interface AuditLogReport {
  auditEnabled: boolean;
  totalLogs: number;
  failedLogs: number;
  lastAuditTime: string;
  passed: boolean;
}

export interface FeatureFlagReport {
  featureName: string;
  enabled: boolean;
  firestoreControlled: boolean;
  defaultValue: boolean;
  passed: boolean;
}

export interface RealtimeReport {
  firestoreRealtimeEnabled: boolean;
  websocketEnabled: boolean;
  liveSyncEnabled: boolean;
  offlineSupport: boolean;
  passed: boolean;
}

export interface DatabaseIntegrityReport {
  totalCollections: number;
  totalDocuments: number;
  orphanDocuments: number;
  duplicateDocuments: number;
  invalidReferences: number;
  integrityScore: number;
  passed: boolean;
}

export interface DependencyReport {
  moduleName: string;
  dependencyCount: number;
  circularDependencies: string[];
  unusedDependencies: string[];
  passed: boolean;
}

export interface RouteReport {
  totalRoutes: number;
  orphanRoutes: string[];
  protectedRoutes: string[];
  publicRoutes: string[];
  duplicateRoutes: string[];
  passed: boolean;
}

export interface ConfigReport {
  configName: string;
  firestoreControlled: boolean;
  hardcoded: boolean;
  version: string;
  lastUpdated: string;
  passed: boolean;
}

export interface ComplianceReport {
  overallComplianceScore: number;
  policyViolations: number;
  passedPolicies: number;
  failedPolicies: number;
  passed: boolean;
}

export interface RiskAssessmentReport {
  overallRiskScore: number;
  businessRisk: number;
  securityRisk: number;
  financialRisk: number;
  operationalRisk: number;
  passed: boolean;
}

export interface PolicyReport {
  policyName: string;
  enabled: boolean;
  violated: boolean;
  violationCount: number;
  passed: boolean;
}

export interface VersionReport {
  currentVersion: string;
  latestVersion: string;
  updateRequired: boolean;
  releaseDate: string;
  passed: boolean;
}

export interface MigrationReport {
  migrationName: string;
  applied: boolean;
  executionTime: number;
  rollbackAvailable: boolean;
  passed: boolean;
}

export interface ConfigurationDriftReport {
  configurationName: string;
  expectedValue: string;
  actualValue: string;
  driftDetected: boolean;
  passed: boolean;
}

export interface LicenseComplianceReport {
  totalPackages: number;
  validLicenses: number;
  invalidLicenses: number;
  restrictedLicenses: string[];
  passed: boolean;
}

export interface CodeQualityReport {
  codeQualityScore: number;
  maintainabilityIndex: number;
  technicalDebtHours: number;
  codeSmells: number;
  passed: boolean;
}

export interface TechnicalDebtReport {
  estimatedHours: number;
  criticalDebt: number;
  highDebt: number;
  mediumDebt: number;
  lowDebt: number;
  passed: boolean;
}

export interface DocumentationReport {
  documentedModules: number;
  undocumentedModules: number;
  apiDocumentationComplete: boolean;
  architectureDocumentationComplete: boolean;
  passed: boolean;
}
// ======================================================
// PART 5
// DEVOPS REPORTS
// ======================================================

export interface BuildReport {
  buildId: string;
  status: "SUCCESS" | "FAILED";
  buildTime: number;
  buildSize: number;
  errors: number;
}

export interface CICDReport {
  provider: string;
  pipelineStatus: string;
  lastRun: string;
  deploymentTriggered: boolean;
}

export interface DockerReport {
  dockerEnabled: boolean;
  imageSize: number;
  containerCount: number;
  vulnerabilities: number;
}

export interface EnvironmentReport {
  environment: "LOCAL" | "DEV" | "STAGING" | "PRODUCTION";
  variablesLoaded: number;
  missingVariables: string[];
}

export interface ReleaseReport {
  releaseVersion: string;
  releaseDate: string;
  releasedBy: string;
  stable: boolean;
}

export interface RollbackReport {
  rollbackAvailable: boolean;
  rollbackVersion?: string;
  rollbackReason?: string;
}

// ======================================================
// CLOUD REPORTS
// ======================================================

export interface FirebaseReport {
  projectConnected: boolean;
  authEnabled: boolean;
  firestoreEnabled: boolean;
  storageEnabled: boolean;
}

export interface CloudFunctionReport {
  totalFunctions: number;
  deployedFunctions: number;
  failedFunctions: number;
}

export interface CloudStorageReport {
  bucketConnected: boolean;
  totalFiles: number;
  storageUsedMB: number;
}

export interface CDNReport {
  enabled: boolean;
  provider: string;
  cacheHitRate: number;
}

export interface HostingReport {
  provider: string;
  deploymentStatus: string;
  customDomainConnected: boolean;
}

// ======================================================
// DATABASE REPORTS
// ======================================================

export interface FirestoreIndexReport {
  totalIndexes: number;
  missingIndexes: number;
}

export interface FirestoreRulesReport {
  readRules: boolean;
  writeRules: boolean;
  adminRules: boolean;
}

export interface TransactionReport {
  totalTransactions: number;
  failedTransactions: number;
  averageExecutionTime: number;
}

export interface DataConsistencyReport {
  duplicateRecords: number;
  orphanRecords: number;
  consistencyScore: number;
}

export interface MigrationHistoryReport {
  totalMigrations: number;
  latestMigration: string;
  pendingMigrations: number;
}

// ======================================================
// COMMERCE REPORTS
// ======================================================

export interface EcommerceReport {
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  revenue: number;
}

export interface SellerReport {
  totalSellers: number;
  activeSellers: number;
  blockedSellers: number;
}

export interface ProductReport {
  totalProducts: number;
  inactiveProducts: number;
  outOfStockProducts: number;
}

export interface InventoryReport {
  totalStock: number;
  lowStockItems: number;
  outOfStockItems: number;
}

export interface PricingReport {
  averageMargin: number;
  negativeMarginProducts: number;
}

export interface OrderReport {
  totalOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
}

export interface PaymentReport {
  successfulPayments: number;
  failedPayments: number;
  pendingPayments: number;
}

export interface ShippingReport {
  shippedOrders: number;
  delayedOrders: number;
}

export interface TaxReport {
  totalTaxCollected: number;
  taxErrors: number;
}

export interface InvoiceReport {
  invoicesGenerated: number;
  pendingInvoices: number;
}

export interface RefundReport {
  refundRequests: number;
  completedRefunds: number;
}

export interface ReturnReport {
  returnedOrders: number;
  returnRate: number;
}

// ======================================================
// FINANCE REPORTS
// ======================================================

export interface WalletTransactionReport {
  totalTransactions: number;
  failedTransactions: number;
}

export interface PayoutReport {
  pendingPayouts: number;
  completedPayouts: number;
}

export interface SettlementReport {
  totalSettlements: number;
  pendingSettlements: number;
}

export interface ProfitLossReport {
  totalRevenue: number;
  totalExpense: number;
  netProfit: number;
}

export interface RevenueLeakageReport {
  estimatedLeakage: number;
  leakageReason: string;
}

// ======================================================
// USER REPORTS
// ======================================================

export interface UserReport {
  totalUsers: number;
  activeUsers: number;
  blockedUsers: number;
}

export interface UserActivityReport {
  activeToday: number;
  activeThisWeek: number;
  activeThisMonth: number;
}

export interface SessionReport {
  totalSessions: number;
  averageSessionTime: number;
}

export interface DeviceReport {
  androidUsers: number;
  iosUsers: number;
  webUsers: number;
}

export interface KYCReport {
  verifiedUsers: number;
  pendingVerification: number;
  rejectedUsers: number;
}

// ======================================================
// AI REPORTS
// ======================================================

export interface PromptSecurityReport {
  promptInjectionDetected: number;
  blockedPrompts: number;
}

export interface AIUsageReport {
  totalRequests: number;
  successfulRequests: number;
}

export interface AIModelReport {
  modelName: string;
  modelVersion: string;
  responseTime: number;
}

export interface AITrainingReport {
  datasets: number;
  lastTrainingDate: string;
}

// ======================================================
// TEST REPORTS
// ======================================================

export interface UnitTestReport {
  totalTests: number;
  passedTests: number;
  failedTests: number;
}

export interface IntegrationTestReport {
  totalTests: number;
  passedTests: number;
  failedTests: number;
}

export interface E2ETestReport {
  totalTests: number;
  passedTests: number;
  failedTests: number;
}

export interface RegressionTestReport {
  regressionsFound: number;
  regressionsFixed: number;
}

export interface TestCoverageReport {
  statements: number;
  branches: number;
  functions: number;
  lines: number;
}
