import {
  EnterpriseScanner,
  EnterpriseScannerResult,
  ScannerContext,
  ScannerResult,
} from "./types";

import { firestoreScanner } from "./firestoreScanner";
import { duplicateCodeScanner } from "./duplicateCodeScanner";

export interface RunScannerOptions {
  executionId: string;
  scanners?: "all" | string[];
}

const availableScanners: EnterpriseScanner[] = [
  firestoreScanner,
  duplicateCodeScanner,
];

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

  const selected =
    options.scanners === "all" || !options.scanners
      ? availableScanners
      : availableScanners.filter(scanner =>
          options.scanners!.includes(scanner.id)
        );

  const results: ScannerResult[] = [];

  for (const scanner of selected) {
    try {
      const result = await scanner.run(context);
      results.push(result);
    } catch (error: any) {
      const now = new Date().toISOString();

      results.push({
        id: scanner.id,
        name: scanner.name,
        status: "failed",
        startedAt: now,
        finishedAt: now,
        duration: 0,
        scannedItems: 0,
        passed: 0,
        warnings: 0,
        failed: 1,
        issues: [
          {
            id: crypto.randomUUID(),
            title: "Scanner Execution Failed",
            description:
              error?.message ??
              "Unexpected scanner error",
            severity: "critical",
          },
        ],
      });
    }
  }

  const summary = results.reduce(
    (acc, scanner) => {
      acc.total++;

      if (scanner.status === "passed") acc.passed++;
      if (scanner.status === "warning") acc.warnings++;
      if (scanner.status === "failed") acc.failed++;

      return acc;
    },
    {
      total: 0,
      passed: 0,
      warnings: 0,
      failed: 0,
    }
  );

  return {
    executionId: options.executionId,
    startedAt: new Date(started).toISOString(),
    finishedAt: new Date().toISOString(),
    duration: Date.now() - started,
    success: summary.failed === 0,
    total: summary.total,
    passed: summary.passed,
    warnings: summary.warnings,
    failed: summary.failed,
    scanners: results,
  };
}
