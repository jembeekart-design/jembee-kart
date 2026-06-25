// src/jembee-governance/types/scanner.types.ts

import {
  GovernancePriority,
  SeverityLevel,
  GovernanceFinalStatus,
  GovernanceFixStatus,
  FeatureCategory,
  ProductionRisk,
  GovernanceViolation,
} from "./governance.types";

// ======================================================
// SCANNER CONTEXT
// ======================================================

export interface ScannerContext {

  projectRoot: string;

  projectName: string;

  scanId: string;

  scanDate: string;

  branch: string;

  environment:
    | "LOCAL"
    | "DEV"
    | "STAGING"
    | "PRODUCTION";

}

// ======================================================
// SCANNER CONFIG
// ======================================================

export interface GovernanceScannerConfig {

  enabled: boolean;

  deepScan: boolean;

  includeNodeModules: boolean;

  includeTests: boolean;

  includeHiddenFiles: boolean;

  maxFileSizeMB: number;

}

// ======================================================
// SCANNER FINDING
// ======================================================

export interface GovernanceFinding {

  auditId: string;

  title: string;

  problem: string;

  fileName: string;

  folderPath: string;

  routePath?: string;

  lineNumber?: number;

  pageName?: string;

  moduleName?: string;

  featureCategory: FeatureCategory;

  severity: SeverityLevel;

  priority: GovernancePriority;

  severityScore: number;

  productionRisk: ProductionRisk;

  recommendation: string;

  autoFixAvailable: boolean;

  autoFixScript?: string;

  fixStatus: GovernanceFixStatus;

  finalStatus: GovernanceFinalStatus;

  detectedAt: string;

}

// ======================================================
// SCANNER RESULT
// ======================================================

export interface GovernanceScannerResult {

  scannerName: string;

  scannerVersion: string;

  filesScanned: number;

  foldersScanned: number;

  executionTimeMs: number;

  findings: GovernanceFinding[];

  violations: GovernanceViolation[];

  success: boolean;

  errors: string[];

  warnings: string[];

  metadata?: Record<string, unknown>;

}

// ======================================================
// SCANNER CONTRACT
// ======================================================

export interface GovernanceScanner {

  readonly scannerName: string;

  readonly version: string;

  scan(
    context: ScannerContext
  ): Promise<GovernanceScannerResult>;

}

// ======================================================
// FIX REQUEST
// ======================================================

export interface GovernanceFixRequest {

  auditId: string;

  autoFix: boolean;

  developer: string;

  notes?: string;

}

// ======================================================
// FIX RESULT
// ======================================================

export interface GovernanceFixResult {

  success: boolean;

  message: string;

  fixedFile?: string;

  fixedLine?: number;

  commitHash?: string;

}
