// src/jembee-governance/scanners/mlmComplianceScanner.ts

import fs from "fs";
import path from "path";

import {
  GovernanceViolation,
} from "../types/governance.types";

export interface MlmComplianceScanResult {
  filesScanned: number;
  violations: GovernanceViolation[];
}

export class MlmComplianceScanner {
  /**
   * JembeeKart Forbidden MLM Sources
   */
  private readonly FORBIDDEN_INCOME_PATTERNS = [
    "registrationIncome",
    "joiningIncome",
    "packageIncome",
    "packagePurchaseIncome",
    "walletTopupCommission",
    "walletRechargeCommission",
    "rechargeCommission",
    "signupBonus",
    "registrationBonus",
    "joiningBonus",
    "videoViewCommission",
    "watchVideoCommission",
    "watchRewardCommission",
  ];

  /**
   * MLM Must Depend On Delivered Orders
   */
  private readonly DELIVERED_ORDER_KEYWORDS = [
    "delivered",
    "DELIVERED",
    "orderDelivered",
    "isDelivered",
    "OrderStatus.DELIVERED",
  ];

  public scanProject(
    projectRoot: string
  ): MlmComplianceScanResult {
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

      /**
       * RULE 1
       * Forbidden MLM Income Sources
       */
      this.FORBIDDEN_INCOME_PATTERNS.forEach(
        (pattern) => {
          if (
            content.includes(pattern)
          ) {
            violations.push({
              id: "MLM_FORBIDDEN_INCOME",

              title:
                "Forbidden MLM Income Source Found",

              description:
                "JembeeKart does not allow MLM income from registration, joining, recharge, wallet topup or video views.",

              category: "MLM_COMPLIANCE",

              severity: "CRITICAL",

              filePath,

              actualValue:
                pattern,

              recommendation:
                "MLM income must originate only from delivered ecommerce orders.",

              detectedAt:
                new Date().toISOString(),
            });
          }
        }
      );

      /**
       * RULE 2
       * Commission Logic Without Delivered Check
       */
      const containsCommissionLogic =
        content.includes("commission") ||
        content.includes("Commission") ||
        content.includes(
          "distributeLevelCommission"
        );

      const containsDeliveredCheck =
        this.DELIVERED_ORDER_KEYWORDS.some(
          (keyword) =>
            content.includes(keyword)
        );

      if (
        containsCommissionLogic &&
        !containsDeliveredCheck
      ) {
        violations.push({
          id: "MLM_DELIVERY_CHECK_MISSING",

          title:
            "Commission Without Delivered Order Validation",

          description:
            "Commission logic detected but no delivered-order validation found.",

          category: "MLM_COMPLIANCE",

          severity: "CRITICAL",

          filePath,

          recommendation:
            "Distribute MLM commissions only after delivered orders.",

          detectedAt:
            new Date().toISOString(),
        });
      }

      /**
       * RULE 3
       * Hardcoded MLM Percentages
       */
      const hardcodedMlmPatterns = [
        /level1Commission\s*[:=]\s*\d+/gi,
        /level2Commission\s*[:=]\s*\d+/gi,
        /level3Commission\s*[:=]\s*\d+/gi,
        /level4Commission\s*[:=]\s*\d+/gi,
        /commissionPercentage\s*[:=]\s*\d+/gi,
      ];

      hardcodedMlmPatterns.forEach(
        (pattern) => {
          const matches =
            content.match(pattern);

          if (!matches) return;

          violations.push({
            id: "MLM_HARDCODED_PERCENTAGE",

            title:
              "Hardcoded MLM Percentage Found",

            description:
              "MLM percentages must come from Firestore Admin Config.",

            category: "MLM_COMPLIANCE",

            severity: "CRITICAL",

            filePath,

            actualValue:
              matches[0],

            recommendation:
              "Move MLM percentages to commissionConfig collection.",

            detectedAt:
              new Date().toISOString(),
          });
        }
      );

      /**
       * RULE 4
       * Admin Config Validation
       */
      const hasMlmLogic =
        content.includes("commission") ||
        content.includes("referral");

      const usesAdminConfig =
        content.includes("adminConfig") ||
        content.includes(
          "commissionConfig"
        ) ||
        content.includes(
          "settings"
        );

      if (
        hasMlmLogic &&
        !usesAdminConfig
      ) {
        violations.push({
          id: "MLM_ADMIN_CONTROL_MISSING",

          title:
            "MLM Not Connected To Admin Config",

          description:
            "MLM system appears to be operating without central configuration.",

          category: "MLM_COMPLIANCE",

          severity: "WARNING",

          filePath,

          recommendation:
            "Connect MLM engine to Firestore commissionConfig.",

          detectedAt:
            new Date().toISOString(),
        });
      }

      /**
       * RULE 5
       * Ecommerce First Validation
       */
      const containsReferral =
        content.includes("referral");

      const containsOrder =
        content.includes("order");

      if (
        containsReferral &&
        !containsOrder
      ) {
        violations.push({
          id: "MLM_ECOMMERCE_FIRST",

          title:
            "Referral Logic Without Ecommerce Context",

          description:
            "Referral system detected without order/business validation.",

          category: "MLM_COMPLIANCE",

          severity: "WARNING",

          filePath,

          recommendation:
            "Referral rewards must remain secondary to ecommerce activity.",

          detectedAt:
            new Date().toISOString(),
        });
      }
    } catch (error) {
      violations.push({
        id: "MLM_SCAN_ERROR",

        title:
          "MLM Compliance Scan Failed",

        description:
          error instanceof Error
            ? error.message
            : "Unknown Error",

        category: "MLM_COMPLIANCE",

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

export const mlmComplianceScanner =
  new MlmComplianceScanner();
