// src/jembee-governance/scanners/walletScanner.ts

import fs from "fs";
import path from "path";

import {
  GovernanceViolation,
} from "../types/governance.types";

export interface WalletScanResult {
  filesScanned: number;
  violations: GovernanceViolation[];
}

export class WalletScanner {
  /**
   * Required Wallets
   */
  private readonly REQUIRED_WALLETS = [
    "walletBalance",
    "commissionWallet",
    "rewardWallet",
    "cashbackWallet",
    "creatorWallet",
    "loyaltyWallet",
    "withdrawableWallet",
    "pendingWithdrawal",
  ];

  /**
   * Dangerous Patterns
   */
  private readonly DANGEROUS_PATTERNS = [
    "walletBalance += ",
    "wallet.balance += ",
    "walletBalance = walletBalance +",
    "directWalletCredit",
    "manualWalletCredit",
    "forceCredit",
  ];

  public scanProject(
    projectRoot: string
  ): WalletScanResult {
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
       * Required Wallet Structure
       */
      this.REQUIRED_WALLETS.forEach(
        (walletField) => {
          if (
            content.includes("wallet") &&
            !content.includes(walletField)
          ) {
            violations.push({
              id: "WALLET_FIELD_MISSING",

              title:
                "Required Wallet Field Missing",

              description:
                `${walletField} not found.`,

              category: "WALLET",

              severity: "WARNING",

              filePath,

              actualValue:
                walletField,

              recommendation:
                `Implement ${walletField} in wallet architecture.`,

              detectedAt:
                new Date().toISOString(),
            });
          }
        }
      );

      /**
       * RULE 2
       * Dangerous Wallet Updates
       */
      this.DANGEROUS_PATTERNS.forEach(
        (pattern) => {
          if (
            content.includes(pattern)
          ) {
            violations.push({
              id: "WALLET_UNSAFE_UPDATE",

              title:
                "Unsafe Wallet Update Detected",

              description:
                "Wallet appears to be modified directly.",

              category: "WALLET",

              severity: "CRITICAL",

              filePath,

              actualValue:
                pattern,

              recommendation:
                "Use secure transaction-based wallet updates.",

              detectedAt:
                new Date().toISOString(),
            });
          }
        }
      );

      /**
       * RULE 3
       * Negative Wallet Risk
       */
      const negativePattern =
        /wallet.*-\=/gi;

      if (
        negativePattern.test(content)
      ) {
        violations.push({
          id: "WALLET_NEGATIVE_RISK",

          title:
            "Potential Negative Wallet Balance",

          description:
            "Wallet deduction detected without visible validation.",

          category: "WALLET",

          severity: "WARNING",

          filePath,

          recommendation:
            "Validate wallet balance before deduction.",

          detectedAt:
            new Date().toISOString(),
        });
      }

      /**
       * RULE 4
       * Withdrawal Security
       */
      const withdrawalLogic =
        content.includes("withdraw") ||
        content.includes("withdrawal");

      const kycValidation =
        content.includes("kyc") ||
        content.includes("aadhaar") ||
        content.includes("pan");

      if (
        withdrawalLogic &&
        !kycValidation
      ) {
        violations.push({
          id: "WITHDRAWAL_KYC_MISSING",

          title:
            "Withdrawal KYC Validation Missing",

          description:
            "Withdrawal logic detected without KYC validation.",

          category: "WALLET",

          severity: "CRITICAL",

          filePath,

          recommendation:
            "Require KYC before withdrawal approval.",

          detectedAt:
            new Date().toISOString(),
        });
      }

      /**
       * RULE 5
       * Audit Log Validation
       */
      const walletLogic =
        content.includes("wallet");

      const auditLogPresent =
        content.includes("auditLog") ||
        content.includes("transactionLog") ||
        content.includes("walletLog");

      if (
        walletLogic &&
        !auditLogPresent
      ) {
        violations.push({
          id: "WALLET_AUDIT_LOG_MISSING",

          title:
            "Wallet Audit Log Missing",

          description:
            "Wallet operation found without audit trail.",

          category: "WALLET",

          severity: "WARNING",

          filePath,

          recommendation:
            "Log every wallet credit/debit operation.",

          detectedAt:
            new Date().toISOString(),
        });
      }

      /**
       * RULE 6
       * Hardcoded Wallet Rewards
       */
      const hardcodedWalletReward =
        /rewardWallet\s*[:=]\s*\d+/gi.test(
          content
        );

      if (
        hardcodedWalletReward
      ) {
        violations.push({
          id: "WALLET_HARDCODED_REWARD",

          title:
            "Hardcoded Wallet Reward Found",

          description:
            "Reward values should come from admin configuration.",

          category: "WALLET",

          severity: "CRITICAL",

          filePath,

          recommendation:
            "Use rewardConfig from Firestore.",

          detectedAt:
            new Date().toISOString(),
        });
      }

      /**
       * RULE 7
       * Double Credit Risk
       */
      const doubleCreditRisk =
        content.includes("creditWallet") &&
        content.includes("increment");

      if (
        doubleCreditRisk
      ) {
        violations.push({
          id: "WALLET_DOUBLE_CREDIT_RISK",

          title:
            "Possible Double Credit Risk",

          description:
            "Multiple credit mechanisms detected.",

          category: "WALLET",

          severity: "WARNING",

          filePath,

          recommendation:
            "Verify duplicate credit protection.",

          detectedAt:
            new Date().toISOString(),
        });
      }
    } catch (error) {
      violations.push({
        id: "WALLET_SCAN_ERROR",

        title:
          "Wallet Scan Failed",

        description:
          error instanceof Error
            ? error.message
            : "Unknown Error",

        category: "WALLET",

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

export const walletScanner =
  new WalletScanner();
