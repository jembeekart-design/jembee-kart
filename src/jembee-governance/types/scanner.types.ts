import {
  GovernancePriority,
  SeverityLevel,
  GovernanceFinalStatus,
  GovernanceFixStatus,
  FeatureCategory,
  ProductionRisk,
} from "./governance.types";

export interface ScannerContext {
  projectRoot: string;
  projectName: string;
  scanId: string;
  scanDate: string;
  branch: string;
  environment: "LOCAL" | "DEV" | "STAGING" | "PRODUCTION";
}

export interface GovernanceScannerConfig {
  enabled: boolean;
  deepScan: boolean;
  includeNodeModules: boolean;
  includeTests: boolean;
  includeHiddenFiles: boolean;
  maxFileSizeMB: number;
}

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

export interface GovernanceScannerResult {
  scannerName: string;

  scannerVersion: string;

  filesScanned: number;

  foldersScanned: number;

  executionTimeMs: number;

  findings: GovernanceFinding[];

  success: boolean;

  errors: string[];
}

export interface GovernanceScanner {
  readonly scannerName: string;

  readonly version: string;

  scan(
    context: ScannerContext
  ): Promise<GovernanceScannerResult>;
}

export interface GovernanceFixRequest {
  auditId: string;

  autoFix: boolean;

  developer: string;

  notes?: string;
}

export interface GovernanceFixResult {
  success: boolean;

  message: string;

  fixedFile?: string;

  fixedLine?: number;

  commitHash?: string;
}
