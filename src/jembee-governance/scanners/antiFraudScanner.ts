// src/jembee-governance/scanners/antiFraudScanner.ts

import fs from "fs";
import path from "path";

import {
  GovernanceViolation,
} from "../types/governance.types";

export interface AntiFraudScanResult {
  filesScanned: number;
  violations: GovernanceViolation[];
}

export class AntiFraudScanner {

  public scanProject(
    projectRoot: string
  ): AntiFraudScanResult {
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
       * Dangerous Fraud Bypass
       */
      this.DANGEROUS_PATTERNS.forEach(
        (pattern) => {
          if (
            content.includes(pattern)
          ) {
            violations.push({
              id: "FRAUD_BYPASS_DETECTED",

              title:
                "Fraud Protection Bypass Found",

              description:
                "Code appears to bypass anti-fraud controls.",

              category: "ANTI_FRAUD",

              severity: "CRITICAL",

              filePath,

              actualValue:
                pattern,

              recommendation:
                "Remove fraud bypass logic immediately.",

              detectedAt:
                new Date().toISOString(),
            });
          }
        }
      );

      /**
       * RULE 2
       * Self Referral Protection
       */
      const referralLogic =
        content.includes("referral") ||
        content.includes("sponsor");

      const selfReferralCheck =
        content.includes("selfReferral") ||
        content.includes(
          "sponsorUid !== userUid"
        ) ||
        content.includes(
          "referrerId !== userId"
        );

      if (
        referralLogic &&
        !selfReferralCheck
      ) {
        violations.push({
          id: "SELF_REFERRAL_PROTECTION_MISSING",

          title:
            "Self Referral Protection Missing",

          description:
            "Referral system detected without self-referral validation.",

          category: "ANTI_FRAUD",

          severity: "CRITICAL",

          filePath,

          recommendation:
            "Block users from referring themselves.",

          detectedAt:
            new Date().toISOString(),
        });
      }

      /**
       * RULE 3
       * Device Tracking
       */
      const accountLogic =
        content.includes("register") ||
        content.includes("signup") ||
        content.includes("createUser");

      const deviceTracking =
        content.includes("deviceId") ||
        content.includes(
          "deviceFingerprint"
        );

      if (
        accountLogic &&
        !deviceTracking
      ) {
        violations.push({
          id: "DEVICE_TRACKING_MISSING",

          title:
            "Device Tracking Missing",

          description:
            "Account creation found without device tracking.",

          category: "ANTI_FRAUD",

          severity: "WARNING",

          filePath,

          recommendation:
            "Track device fingerprints to reduce duplicate accounts.",

          detectedAt:
            new Date().toISOString(),
        });
      }

      /**
       * RULE 4
       * IP Tracking
       */
      const ipTracking =
        content.includes("ipAddress") ||
        content.includes("clientIp");

      if (
        accountLogic &&
        !ipTracking
      ) {
        violations.push({
          id: "IP_TRACKING_MISSING",

          title:
            "IP Tracking Missing",

          description:
            "Account creation found without IP monitoring.",

          category: "ANTI_FRAUD",

          severity: "WARNING",

          filePath,

          recommendation:
            "Store and analyze IP activity.",

          detectedAt:
            new Date().toISOString(),
        });
      }

      /**
       * RULE 5
       * Watch Farming Protection
       */
      const watchLogic =
        content.includes("watchReward") ||
        content.includes("watchVideo");

      const watchProtection =
        content.includes("watchDuration") ||
        content.includes("validView") ||
        content.includes("uniqueView");

      if (
        watchLogic &&
        !watchProtection
      ) {
        violations.push({
          id: "WATCH_FARMING_PROTECTION_MISSING",

          title:
            "Watch Farming Protection Missing",

          description:
            "Watch & Earn detected without view validation.",

          category: "ANTI_FRAUD",

          severity: "CRITICAL",

          filePath,

          recommendation:
            "Validate watch duration and unique views.",

          detectedAt:
            new Date().toISOString(),
        });
      }

      /**
       * RULE 6
       * Withdrawal Fraud Protection
       */
      const withdrawalLogic =
        content.includes("withdraw") ||
        content.includes("withdrawal");

      const withdrawalProtection =
        content.includes("kyc") ||
        content.includes("fraudCheck") ||
        content.includes("riskScore");

      if (
        withdrawalLogic &&
        !withdrawalProtection
      ) {
        violations.push({
          id: "WITHDRAWAL_FRAUD_PROTECTION_MISSING",

          title:
            "Withdrawal Fraud Protection Missing",

          description:
            "Withdrawal flow lacks fraud validation.",

          category: "ANTI_FRAUD",

          severity: "CRITICAL",

          filePath,

          recommendation:
            "Require KYC and risk validation before withdrawal.",

          detectedAt:
            new Date().toISOString(),
        });
      }

      /**
       * RULE 7
       * Creator Self View Protection
       */
      const creatorLogic =
        content.includes("creator") ||
        content.includes("videoUpload");

      const selfViewProtection =
        content.includes("selfView") ||
        content.includes("creatorId") &&
        content.includes("viewerId");

      if (
        creatorLogic &&
        !selfViewProtection
      ) {
        violations.push({
          id: "CREATOR_SELF_VIEW_PROTECTION_MISSING",

          title:
            "Creator Self View Protection Missing",

          description:
            "Creator rewards may be abused through self views.",

          category: "ANTI_FRAUD",

          severity: "WARNING",

          filePath,

          recommendation:
            "Block creators from earning on their own views.",

          detectedAt:
            new Date().toISOString(),
        });
      }
    } catch (error) {
      violations.push({
        id: "ANTI_FRAUD_SCAN_ERROR",

        title:
          "Anti Fraud Scan Failed",

        description:
          error instanceof Error
            ? error.message
            : "Unknown Error",

        category: "ANTI_FRAUD",

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

export const antiFraudScanner =
  new AntiFraudScanner();
