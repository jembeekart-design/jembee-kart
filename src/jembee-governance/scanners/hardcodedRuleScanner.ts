// src/jembee-governance/scanners/hardcodedRuleScanner.ts

import fs from "fs";
import path from "path";
import { GovernanceViolation } from "../types/governance.types";

export interface HardcodedRuleScanResult {
  filesScanned: number;
  violations: GovernanceViolation[];
}

export class HardcodedRuleScanner {
  /**
   * Business rule keywords that should NEVER be hardcoded
   * in JembeeKart.
   */
  private readonly suspiciousPatterns = [
    "commission",
    "cashback",
    "reward",
    "rewardPoint",
    "rewardPoints",
    "creatorShare",
    "creatorRevenue",
    "withdrawalLimit",
    "withdrawLimit",
    "minimumWithdrawal",
    "level1",
    "level2",
    "level3",
    "level4",
    "rankRequirement",
    "rankTarget",
    "loyaltyMultiplier",
    "adsRevenueShare",
    "sellerCommission",
    "protectionFund",
  ];

  /**
   * Direct hardcoded number assignment detection
   */
  private readonly assignmentRegex =
    /(const|let|var)\s+([a-zA-Z0-9_]+)\s*=\s*(\d+(\.\d+)?)/g;

  public scanProject(projectRoot: string): HardcodedRuleScanResult {
    const violations: GovernanceViolation[] = [];

    const files = this.getAllSourceFiles(projectRoot);

    for (const filePath of files) {
      const fileViolations = this.scanFile(filePath);

      violations.push(...fileViolations);
    }

    return {
      filesScanned: files.length,
      violations,
    };
  }

  public scanFile(filePath: string): GovernanceViolation[] {
    const violations: GovernanceViolation[] = [];

    try {
      const content = fs.readFileSync(filePath, "utf8");

      const lines = content.split("\n");

      lines.forEach((line, index) => {
        const matches = [...line.matchAll(this.assignmentRegex)];

        for (const match of matches) {
          const variableName = match[2];
          const value = match[3];

          const isBusinessRule = this.suspiciousPatterns.some((keyword) =>
            variableName.toLowerCase().includes(keyword.toLowerCase())
          );

          if (!isBusinessRule) continue;

          violations.push({
            id: "HARDCODED_RULE",
            title: "Hardcoded Business Rule Detected",
            description:
              "Business value appears hardcoded instead of being loaded from Firestore Admin Config.",
            category: "HARDCODED_RULE",
            severity: "CRITICAL",
            filePath,
            lineNumber: index + 1,
            expectedValue:
              "Load value from Firestore Admin Config Collection",
            actualValue: `${variableName} = ${value}`,
            recommendation:
              "Move this value to Firestore configuration and load dynamically.",
            detectedAt: new Date().toISOString(),
          });
        }
      });

      /**
       * Additional Direct Pattern Checks
       */

      const forbiddenPatterns = [
        /commission\s*:\s*\d+/gi,
        /cashback\s*:\s*\d+/gi,
        /reward\s*:\s*\d+/gi,
        /creatorShare\s*:\s*\d+/gi,
        /withdrawalLimit\s*:\s*\d+/gi,
        /sellerCommission\s*:\s*\d+/gi,
      ];

      forbiddenPatterns.forEach((pattern) => {
        const found = content.match(pattern);

        if (!found) return;

        violations.push({
          id: "HARDCODED_CONFIG_OBJECT",
          title: "Hardcoded Config Object Found",
          description:
            "Detected business configuration stored directly inside source code.",
          category: "HARDCODED_RULE",
          severity: "CRITICAL",
          filePath,
          expectedValue: "Firestore Admin Config",
          actualValue: found[0],
          recommendation:
            "Move configuration values into Firestore and fetch dynamically.",
          detectedAt: new Date().toISOString(),
        });
      });
    } catch (error) {
      violations.push({
        id: "SCAN_ERROR",
        title: "Hardcoded Rule Scan Failed",
        description:
          error instanceof Error ? error.message : "Unknown scan error",
        category: "HARDCODED_RULE",
        severity: "ERROR",
        filePath,
        detectedAt: new Date().toISOString(),
      });
    }

    return violations;
  }

  private getAllSourceFiles(rootDir: string): string[] {
    const files: string[] = [];

    const walk = (currentPath: string) => {
      const entries = fs.readdirSync(currentPath);

      for (const entry of entries) {
        const fullPath = path.join(currentPath, entry);

        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          if (
            entry === "node_modules" ||
            entry === ".next" ||
            entry === "dist" ||
            entry === "build" ||
            entry === ".git"
          ) {
            continue;
          }

          walk(fullPath);
        } else {
          if (
            fullPath.endsWith(".ts") ||
            fullPath.endsWith(".tsx") ||
            fullPath.endsWith(".js") ||
            fullPath.endsWith(".jsx")
          ) {
            files.push(fullPath);
          }
        }
      }
    };

    walk(rootDir);

    return files;
  }
}

export const hardcodedRuleScanner = new HardcodedRuleScanner();
