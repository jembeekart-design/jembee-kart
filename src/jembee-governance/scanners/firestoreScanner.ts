import fs from "fs";
import path from "path";
import { GovernanceViolation } from "../types/governance.types";
import { shouldExcludeDirectory } from "../utils/scannerExclusions";

export interface FirestoreScanResult {
  collectionsScanned: number;
  violations: GovernanceViolation[];
}

export class FirestoreScanner {
  private readonly COLLECTION_PATTERNS = [
    "users", "wallets", "orders", "notifications",
    "commissionLogs", "withdraws", "watchRewards",
    "watchTransactions", "support_tickets", "kyc_requests",
  ];

  public scanProject(projectRoot: string): FirestoreScanResult {
    const violations: GovernanceViolation[] = [];
    const files = this.getSourceFiles(projectRoot);
    let collectionsScanned = 0;

    files.forEach((filePath) => {
      let content = "";
      try {
        content = fs.readFileSync(filePath, "utf8");
      } catch { return; }

      this.COLLECTION_PATTERNS.forEach((collectionName) => {
        if (content.includes(`"${collectionName}"`) || content.includes(`'${collectionName}'`)) {
          collectionsScanned++;
          this.checkSecurity(filePath, content, collectionName, violations);
          this.checkAdminConfigUsage(filePath, content, collectionName, violations);
          this.checkHardcodedLimits(filePath, content, collectionName, violations);
        }
      });
    });

    return { collectionsScanned, violations };
  }

  private checkSecurity(filePath: string, content: string, collection: string, violations: GovernanceViolation[]) {
    const hasAuth = /auth|currentUser|session|user\.uid/i.test(content);
    
    if (!hasAuth) {
      violations.push({
        id: `FIRESTORE_AUTH_${collection}`,
        title: "Firestore Authentication Missing",
        description: `${collection} collection appears without auth validation.`,
        category: "SECURITY",
        severity: "WARNING",
        filePath,
        recommendation: "Add authentication and ownership validation (auth/currentUser/session/user.uid).",
        startLine: this.findLine(content, collection),
endLine: this.findLine(content, collection),
action: "ADD",
        detectedAt: new Date().toISOString(),
      });
    }
  }

  private checkAdminConfigUsage(filePath: string, content: string, collection: string, violations: GovernanceViolation[]) {
    // Priority Medium: Expanded with featureFlags and themeSettings
    const hasConfig = /adminConfig|settings|config|featureFlags|themeSettings/i.test(content);

    if (!hasConfig) {
      violations.push({
        id: `FIRESTORE_CONFIG_${collection}`,
        title: "Admin Config Not Connected",
        description: `${collection} does not appear connected to central admin config.`,
        category: "ADMIN_CONTROL",
        severity: "WARNING",
        filePath,
        recommendation: "Connect business rules to Firestore admin config (adminConfig, settings, config, featureFlags, or themeSettings).",
        startLine: 1,
endLine: 1,
action: "ADD",
        detectedAt: new Date().toISOString(),
      });
    }
  }

  private checkHardcodedLimits(filePath: string, content: string, collection: string, violations: GovernanceViolation[]) {
    const criticalPatterns = [
      /commission\s*[:=]\s*\d+/gi,
      /cashback\s*[:=]\s*\d+/gi,
      /reward\s*[:=]\s*\d+/gi,
      /rewardAmount\s*[:=]\s*\d+/gi,
      /creatorShare\s*[:=]\s*\d+/gi,
      /creatorRevenue\s*[:=]\s*\d+/gi,
      /sellerCommission\s*[:=]\s*\d+/gi,
      /withdrawalLimit\s*[:=]\s*\d+/gi,
      /minimumWithdrawal\s*[:=]\s*\d+/gi,
      /level1Commission\s*[:=]\s*\d+/gi,
      /level2Commission\s*[:=]\s*\d+/gi,
      /level3Commission\s*[:=]\s*\d+/gi,
      /level4Commission\s*[:=]\s*\d+/gi,
    ];

    criticalPatterns.forEach((pattern) => {
      const match = content.match(pattern);
      if (match) {
        violations.push({
          id: `FIRESTORE_CRITICAL_${collection}`,
          title: "Hardcoded Business Rule Found",
          description: `Business rule "${match[0]}" is hardcoded in ${collection}.`,
          category: "HARDCODED_RULE",
          severity: "CRITICAL",
          filePath,
          actualValue: match[0],
          recommendation: "Move this business rule to Firestore admin configuration.",
          startLine: 1,
endLine: 1,
action: "REPLACE",
          detectedAt: new Date().toISOString(),
        });
      }
    });
  }

  private getSourceFiles(rootDir: string): string[] {
    const files: string[] = [];
    const walk = (dir: string) => {
      const entries = fs.readdirSync(dir);
      for (const entry of entries) {
        const fullPath = path.join(dir, entry);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          if (shouldExcludeDirectory(entry)) continue;
          walk(fullPath);
        } else if (fullPath.endsWith(".ts") || fullPath.endsWith(".tsx")) {
          files.push(fullPath);
        }
      }
    };
    walk(rootDir);
    return files;
  }
}

export const firestoreScanner = new FirestoreScanner();
