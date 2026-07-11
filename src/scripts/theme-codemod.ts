import fs from "fs";
import path from "path";

const ROOT = path.join(process.cwd(), "src");
const BACKUP_ROOT = path.join(process.cwd(), ".theme-backup");

const VALID_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx"];

interface ScanResult {
  file: string;
  hardcodedColors: number;
  cssVariables: number;
  inlineStyles: number;
  tailwindColors: number;
}

const results: ScanResult[] = [];

function ensureBackupDir() {
  if (!fs.existsSync(BACKUP_ROOT)) {
    fs.mkdirSync(BACKUP_ROOT, { recursive: true });
  }
}

function backupFile(filePath: string) {
  const relative = path.relative(ROOT, filePath);
  const backup = path.join(BACKUP_ROOT, relative);

  fs.mkdirSync(path.dirname(backup), { recursive: true });

  if (!fs.existsSync(backup)) {
    fs.copyFileSync(filePath, backup);
  }
}

function isSourceFile(file: string) {
  return VALID_EXTENSIONS.some(ext => file.endsWith(ext));
}

function scanContent(content: string): ScanResult {

  const hardcodedHex =
    (content.match(/#[0-9a-fA-F]{3,8}/g) || []).length;

  const cssVariables =
    (content.match(/var\(--.*?\)/g) || []).length;

  const inlineStyles =
    (content.match(/style=\{\{/g) || []).length;

  const tailwindColors =
    (content.match(
      /\b(bg|text|border|ring|from|via|to)-(red|blue|green|yellow|purple|pink|orange|gray|slate|zinc|neutral|stone|emerald|lime|cyan|sky|teal|violet|rose|fuchsia|amber)-\d+/g
    ) || []).length;

  return {
    file: "",
    hardcodedColors: hardcodedHex,
    cssVariables,
    inlineStyles,
    tailwindColors,
  };
}

function walk(dir: string) {

  const files = fs.readdirSync(dir);

  for (const file of files) {

    const full = path.join(dir, file);

    const stat = fs.statSync(full);

    if (stat.isDirectory()) {

      if (
        [
          ".git",
          ".next",
          "dist",
          "node_modules",
          "coverage",
          ".theme-backup",
        ].includes(file)
      ) {
        continue;
      }

      walk(full);

      continue;
    }

    if (!isSourceFile(file)) continue;

    const code = fs.readFileSync(full, "utf8");

    backupFile(full);

    const report = scanContent(code);

    report.file = path.relative(ROOT, full);

    results.push(report);
  }
}

function printReport() {

  console.log("\n==========================");
  console.log("THEME SCAN REPORT");
  console.log("==========================\n");

  let hardcoded = 0;
  let variables = 0;
  let inline = 0;
  let tailwind = 0;

  for (const item of results) {

    hardcoded += item.hardcodedColors;
    variables += item.cssVariables;
    inline += item.inlineStyles;
    tailwind += item.tailwindColors;

    console.log(
      `${item.file}
  Tailwind Colors : ${item.tailwindColors}
  CSS Variables   : ${item.cssVariables}
  Hex Colors      : ${item.hardcodedColors}
  Inline Styles   : ${item.inlineStyles}
`
    );
  }

  console.log("========== SUMMARY ==========");

  console.log("Files :", results.length);
  console.log("Tailwind Colors :", tailwind);
  console.log("CSS Variables :", variables);
  console.log("Hex Colors :", hardcoded);
  console.log("Inline Styles :", inline);

  console.log("=============================");
}

console.log("🚀 Theme Recovery Scanner");

ensureBackupDir();

walk(ROOT);

printReport();

console.log("✅ Scan Complete");
/* =====================================================
   PART 2A
   SEMANTIC THEME MAPPER
===================================================== */

interface ThemeRule {
  name: string;
  regex: RegExp;
  replacement: string;
}

const THEME_RULES: ThemeRule[] = [

  /* =========================
     HEADER
  ========================= */

  {
    name: "Header Background",
    regex: /\bbg-(cyan|sky|teal)-\d+\b/g,
    replacement: "bg-[var(--header-background)]",
  },

  {
    name: "Header Text",
    regex: /\btext-(cyan|sky|teal)-\d+\b/g,
    replacement: "text-[var(--header-text-color)]",
  },

  /* =========================
     SEARCH BAR
  ========================= */

  {
    name: "Search Background",
    regex: /\bbg-gray-(50|100|200)\b/g,
    replacement: "bg-[var(--searchbar-color)]",
  },

  {
    name: "Search Border",
    regex: /\bborder-gray-(200|300|400)\b/g,
    replacement: "border-[var(--searchbar-border-color)]",
  },

  /* =========================
     BUTTON
  ========================= */

  {
    name: "Button Background",
    regex: /\bbg-blue-\d+\b/g,
    replacement: "bg-[var(--button-color)]",
  },

  {
    name: "Button Text",
    regex: /\btext-white\b/g,
    replacement: "text-[var(--button-text-color)]",
  },

  {
    name: "Button Hover",
    regex: /\bhover:bg-blue-\d+\b/g,
    replacement: "hover:bg-[var(--button-hover-color)]",
  },

  /* =========================
     CARD
  ========================= */

  {
    name: "Card Background",
    regex: /\bbg-white\b/g,
    replacement: "bg-[var(--card-color)]",
  },

  {
    name: "Card Border",
    regex: /\bborder-(gray|slate|zinc)-\d+\b/g,
    replacement: "border-[var(--card-border-color)]",
  },

  /* =========================
     PAGE
  ========================= */

  {
    name: "Page Background",
    regex: /\bbg-black\b/g,
    replacement: "bg-[var(--background-color)]",
  },

  {
    name: "Page Text",
    regex: /\btext-black\b/g,
    replacement: "text-[var(--text-color)]",
  },

  /* =========================
     SUCCESS
  ========================= */

  {
    name: "Success",
    regex: /\b(bg|text)-(green|emerald|lime)-\d+\b/g,
    replacement: "var(--success-color)",
  },

  /* =========================
     WARNING
  ========================= */

  {
    name: "Warning",
    regex: /\b(bg|text)-(yellow|amber|orange)-\d+\b/g,
    replacement: "var(--warning-color)",
  },

  /* =========================
     DANGER
  ========================= */

  {
    name: "Danger",
    regex: /\b(bg|text)-red-\d+\b/g,
    replacement: "var(--danger-color)",
  },

];
/* =====================================================
   PART 2B
   SAFE REPLACEMENT ENGINE
===================================================== */

interface ReplaceReport {
  file: string;
  rulesApplied: number;
}

const replaceReports: ReplaceReport[] = [];

function applyThemeRules(
  filePath: string,
  content: string
): string {

  let updated = content;
  let applied = 0;

  for (const rule of THEME_RULES) {

    const before = updated;

    updated = updated.replace(
      rule.regex,
      (match) => {

        // Success
        if (
          match.startsWith("bg-green") ||
          match.startsWith("bg-emerald") ||
          match.startsWith("bg-lime")
        ) {
          return "bg-[var(--success-color)]";
        }

        if (
          match.startsWith("text-green") ||
          match.startsWith("text-emerald") ||
          match.startsWith("text-lime")
        ) {
          return "text-[var(--success-color)]";
        }

        // Warning
        if (
          match.startsWith("bg-yellow") ||
          match.startsWith("bg-amber") ||
          match.startsWith("bg-orange")
        ) {
          return "bg-[var(--warning-color)]";
        }

        if (
          match.startsWith("text-yellow") ||
          match.startsWith("text-amber") ||
          match.startsWith("text-orange")
        ) {
          return "text-[var(--warning-color)]";
        }

        // Danger
        if (match.startsWith("bg-red")) {
          return "bg-[var(--danger-color)]";
        }

        if (match.startsWith("text-red")) {
          return "text-[var(--danger-color)]";
        }

        return rule.replacement;

      }
    );

    if (before !== updated) {
      applied++;
    }

  }

  if (applied > 0) {

    replaceReports.push({
      file: path.relative(ROOT, filePath),
      rulesApplied: applied,
    });

  }

  return updated;

}
