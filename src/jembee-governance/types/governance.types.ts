// src/jembee-governance/types/governance.types.ts

/**
 * JEMBEEKART GOVERNANCE SYSTEM
 * Common Types & Interfaces
 */

export type SeverityLevel =
  | "INFO"
  | "WARNING"
  | "ERROR"
  | "CRITICAL";

export type DeploymentStatus =
  | "PASS"
  | "BLOCKED";

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
  | "PERFORMANCE";

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

export interface ScanResult {
  totalFilesScanned: number;

  totalPagesScanned: number;

  totalCollectionsScanned: number;

  totalViolations: number;

  violations: GovernanceViolation[];
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

export interface SecurityReport {
  apiKeyExposed: boolean;

  secretFound: boolean;

  adminBypassDetected: boolean;

  firestoreRulesMissing: boolean;

  totalSecurityIssues: number;
}

export interface ThemeReport {
  pageName: string;

  adminThemeConnected: boolean;

  hardcodedColorsFound: boolean;

  hardcodedFontsFound: boolean;

  passed: boolean;
}

export interface PageConnectionReport {
  pageName: string;

  routeExists: boolean;

  navbarConnected: boolean;

  footerConnected: boolean;

  deepLinkConnected: boolean;

  passed: boolean;
}

export interface DuplicateCodeReport {
  moduleName: string;

  duplicateFiles: string[];

  similarityPercentage: number;

  passed: boolean;
}

export interface FirestoreCollectionReport {
  collectionName: string;

  exists: boolean;

  readRuleExists: boolean;

  writeRuleExists: boolean;

  indexesConfigured: boolean;

  passed: boolean;
}

export interface GovernanceScore {
  architectureScore: number;

  profitabilityScore: number;

  securityScore: number;

  themeScore: number;

  adminControlScore: number;

  overallScore: number;
}

export interface GovernanceDashboardReport {
  deploymentStatus: DeploymentStatus;

  generatedAt: string;

  filesScanned: number;

  pagesScanned: number;

  collectionsScanned: number;

  totalViolations: number;

  criticalViolations: number;

  architectureScore: number;

  profitabilityScore: number;

  securityScore: number;

  themeScore: number;

  adminControlScore: number;

  overallScore: number;

  violations: GovernanceViolation[];
}

export interface ScannerContext {
  projectRoot: string;

  scanTime: string;
}
