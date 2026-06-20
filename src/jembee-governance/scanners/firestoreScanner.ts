// src/jembee-governance/scanners/firestoreScanner.ts

import fs from "fs";
import path from "path";

import {
  GovernanceViolation,
} from "../types/governance.types";

export interface FirestoreScanResult {
  collectionsScanned: number;
  violations: GovernanceViolation[];
}

export class FirestoreScanner {
  private readonly COLLECTION_PATTERNS = [
    "users",
    "wallets",
    "orders",
    "notifications",
    "commissionLogs",
    "withdraws",
    "watchRewards",
    "watchTransactions",
    "support_tickets",
    "kyc_requests",
  ];

  public scanProject(
    projectRoot: string
  ): FirestoreScanResult {
    const violations: GovernanceViolation[] = [];

    const files =
      this.getSourceFiles(projectRoot);

    let collectionsScanned = 0;

    files.forEach((filePath) => {
      let content = "";

      try {
        content = fs.readFileSync(
          filePath,
          "utf8"
        );
      } catch {
        return;
      }

      this.COLLECTION_PATTERNS.forEach(
        (collectionName) => {
          if (
            content.includes(
              `"${collectionName}"`
            ) ||
            content.includes(
              `'${collectionName}'`
            )
          ) {
            collectionsScanned++;

            this.checkSecurity(
              filePath,
              content,
              collectionName,
              violations
            );

            this.checkAdminConfigUsage(
              filePath,
              content,
              collectionName,
              violations
            );

            this.checkHardcodedLimits(
              filePath,
              content,
              collectionName,
              violations
            );
          }
        }
      );
    });

    return {
      collectionsScanned,
      violations,
    };
  }

  private checkSecurity(
    filePath: string,
    content: string,
    collection: string,
    violations: GovernanceViolation[]
  ) {
    const hasAuthCheck =
      content.includes("auth") ||
      content.includes("currentUser") ||
      content.includes("user.uid") ||
      content.includes("session");

    if (!hasAuthCheck) {
      violations.push({
        id: `FIRESTORE_AUTH_${collection}`,
        title:
          "Firestore Authentication Missing",
        description: `${collection} collection appears without auth validation.`,
        category: "SECURITY",
        severity: "WARNING",
        filePath,
        moduleName: "firestore",
        recommendation:
          "Add authentication and ownership validation.",
        detectedAt:
          new Date().toISOString(),
      });
    }
  }

  private checkAdminConfigUsage(
    filePath: string,
    content: string,
    collection: string,
    violations: GovernanceViolation[]
  ) {
    const adminControlled =
      content.includes("adminConfig") ||
      content.includes("settings") ||
      content.includes("config");

    if (!adminControlled) {
      violations.push({
        id: `FIRESTORE_CONFIG_${collection}`,
        title:
          "Admin Config Not Connected",
        description: `${collection} does not appear connected to central admin configuration.`,
        category: "ADMIN_CONTROL",
        severity: "WARNING",
        filePath,
        moduleName: "firestore",
        recommendation:
          "Connect business rules to Firestore admin config collections.",
        detectedAt:
          new Date().toISOString(),
      });
    }
  }

  private checkHardcodedLimits(
    filePath: string,
    content: string,
    collection: string,
    violations: GovernanceViolation[]
  ) {
    const hardcodedNumbers =
      content.match(/\b\d{2,5}\b/g) || [];

    if (hardcodedNumbers.length > 10) {
      violations.push({
        id: `FIRESTORE_HARDCODED_${collection}`,
        title:
          "Possible Hardcoded Business Logic",
        description:
          "Large amount of fixed numeric values detected.",
        category: "HARDCODED_RULE",
        severity: "CRITICAL",
        filePath,
        moduleName: "firestore",
        recommendation:
          "Move business values to admin-controlled config.",
        detectedAt:
          new Date().toISOString(),
      });
    }
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
              "dist",
              "build",
              ".vercel",
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

export const firestoreScanner =
  new FirestoreScanner();
