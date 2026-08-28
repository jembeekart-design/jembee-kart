import fs from "fs";
import path from "path";
import {
  GovernanceViolation,
  SecurityReport,
} from "../types/governance.types";

export interface SecurityScanResult {
  filesScanned: number;
  report: SecurityReport;
  violations: GovernanceViolation[];
}

export class SecurityScanner {
  private readonly patterns = [
    {
      id: "SEC_API_KEY",
      title: "Possible API Key Exposure",
      regex: /(AIza[0-9A-Za-z\-_]{20,})/g,
      severity: "CRITICAL" as const,
    },
    {
      id: "SEC_SECRET",
      title: "Hardcoded Secret Found",
      regex: /(clientSecret|jwtSecret|privateKey)\s*[:=]\s*["'`].+["'`]/g,
      severity: "CRITICAL" as const,
    },
    {
      id: "SEC_PASSWORD",
      title: "Hardcoded Password Found",
      regex: /(adminPassword|rootPassword)\s*[:=]\s*["'`].+["'`]/g,
      severity: "CRITICAL" as const,
    },
    {
      id: "SEC_ADMIN_BYPASS",
      title: "Potential Admin Bypass",
      regex: /(isAdmin\s*=\s*true)|(admin\s*=\s*true)/g,
      severity: "ERROR" as const,
    },
    {
      id: "SEC_DANGEROUS_INNERHTML",
      title: "dangerouslySetInnerHTML Usage",
      regex: /dangerouslySetInnerHTML/g,
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
      const result = this.scanFile(file, projectRoot);
      violations.push(...result);

      if (result.some(v => v.id === "SEC_API_KEY")) apiKeyExposed = true;
      if (result.some(v => v.id === "SEC_SECRET" || v.id === "SEC_PASSWORD")) secretFound = true;
      if (result.some(v => v.id === "SEC_ADMIN_BYPASS")) adminBypassDetected = true;
    }

      const vulnerabilities = violations.length;

const severityScore =
  violations.filter(
    v => v.severity === "CRITICAL"
  ).length;

const lastScanned = new Date().toISOString();

return {
  filesScanned: files.length,

  report: {
    apiKeyExposed,
    secretFound,
    adminBypassDetected,
    firestoreRulesMissing: false,
    totalSecurityIssues: violations.length,

    vulnerabilities,
    severityScore,
    lastScanned,
  },

  violations,
};
  }

public scanFile(filePath: string, projectRoot: string): GovernanceViolation[] {
    const violations: GovernanceViolation[] = [];
    try {
      const content = fs.readFileSync(filePath, "utf8");
      const lines = content.split("\n");

      lines.forEach((line, index) => {
        for (const pattern of this.patterns) {
          if (line.match(pattern.regex)) {
            violations.push({
              id: pattern.id,
              title: pattern.title,
              description: "Potential security issue detected.",
              category: "SECURITY",
              severity: pattern.severity,
              filePath,
              lineNumber: index + 1,
              recommendation: "Review and secure implementation.",
              detectedAt: new Date().toISOString(),
            });
          }
        }
      });

      const looksLikeProtectedPage =
        (
          filePath.includes("/admin/") ||
          filePath.includes("/dashboard/") ||
          filePath.includes("/wallet/") ||
          filePath.includes("/settings/")
        ) &&
        (
          filePath.endsWith("page.tsx") ||
          filePath.endsWith("page.ts") ||
          filePath.endsWith("layout.tsx")
        );

      const hasAuthCheck =
  content.includes("useAuth(") ||
  content.includes("auth.currentUser") ||
  content.includes("currentUser") ||
  content.includes("getServerSession") ||
  content.includes("AdminGuard") ||
  content.includes("RoleGuard") ||
  content.includes("ProtectedRoute") ||
  content.includes("withAuth") ||
  content.includes("middleware") ||
  content.includes("middleware.ts") ||
  content.includes("requireAdmin") ||
  content.includes("requireAuth") ||
  content.includes("checkAdminAccess") ||
  content.includes("adminGuard") ||
  content.includes("adminOnly") ||
  content.includes("verifyAdmin") ||
  content.includes("verifyRole") ||
  content.includes("redirect('/login')") ||
  content.includes("router.push('/login')") ||
  content.includes("redirect('/admin/login')") ||
  content.includes("onAuthStateChanged") ||
  content.includes("signInWithEmailAndPassword") ||
  content.includes("auth.onAuthStateChanged") ||
  content.includes("auth.currentUser?.uid") ||
  content.includes("user?.uid") ||
  content.includes("user.uid") ||
  content.includes("if (!currentUser)") ||
  content.includes("if (!user)") ||
  content.includes("router.replace('/login')") ||
  content.includes('router.push("/login")') ||
  content.includes('redirect("/login")');
      let hasLayoutAuth = false;

try {
  const adminLayout = path.join(
    projectRoot,
    "src",
    "app",
    "admin",
    "layout.tsx"
  );

  if (fs.existsSync(adminLayout)) {
    const layoutContent = fs.readFileSync(adminLayout, "utf8");

    hasLayoutAuth =
      layoutContent.includes("onAuthStateChanged") &&
      layoutContent.includes("router.replace") &&
      (
        layoutContent.includes("user.uid") ||
        layoutContent.includes("role") ||
        layoutContent.includes("admin") ||
        layoutContent.includes("super_admin")
      );
  }
} catch {}
      if (
  looksLikeProtectedPage &&
  !hasAuthCheck &&
  !hasLayoutAuth
) {
        violations.push({
          id: "SEC_AUTH_MISSING",
          title: "Authentication Check Missing",
          description: "Protected page may not be secured.",
          category: "SECURITY",
          severity: "WARNING",
          filePath,
          recommendation: "Add authentication guard.",
          detectedAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      violations.push({
        id: "SEC_SCAN_ERROR",
        title: "Security Scan Error",
        description: error instanceof Error ? error.message : "Unknown Error",
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
    const excludeList = [
      "node_modules",
      ".next",
      ".git",
      ".vercel",
      "backup",
      "src_backup",
      "src_backup_theme",
      "dist",
      "build"
    ];

    const walk = (dir: string) => {
      try {
        const entries = fs.readdirSync(dir);
        for (const entry of entries) {
          const fullPath = path.join(dir, entry);
          const stat = fs.statSync(fullPath);

          if (stat.isDirectory()) {
            if (excludeList.includes(entry)) continue;
            walk(fullPath);
          } else if (/\.(ts|tsx|js|jsx)$/.test(fullPath)) {
            files.push(fullPath);
          }
        }
      } catch (err) {
        // Silently skip inaccessible directories
      }
    };
    walk(rootDir);
    return files;
  }
}

export const securityScanner = new SecurityScanner();

