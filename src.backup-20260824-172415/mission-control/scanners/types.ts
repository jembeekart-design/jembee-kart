export type ScannerStatus =
  | "passed"
  | "warning"
  | "failed"
  | "skipped";

export interface ScannerIssue {
  id: string;
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  file?: string;
  line?: number;
  recommendation?: string;
}

export interface ScannerResult {
  id: string;
  name: string;

  status: ScannerStatus;

  startedAt: string;
  finishedAt: string;

  duration: number;

  scannedItems: number;

  passed: number;
  warnings: number;
  failed: number;

  issues: ScannerIssue[];

  metadata?: Record<string, unknown>;
}

export interface ScannerSummary {
  total: number;
  passed: number;
  warnings: number;
  failed: number;
}

export interface EnterpriseScannerResult {
  executionId: string;

  startedAt: string;

  finishedAt: string;

  duration: number;

  total: number;

  passed: number;

  warnings: number;

  failed: number;

  scanners: ScannerResult[];

  success: boolean;
}

export interface ScannerContext {
  executionId: string;

  rootPath: string;

  environment: "development" | "production";

  timestamp: string;
}

export interface EnterpriseScanner {
  id: string;

  name: string;

  run(
    context: ScannerContext
  ): Promise<ScannerResult>;
}
