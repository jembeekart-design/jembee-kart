// src/jembee-governance/scanners/creatorEconomyScanner.ts

import fs from "fs";
import path from "path";

import {
  GovernanceViolation,
} from "../types/governance.types";

export interface CreatorEconomyScanResult {
  filesScanned: number;
  violations: GovernanceViolation[];
}

export class CreatorEconomyScanner {
  private readonly FORBIDDEN_PATTERNS = [
    "creatorRevenueWithoutAds",
    "creatorRevenueWithoutSales",
    "creatorAutoWithdraw",
    "unlimitedCreatorReward",
    "creatorDirectCashReward",
  ];

  public scanProject(
    projectRoot: string
  ): CreatorEconomyScanResult {
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
       * Forbidden Creator Logic
       */
      this.FORBIDDEN_PATTERNS.forEach(
        (pattern) => {
          if (
            content.includes(pattern)
          ) {
            violations.push({
              id: "CREATOR_FORBIDDEN_LOGIC",

              title:
                "Forbidden Creator Logic Found",

              description:
                "Creator earnings must originate from ads, affiliate sales or ecommerce activity.",

              category: "CREATOR_ECONOMY",

              severity: "CRITICAL",

              filePath,

              actualValue:
                pattern,

              recommendation:
                "Remove unsupported creator payout logic.",

              detectedAt:
                new Date().toISOString(),
            });
          }
        }
      );

      /**
       * RULE 2
       * Hardcoded Creator Share
       */
      const creatorSharePatterns = [
        /creatorShare\s*[:=]\s*\d+/gi,
        /creatorRevenue\s*[:=]\s*\d+/gi,
        /creatorCommission\s*[:=]\s*\d+/gi,
      ];

      creatorSharePatterns.forEach(
        (pattern) => {
          const matches =
            content.match(pattern);

          if (!matches) return;

          violations.push({
            id: "CREATOR_HARDCODED_SHARE",

            title:
              "Hardcoded Creator Revenue Share",

            description:
              "Creator revenue percentages must come from Admin Config.",

            category: "CREATOR_ECONOMY",

            severity: "CRITICAL",

            filePath,

            actualValue:
              matches[0],

            recommendation:
              "Move creator share configuration to Firestore.",

            detectedAt:
              new Date().toISOString(),
          });
        }
      );

      /**
       * RULE 3
       * Creator Wallet Validation
       */
      const creatorLogic =
        content.includes("creator");

      const creatorWalletPresent =
        content.includes(
          "creatorWallet"
        );

      if (
        creatorLogic &&
        !creatorWalletPresent
      ) {
        violations.push({
          id: "CREATOR_WALLET_MISSING",

          title:
            "Creator Wallet Missing",

          description:
            "Creator module detected without creator wallet support.",

          category: "CREATOR_ECONOMY",

          severity: "WARNING",

          filePath,

          recommendation:
            "Implement creatorWallet architecture.",

          detectedAt:
            new Date().toISOString(),
          });
      }

      /**
       * RULE 4
       * Revenue Source Validation
       */
      const revenueSourcePresent =
        content.includes("adRevenue") ||
        content.includes("affiliateRevenue") ||
        content.includes("productSale") ||
        content.includes("creatorSale");

      if (
        creatorLogic &&
        !revenueSourcePresent
      ) {
        violations.push({
          id: "CREATOR_REVENUE_SOURCE_MISSING",

          title:
            "Creator Revenue Source Missing",

          description:
            "Creator earnings detected without a valid revenue source.",

          category: "CREATOR_ECONOMY",

          severity: "CRITICAL",

          filePath,

          recommendation:
            "Tie creator earnings to ad revenue, affiliate revenue or ecommerce sales.",

          detectedAt:
            new Date().toISOString(),
        });
      }

      /**
       * RULE 5
       * Product Tagging Validation
       */
      const productTagging =
        content.includes("productTag") ||
        content.includes("taggedProduct");

      if (
        creatorLogic &&
        !productTagging
      ) {
        violations.push({
          id: "CREATOR_PRODUCT_TAGGING_MISSING",

          title:
            "Product Tagging Missing",

          description:
            "Creator videos should support product tagging for social commerce.",

          category: "CREATOR_ECONOMY",

          severity: "WARNING",

          filePath,

          recommendation:
            "Add product tagging support.",

          detectedAt:
            new Date().toISOString(),
        });
      }

      /**
       * RULE 6
       * Affiliate Tracking Validation
       */
      const affiliateTracking =
        content.includes("affiliateId") ||
        content.includes("trackingId") ||
        content.includes("referralCode");

      if (
        creatorLogic &&
        !affiliateTracking
      ) {
        violations.push({
          id: "CREATOR_AFFILIATE_TRACKING_MISSING",

          title:
            "Affiliate Tracking Missing",

          description:
            "Creator-driven sales need tracking support.",

          category: "CREATOR_ECONOMY",

          severity: "WARNING",

          filePath,

          recommendation:
            "Implement creator affiliate tracking.",

          detectedAt:
            new Date().toISOString(),
        });
      }

      /**
       * RULE 7
       * Self View Protection
       */
      const selfViewProtection =
        content.includes("viewerId") &&
        content.includes("creatorId");

      if (
        creatorLogic &&
        !selfViewProtection
      ) {
        violations.push({
          id: "CREATOR_SELF_VIEW_PROTECTION",

          title:
            "Creator Self View Protection Missing",

          description:
            "Creators may generate earnings from their own views.",

          category: "CREATOR_ECONOMY",

          severity: "WARNING",

          filePath,

          recommendation:
            "Validate viewerId !== creatorId.",

          detectedAt:
            new Date().toISOString(),
        });
      }
    } catch (error) {
      violations.push({
        id: "CREATOR_SCAN_ERROR",

        title:
          "Creator Economy Scan Failed",

        description:
          error instanceof Error
            ? error.message
            : "Unknown Error",

        category: "CREATOR_ECONOMY",

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

export const creatorEconomyScanner =
  new CreatorEconomyScanner();
