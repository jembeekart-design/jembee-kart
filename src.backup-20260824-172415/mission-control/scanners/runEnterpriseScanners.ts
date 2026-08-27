import {
  EnterpriseScannerResult,
  ScannerContext,
  ScannerResult,
} from "./types";

import { scanFirestore } from "./firestoreScanner";
import { duplicateCodeScanner } from "./duplicateCodeScanner";
import { findHardcodedBusinessRules } from "../autofix/hardcodedRuleAutoFix";
import { previewThemeFix } from "../autofix/themeAutoFix";
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

  const [firestore, duplicate, businessRules, theme] = await Promise.all([
    scanFirestore(),
    duplicateCodeScanner.run({} as any),
    findHardcodedBusinessRules(),
    previewThemeFix(),
  ]);

  const firestoreResult: ScannerResult = {
    id: "firestore",
    name: "Firestore Scanner",
    status: firestore.issueCount > 0 ? "warning" : "passed",
    startedAt: new Date(started).toISOString(),
    finishedAt: new Date().toISOString(),
    duration: Date.now() - started,
    scannedItems: firestore.scannedFiles,
    passed: firestore.issueCount === 0 ? firestore.scannedFiles : 0,
    warnings: firestore.issueCount,
    failed: 0,
    issues: firestore.issues.map((issue) => ({
      id: crypto.randomUUID(),
      title: issue.type,
      description: issue.value,
      severity: "medium",
      file: issue.file,
      line: issue.line,
      recommendation: "Review Firestore usage.",
    })),
  };

  const duplicateResult: ScannerResult = {
    id: "duplicate-code",
    name: "Duplicate Code Scanner",
status: duplicate.issues.length > 0
  ? "warning"
  : "passed",
    startedAt: new Date(started).toISOString(),
    finishedAt: new Date().toISOString(),
    duration: Date.now() - started,
    scannedItems: duplicate.scannedItems,
    passed: 0,
    warnings: duplicate.issues.length,
    failed: 0,
    issues: [],
  };

  const businessRulesResult: ScannerResult = {
    id: "business-rules",
    name: "Business Rule Scanner",
    status: businessRules.issueCount > 0 ? "warning" : "passed",
    startedAt: new Date(started).toISOString(),
    finishedAt: new Date().toISOString(),
    duration: Date.now() - started,
    scannedItems: businessRules.scannedFiles,
    passed: businessRules.issueCount === 0 ? businessRules.scannedFiles : 0,
    warnings: businessRules.issueCount,
    failed: 0,
    issues: businessRules.issues.map((issue) => ({
      id: crypto.randomUUID(),
      title: issue.reason,
      description: issue.value,
      severity: "medium",
      file: issue.file,
      line: issue.line,
      recommendation: "Move hardcoded business rules to Firestore Admin Settings.",
    })),
  };

  const themeResult: ScannerResult = {
    id: "theme",
    name: "Theme Scanner",
    status: theme.filesToModify > 0 ? "warning" : "passed",
    startedAt: new Date(started).toISOString(),
    finishedAt: new Date().toISOString(),
    duration: Date.now() - started,
    scannedItems: theme.scannedFiles,
    passed: theme.filesToModify === 0 ? theme.scannedFiles : 0,
    warnings: theme.filesToModify,
    failed: 0,
    issues: [],
  };

  const allScanners = [
    firestoreResult,
    duplicateResult,
    businessRulesResult,
    themeResult,
  ];

  const totalWarnings = allScanners.reduce((acc, s) => acc + s.warnings, 0);
  const totalPassed = allScanners.filter((s) => s.status === "passed").length;

  const finishedAt = new Date().toISOString();
  const duration = Date.now() - started;

  return {
    executionId: options.executionId,
    startedAt: new Date(started).toISOString(),
    finishedAt,
    duration,
    success: true,
    total: allScanners.length,
    passed: totalPassed,
    warnings: totalWarnings,
    failed: 0,
    scanners: allScanners,
  };
}
