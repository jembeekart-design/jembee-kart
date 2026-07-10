import fs from "fs";
import path from "path";
import {
  GovernanceViolation,
  ThemeReport,
} from "../types/governance.types";
import { shouldExcludeDirectory } from "../utils/scannerExclusions";

export interface ThemeScanResult {
  filesScanned: number;
  reports: ThemeReport[];
  violations: GovernanceViolation[];
}

export class ThemeScanner {
  private readonly colorPatterns: RegExp[] = [
    /#[0-9A-Fa-f]{3,8}/g,
    /rgb\(/gi,
    /rgba\(/gi,
    /hsl\(/gi,
    /hsla\(/gi,
  ];

  private readonly tailwindColorPatterns: RegExp[] = [
    /\b(bg|text|border|ring|divide|outline|from|to|via)-(red|blue|green|yellow|purple|pink|orange|indigo|gray|slate|zinc|neutral|stone|emerald|lime|cyan|sky|teal|violet|rose|fuchsia|amber|black|white)(-\d+(\/\d+)?)?\b/gi,
  ];

  private readonly fontPatterns: RegExp[] = [
    /font-family\s*:/gi,
    /fontFamily\s*:/gi,
  ];

  private readonly themeReferences = [
    "theme.",
    "currentTheme.",
    "themeConfig.",
    "useTheme(",
    "themeSettings",
    "themeStore",
    "ThemeProvider",
    "getThemeConfig",
  ];

  public scanProject(projectRoot: string): ThemeScanResult {
    const files = this.getAllFiles(projectRoot);
    const reports: ThemeReport[] = [];
    const violations: GovernanceViolation[] = [];

    for (const file of files) {
      const result = this.scanFile(file);
      reports.push(result.report);
      violations.push(...result.violations);
    }

    return {
      filesScanned: files.length,
      reports,
      violations,
    };
  }

  public scanFile(filePath: string): {
    report: ThemeReport;
    violations: GovernanceViolation[];
  } {
    const violations: GovernanceViolation[] = [];
    let content = "";

    try {
      content = fs.readFileSync(filePath, "utf8");
    } catch {
      return { 
        report: { pageName: path.basename(filePath), adminThemeConnected: false, hardcodedColorsFound: false, hardcodedFontsFound: false, passed: false }, 
        violations: [{
          id: "THEME_FILE_READ_ERROR",
          title: "Theme Scan Failed",
          description: "Unable to read source file.",
          category: "THEME",
          severity: "ERROR",
          filePath,
          detectedAt: new Date().toISOString(),
        }]
      };
    }

    const lines = content.split("\n");
    // 1. Updated Allowed Tokens
    const allowedThemeTokens = [
      "[var(--",
      "var(--",
      "theme.",
      "currentTheme.",
      "themeConfig.",
      "themeSettings",
      "useTheme(",
      "ThemeProvider",
    ];

    let hardcodedColorsFound = false;
    let hardcodedFontsFound = false;

    const adminThemeConnected = this.themeReferences.some((ref) => content.includes(ref));

    lines.forEach((line, index) => {
      // Check for hardcoded CSS colors
      for (const pattern of this.colorPatterns) {
        const matches = line.match(pattern);
        if (matches) {
          hardcodedColorsFound = true;
          violations.push({
            id: "THEME_HARDCODED_COLOR",
            title: "Hardcoded Color Found",
            description: "Color is hardcoded instead of using theme settings.",
            category: "THEME",
            severity: "WARNING",
            filePath,
            lineNumber: index + 1,
            actualValue: matches.join(", "),
            expectedValue: "CSS Variable or Theme Token",
            recommendation: "Replace with dynamic theme variable.",
            detectedAt: new Date().toISOString(),
          });
        }
      }

      // 2. Updated Tailwind Logic with continue and joined matches
      for (const pattern of this.tailwindColorPatterns) {
        if (allowedThemeTokens.some(token => line.includes(token))) {
          continue; 
        }

        const matches = line.match(pattern);
        if (matches) {
          hardcodedColorsFound = true;
          violations.push({
            id: "THEME_TAILWIND_COLOR",
            title: "Hardcoded Tailwind Color Found",
            description: "Tailwind color bypasses admin-controlled theme engine.",
            category: "THEME",
            severity: "WARNING",
            filePath,
            lineNumber: index + 1,
            actualValue: matches.join(", "), // 3. Updated to join all matches
            expectedValue: "Dynamic theme token",
            recommendation: "Use theme variables ([var(--...)]).",
            detectedAt: new Date().toISOString(),
          });
        }
      }

      // Font checks
      for (const pattern of this.fontPatterns) {
        const matches = line.match(pattern);
        if (matches) {
          hardcodedFontsFound = true;
          violations.push({
            id: "THEME_HARDCODED_FONT",
            title: "Hardcoded Font Found",
            description: "Font is hardcoded.",
            category: "THEME",
            severity: "WARNING",
            filePath,
            lineNumber: index + 1,
            actualValue: matches.join(", "),
            expectedValue: "theme.typography",
            recommendation: "Move typography to theme config.",
            detectedAt: new Date().toISOString(),
          });
        }
      }
    });

    return {
      report: {
        pageName: this.extractPageName(filePath),
        adminThemeConnected,
        hardcodedColorsFound,
        hardcodedFontsFound,
        passed: adminThemeConnected && !hardcodedColorsFound && !hardcodedFontsFound,
      },
      violations,
    };
  }

  private extractPageName(filePath: string): string {
    const normalized = filePath.replace(/\\/g, "/");
    const match = normalized.match(/src\/app\/(.+)/);
    return match ? match[1] : path.basename(filePath);
  }

  private getAllFiles(rootDir: string): string[] {
    const files: string[] = [];
    const walk = (dir: string) => {
      const entries = fs.readdirSync(dir);
      for (const entry of entries) {
        const fullPath = path.join(dir, entry);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
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

export const themeScanner = new ThemeScanner();
