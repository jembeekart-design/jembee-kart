import fs from "fs";
import path from "path";
import {
  GovernanceViolation,
  DuplicateCodeReport,
} from "../types/governance.types";
import { shouldExcludeDirectory } from "../utils/scannerExclusions";

export interface DuplicateCodeScanResult {
  filesScanned: number;
  reports: DuplicateCodeReport[];
  violations: GovernanceViolation[];
}

interface FileFingerprint {
  filePath: string;
  normalizedContent: string;
  lineCount: number;
}

export class DuplicateCodeScanner {
  private readonly similarityThreshold = 0.85; // 85%

  public scanProject(projectRoot: string): DuplicateCodeScanResult {
    const files = this.getSourceFiles(projectRoot);
    const fingerprints = files.map((file) => this.createFingerprint(file));

    const reports: DuplicateCodeReport[] = [];
    const violations: GovernanceViolation[] = [];
    const processedPairs = new Set<string>();

    for (let i = 0; i < fingerprints.length; i++) {
      for (let j = i + 1; j < fingerprints.length; j++) {
        const fileA = fingerprints[i];
        const fileB = fingerprints[j];
        const pairKey = `${fileA.filePath}:${fileB.filePath}`;

        if (processedPairs.has(pairKey)) continue;
        processedPairs.add(pairKey);

        const similarity = this.calculateSimilarity(
          fileA.normalizedContent,
          fileB.normalizedContent
        );

        if (similarity < this.similarityThreshold) continue;

        const similarityPercentage = Math.round(similarity * 100);

        reports.push({
          moduleName: this.extractModuleName(fileA.filePath),
          duplicateFiles: [fileA.filePath, fileB.filePath],
          similarityPercentage,
          passed: false,
        });

        violations.push({
          id: "DUPLICATE_CODE_DETECTED",
          title: "Duplicate Code Found",
          description: "Highly similar implementation detected in multiple files.",
          category: "DUPLICATE_CODE",
          severity: similarityPercentage >= 95 ? "CRITICAL" : "WARNING",
          filePath: fileA.filePath,
          moduleName: this.extractModuleName(fileA.filePath),
          expectedValue: "Shared utility / reusable module",
          actualValue: `${similarityPercentage}% similar`,
          recommendation: "Move shared logic into reusable services, hooks, utilities, or core modules.",
          detectedAt: new Date().toISOString(),
        });
      }
    }

    return {
      filesScanned: files.length,
      reports,
      violations,
    };
  }

  private createFingerprint(filePath: string): FileFingerprint {
    let content = "";
    try {
      content = fs.readFileSync(filePath, "utf8");
    } catch {
      content = "";
    }
    return {
      filePath,
      normalizedContent: this.normalizeContent(content),
      lineCount: content.split("\n").length,
    };
  }

  private normalizeContent(content: string): string {
    return content
      .replace(/\/\*[\s\S]*?\*\//g, "") // remove comments
      .replace(/\/\/.*/g, "")
      .replace(/(["'`])(?:(?=(\\?))\2.)*?\1/g, "STRING") // remove strings
      .replace(/\b\d+\b/g, "NUMBER") // remove numbers
      .replace(/\s+/g, " ") // remove whitespace
      .trim()
      .toLowerCase();
  }

  private calculateSimilarity(a: string, b: string): number {
    if (!a.length || !b.length) return 0;
    if (a === b) return 1;

    const shorter = a.length < b.length ? a : b;
    const longer = a.length >= b.length ? a : b;
    let matches = 0;
    const chunks = shorter.split(" ");

    for (const chunk of chunks) {
      if (chunk.length > 3 && longer.includes(chunk)) {
        matches++;
      }
    }
    return matches / Math.max(chunks.length, 1);
  }

  private extractModuleName(filePath: string): string {
    const normalized = filePath.replace(/\\/g, "/");
    const match = normalized.match(/src\/([^/]+)/);
    return match?.[1] ?? "unknown";
  }

  private getSourceFiles(rootDir: string): string[] {
    const files: string[] = [];
    const walk = (dir: string) => {
      const entries = fs.readdirSync(dir);
      for (const entry of entries) {
        const fullPath = path.join(dir, entry);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          // Centralized exclusion
          if (shouldExcludeDirectory(entry)) continue;
          walk(fullPath);
        } else if (/\.(ts|tsx|js|jsx)$/.test(fullPath)) {
          files.push(fullPath);
        }
      }
    };
    walk(rootDir);
    return files;
  }
}

export const duplicateCodeScanner = new DuplicateCodeScanner();
