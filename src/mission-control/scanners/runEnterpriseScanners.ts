import {
  EnterpriseScannerResult,
  ScannerContext,
  ScannerResult,
} from "./types";

import { scanFirestore } from "./firestoreScanner";

export interface RunScannerOptions {
  executionId: string;
  scanners?: "all" | string[];
}

export async function runEnterpriseScanners(
  options: RunScannerOptions
): Promise<EnterpriseScannerResult> {
  const started = Date.now();

  const context: ScannerContext = {
    executionId: options.executionId,
    rootPath: process.cwd(),
    environment:
      process.env.NODE_ENV === "production"
        ? "production"
        : "development",
    timestamp: new Date().toISOString(),
  };

  const scan = await scanFirestore();

  const result: ScannerResult = {
    id: "firestore",
    name: "Firestore Scanner",
    status: scan.issueCount > 0 ? "warning" : "passed",
    startedAt: new Date(started).toISOString(),
    finishedAt: new Date().toISOString(),
    duration: Date.now() - started,
    scannedItems: scan.scannedFiles,
    passed: scan.issueCount === 0 ? scan.scannedFiles : 0,
    warnings: scan.issueCount,
    failed: 0,
    issues: scan.issues.map((issue) => ({
      id: crypto.randomUUID(),
      title: issue.type,
      description: issue.value,
      severity: "medium",
      file: issue.file,
      line: issue.line,
      recommendation: "Review Firestore usage.",
    })),
  };

  return {
    executionId: options.executionId,
    startedAt: new Date(started).toISOString(),
    finishedAt: new Date().toISOString(),
    duration: Date.now() - started,
    success: true,
    total: 1,
    passed: result.status === "passed" ? 1 : 0,
    warnings: result.status === "warning" ? 1 : 0,
    failed: 0,
    scanners: [result],
  };
}
