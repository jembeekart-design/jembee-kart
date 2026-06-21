import fs from "fs";
import path from "path";
import {
  GovernanceViolation,
  SecurityReport,
} from "../types/governance.types";
import { shouldExcludeDirectory } from "../utils/scannerExclusions";

export interface SecurityScanResult {
  filesScanned: number;
  report: SecurityReport;
  violations: GovernanceViolation[];
}

export class SecurityScanner {
  /**
   * High Risk Patterns
   */
  private readonly patterns = [
    {
      id: "SEC_API_KEY",
      title: "Possible API Key Exposure",
      regex: /(api[_-]?key\s*[:=]\s*["'`][^"'`]{8,}["'`])|(AIza[0-9A-Za-z\-_]{20,})/gi,
      severity: "CRITICAL" as const,
    },
    {
      id: "SEC_ADMIN_BYPASS",
      title: "Admin Bypass Detected",
      regex: /(role\s*===?\s*["'`]admin["'`])|(isAdmin\s*=\s*true)|(admin\s*=\s*true)/gi,
      severity: "CRITICAL" as const,
    },
    {
      id: "SEC_SECRET",
      title: "Hardcoded Secret Found",
      regex: /(secret|privateKey|clientSecret|jwtSecret|accessToken)\s*[:=]\s*["'`].+["'`]/gi,
      severity: "CRITICAL" as const,
    },
    {
      id: "SEC_PASSWORD",
      title: "Hardcoded Password Found",
      regex: /(password|adminPassword)\s*[:=]\s*["'`].+["'`]/gi,
      severity: "CRITICAL" as const,
    },
    {
      id: "SEC_CONSOLE",
      title: "Sensitive Console Logging",
      regex: /console\.(log|info|debug)\((.*password.*|.*secret.*|.*token.*|.*apikey.*)\)/gi,
      severity: "WARNING" as const,
    },
    {
      id: "SEC_DANGEROUS_INNERHTML",
      title: "dangerouslySetInnerHTML Usage",
      regex: /dangerouslySetInnerHTML/gi,
      severity: "WARNING" as const,
    },
  ];

  public scanProject(projectRoot: string): SecurityScanResult {
    const files = this.getSourceFiles(projectRoot);
    const violations: GovernanceViolation[] = [];

    let apiKeyExposed = false;
    let secretFound = false;
    let adminBypassDetected = false;

    for (const file of files) {
      const result = this.scanFile(file);
      violations.push(...result);

      if (result.some((v) => v.id === "SEC_API_KEY")) apiKeyExposed = true;
      if (result.some((v) => v.id === "SEC_SECRET" || v.id === "SEC_PASSWORD")) secretFound = true;
      if (result.some((v) => v.id === "SEC_ADMIN_BYPASS")) adminBypassDetected = true;
    }

    const report: SecurityReport = {
      apiKeyExposed,
      secretFound,
      adminBypassDetected,
      firestoreRulesMissing: false,
      totalSecurityIssues: violations.length,
    };

    return { filesScanned: files.length, report, violations };
  }

  public scanFile(filePath: string): GovernanceViolation[] {
    const violations: GovernanceViolation[] = [];

    try {
      const content = fs.readFileSync(filePath, "utf8");
      const lines = content.split("\n");

      lines.forEach((line, index) => {
        for (const pattern of this.patterns) {
          const matches = line.match(pattern.regex);
          if (!matches) continue;

          violations.push({
            id: pattern.id,
            title: pattern.title,
            description: "Potential security risk detected during governance scan.",
            category: "SECURITY",
            severity: pattern.severity,
            filePath,
            lineNumber: index + 1,
            actualValue: matches[0],
            recommendation: "Move sensitive values to environment variables and validate access controls.",
            detectedAt: new Date().toISOString(),
          });
        }
      });

      const looksLikeProtectedPage = content.includes("admin") || content.includes("dashboard") || content.includes("wallet");
      const hasAuthCheck = content.includes("currentUser") || content.includes("auth.currentUser") || content.includes("getServerSession") || content.includes("useAuth(");

      if (looksLikeProtectedPage && !hasAuthCheck) {
        violations.push({
          id: "SEC_AUTH_MISSING",
          title: "Authentication Check Missing",
          description: "Sensitive page appears to lack authentication validation.",
          category: "SECURITY",
          severity: "WARNING",
          filePath,
          recommendation: "Protect routes using authentication and role checks.",
          detectedAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      violations.push({
        id: "SEC_SCAN_ERROR",
        title: "Security Scan Error",
        description: error instanceof Error ? error.message : "Unknown error",
        category: "SECURITY",
        severity: "ERROR",
        filePath,
        detectedAt: new Date().toISOString(),
      });
    }

    return violations;
  }

  private getSourceFiles(rootDir: string): string[] {
    const files: string[] = [];

    const walk = (dir: string) => {
      const entries = fs.readdirSync(dir);
      for (const entry of entries) {
        const fullPath = path.join(dir, entry);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          // Using centralized exclusion logic
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

export const securityScanner = new SecurityScanner();
