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
  /**
   * Hardcoded color patterns
   */
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

  /**
   * Allowed theme references (Expanded)
   */
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
      violations.push({
        id: "THEME_FILE_READ_ERROR",
        title: "Theme Scan Failed",
        description: "Unable to read source file.",
        category: "THEME",
        severity: "ERROR",
        filePath,
        detectedAt: new Date().toISOString(),
      });
      return { 
        report: { pageName: path.basename(filePath), adminThemeConnected: false, hardcodedColorsFound: false, hardcodedFontsFound: false, passed: false }, 
        violations 
      };
    }

    const lines = content.split("\n");
    const allowedThemeTokens = [
  "bg-[var(--",
  "text-[var(--",
  "border-[var(--",
];
    let hardcodedColorsFound = false;
    let hardcodedFontsFound = false;

    const adminThemeConnected = this.themeReferences.some((ref) =>
      content.includes(ref)
    );

    lines.forEach((line, index) => {
      for (const pattern of this.colorPatterns) {
        const matches = line.match(pattern);
        if (matches) {
          hardcodedColorsFound = true;
          violations.push({
            id: "THEME_HARDCODED_COLOR",
            title: "Hardcoded Color Found",
            description: "Color is hardcoded instead of using admin-controlled theme settings.",
            category: "THEME",
            severity: "WARNING",
            filePath,
            lineNumber: index + 1,
            actualValue: matches.join(", "),
            expectedValue: "theme.primaryColor / theme.secondaryColor",
            recommendation: "Replace hardcoded color with dynamic theme configuration.",
            detectedAt: new Date().toISOString(),
          });
        }
      }

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
            actualValue: matches.join(", "),
            expectedValue: "Dynamic theme token",
            recommendation: "Use theme variables instead of direct Tailwind color classes.",
            detectedAt: new Date().toISOString(),
          });
        }
      }

      for (const pattern of this.fontPatterns) {
        const matches = line.match(pattern);
        if (matches) {
          hardcodedFontsFound = true;
          violations.push({
            id: "THEME_HARDCODED_FONT",
            title: "Hardcoded Font Found",
            description: "Font is hardcoded instead of being controlled by admin theme.",
            category: "THEME",
            severity: "WARNING",
            filePath,
            lineNumber: index + 1,
            actualValue: matches.join(", "),
            expectedValue: "theme.typography",
            recommendation: "Move typography settings into theme configuration.",
            detectedAt: new Date().toISOString(),
          });
        }
      }
    });

    // if (!adminThemeConnected) {
     // violations.push({
      //  id: "THEME_NOT_CONNECTED",
      //  title: "Admin Theme Not Connected",
       // description: "This page/component does not appear to use the centralized theme system.",
      //  category: "THEME",
      //  severity: "CRITICAL",
      //  filePath,
      //  expectedValue: "Theme Provider / Theme Config",
      //  recommendation: "Connect page to admin-controlled theme configuration.",
       // detectedAt: new Date().toISOString(),
    //  });
  //  }

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

