// src/jembee-governance/scanners/adminControlScanner.ts

import fs from "fs";
import path from "path";

import {
  GovernanceViolation,
} from "../types/governance.types";

export interface AdminControlScanResult {
  filesScanned: number;
  violations: GovernanceViolation[];
}

export class AdminControlScanner {
  /**
   * Business values that MUST come from
   * Firestore Admin Config.
   */
  private readonly BUSINESS_RULE_PATTERNS = [
    "commission",
    "cashback",
    "reward",
    "rewardAmount",
    "rewardValue",
    "creatorShare",
    "creatorRevenue",
    "sellerCommission",
    "withdrawalLimit",
    "minimumWithdrawal",
    "rankRequirement",
    "rankTarget",
    "level1Commission",
    "level2Commission",
    "level3Commission",
    "level4Commission",
    "watchTarget",
    "salesTarget",
    "loyaltyMultiplier",
  ];

  /**
   * Valid admin config references
   */
  private readonly ADMIN_CONFIG_REFERENCES = [
    "adminConfig",
    "settings",
    "config",
    "platformConfig",
    "rewardConfig",
    "commissionConfig",
    "cashbackConfig",
    "rankConfig",
    "featureFlags",
  ];

  public scanProject(
    projectRoot: string
  ): AdminControlScanResult {
    const violations: GovernanceViolation[] = [];

    const files =
      this.getSourceFiles(projectRoot);

    for (const filePath of files) {
      const fileViolations =
        this.scanFile(filePath);

      violations.push(...fileViolations);
    }

    return {
      filesScanned: files.length,
      violations,
    };
  }

  private scanFile(
    filePath: string
  ): GovernanceViolation[] {
    const violations: GovernanceViolation[] = [];

    try {
      const content = fs.readFileSync(
        filePath,
        "utf8"
      );
// Skip admin pages
if (
  filePath.includes("/app/admin/") ||
  filePath.includes("\\app\\admin\\")
) {
  return [];
}
      const lines = content.split("\n");

      lines.forEach((line, index) => {
        const lowerLine =
          line.toLowerCase();

        const containsBusinessRule =
          this.BUSINESS_RULE_PATTERNS.some(
            (rule) =>
              lowerLine.includes(
                rule.toLowerCase()
              )
          );

        if (!containsBusinessRule) {
          return;
        }
        const isUIOrVariable =
  /(wallet|panel|page|history|title|label|button|placeholder|icon|transaction|entry|log|cashbackwallet|rewardwallet|commissionwallet)/i.test(
    line
  );

if (isUIOrVariable) {
  return;
}

        const usesFirestore =
  /getDoc|doc\(|onSnapshot|collection|firebase|firestore/i.test(line);

const usesAdminConfig =
  usesFirestore ||
  this.ADMIN_CONFIG_REFERENCES.some(
    (config) => line.includes(config)
  );
        const hasHardcodedNumber =
  /\b\d+(\.\d+)?\b/.test(line) &&
  /(commission|cashback|reward|withdrawal|rank|target|limit)/i.test(line);
        /**
         * CRITICAL
         * Hardcoded business rule
         */
        if (
          hasHardcodedNumber &&
          !usesAdminConfig
        ) {
          violations.push({
            id: "ADMIN_CONTROL_CRITICAL",
            title:
              "Hardcoded Business Rule Found",
            description:
              "Business rule detected without admin configuration.",
            category: "ADMIN_CONTROL",
            severity: "CRITICAL",
            filePath,
            lineNumber: index + 1,
            actualValue: line.trim(),
            recommendation:
              "Move this value to Firestore Admin Config.",
            detectedAt:
              new Date().toISOString(),
          });
        }

        /**
         * WARNING
         * Business rule present but
         * config reference not visible.
         */
        if (
          !usesAdminConfig &&
          !hasHardcodedNumber
        ) {
          violations.push({
            id: "ADMIN_CONTROL_WARNING",
            title:
              "Business Rule Not Linked To Admin Config",
            description:
              "Business logic detected but no admin configuration reference found.",
            category: "ADMIN_CONTROL",
            severity: "WARNING",
            filePath,
            lineNumber: index + 1,
            actualValue: line.trim(),
            recommendation:
              "Verify value comes from Firestore Config.",
            detectedAt:
              new Date().toISOString(),
          });
        }
      });
    } catch (error) {
      violations.push({
        id: "ADMIN_CONTROL_SCAN_ERROR",
        title:
          "Admin Control Scan Failed",
        description:
          error instanceof Error
            ? error.message
            : "Unknown error",
        category: "ADMIN_CONTROL",
        severity: "ERROR",
        filePath,
        detectedAt:
          new Date().toISOString(),
      });
    }

    return violations;
  }

  private getSourceFiles(
    rootDir: string
  ): string[] {
    const files: string[] = [];

    const walk = (dir: string) => {
      const entries =
        fs.readdirSync(dir);

      for (const entry of entries) {
        const fullPath =
          path.join(dir, entry);

        const stat =
          fs.statSync(fullPath);

        if (stat.isDirectory()) {
          if (
            [
              "node_modules",
              ".next",
              ".git",
              ".vercel",
              "dist",
              "build",
            ].includes(entry)
          ) {
            continue;
          }

          walk(fullPath);
        } else {
          if (
            fullPath.endsWith(".ts") ||
            fullPath.endsWith(".tsx")
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

export const adminControlScanner =
  new AdminControlScanner();
