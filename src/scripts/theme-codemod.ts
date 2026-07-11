import fs from "fs";
import path from "path";

/* ============================================================
   JEMBEEKART THEME CODEMOD v2.0
   PART 1
============================================================ */

/* ============================================================
   MODES
============================================================ */

type Mode =
  | "scan"
  | "preview"
  | "apply"
  | "rollback"
  | "verify";

const MODE: Mode = "scan";

/* ============================================================
   PATHS
============================================================ */

const ROOT = path.join(process.cwd(), "src");

const BACKUP_ROOT = path.join(
  process.cwd(),
  ".theme-backup"
);

const REPORT_DIR = path.join(
  process.cwd(),
  ".theme-report"
);

const SCAN_REPORT_FILE = path.join(
  REPORT_DIR,
  "theme-scan.json"
);

const PREVIEW_REPORT_FILE = path.join(
  REPORT_DIR,
  "theme-preview.json"
);

const VERIFY_REPORT_FILE = path.join(
  REPORT_DIR,
  "theme-verify.json"
);

/* ============================================================
   DIRECTORIES
============================================================ */

const SKIP_DIRS = [

  ".git",

  ".next",

  "node_modules",

  "dist",

  "coverage",

  ".theme-backup",

  ".theme-report"

];

/* ============================================================
   FILE TYPES
============================================================ */

const VALID_EXTENSIONS = [

  ".ts",

  ".tsx",

  ".js",

  ".jsx"

];

/* ============================================================
   COMPONENT PATHS
============================================================ */

const PATHS = {

  header:
    "src/components/navigation/Header.tsx",

  button:
    "src/components/ui/Button.tsx",

  search:
    "src/components/navigation/SearchBar.tsx",

  productCard:
    "src/components/product/ProductCard.tsx",

} as const;

/* ============================================================
   RULE TYPE
============================================================ */

interface Rule {

  readonly name: string;

  readonly include: readonly string[];

  readonly regex: RegExp;

  readonly replacement:
    | string
    | ((match: string) => string);

}

/* ============================================================
   REPORT TYPES
============================================================ */

interface MatchReport {

  file: string;

  rule?: string;

  before?: string;

  after?: string;

  count?: number;

  type?: string;

  found?: string[];

}

interface ThemeReport {

  generatedAt: string;

  mode: Mode;

  filesScanned: number;

  matchesFound: number;

  ruleStats: Record<string, number>;

  matches: MatchReport[];

}

/* ============================================================
   REPORT OBJECT
============================================================ */

const report: ThemeReport = {

  generatedAt:

    new Date().toISOString(),

  mode: MODE,

  filesScanned: 0,

  matchesFound: 0,

  ruleStats: {},

  matches: []

};

/* ============================================================
   PREVIEW CHANGES
============================================================ */

const previewData: MatchReport[] = [];

/* ============================================================
   ALLOWED CSS VARIABLES
============================================================ */

const ALLOWED_VARIABLES = new Set([

  "--primary-color",

  "--secondary-color",

  "--background-color",

  "--surface-color",

  "--card-color",

  "--text-color",

  "--muted-text-color",

  "--border-color",

  "--button-color",

  "--button-text-color",

  "--header-background",

  "--header-text-color",

  "--header-icon-color",

  "--searchbar-color",

  "--searchbar-border-color",

  "--searchbar-placeholder-color",

  "--card-border-color",

  "--success-color",

  "--warning-color",

  "--danger-color",

  "--info-color"

]);

/* ============================================================
   RULE ENGINE
============================================================ */

const RULES: readonly Rule[] = [

  {

    name: "Header",

    include: [

      PATHS.header

    ],

    regex:

      /\bbg-(cyan|sky|teal)-\d+\b/g,

    replacement:

      "bg-[var(--header-background)]"

  },

  {

    name: "Button",

    include: [

      PATHS.button

    ],

    regex:

      /(bg-blue-\d+|hover:bg-blue-\d+)/g,

    replacement:

      "bg-[var(--button-color)]"

  },

  {

    name: "Search",

    include: [

      PATHS.search

    ],

    regex:

      /bg-gray-(50|100|200)/g,

    replacement:

      "bg-[var(--searchbar-color)]"

  },

  {

    name: "Card",

    include: [

      PATHS.productCard

    ],

    regex:

      /border-gray-\d+/g,

    replacement:

      "border-[var(--card-border-color)]"

  },

  {

    name: "Status",

    include: [],

    regex:

      /(bg|text|border|ring|hover:bg|focus:ring)-(green|red|yellow)-\d+/g,

    replacement: (match) => {

      const parts =

        match.split("-");

      const color =

        parts.includes("green")

          ? "success"

          : parts.includes("red")

          ? "danger"

          : "warning";

      const prefix =

        parts

          .slice(0, -2)

          .join("-");

      return `${prefix}-[var(--${color}-color)]`;

    }

  }

] as const;
/* ============================================================
   PART 2
   UTILITIES
============================================================ */

function ensureDirectory(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, {
      recursive: true
    });
  }
}

/* ============================================================
   BACKUP
============================================================ */

function backupFile(fullPath: string) {

  const relative = path.relative(
    ROOT,
    fullPath
  );

  const backupPath = path.join(
    BACKUP_ROOT,
    relative
  );

  ensureDirectory(
    path.dirname(backupPath)
  );

  if (!fs.existsSync(backupPath)) {

    fs.copyFileSync(
      fullPath,
      backupPath
    );

  }

}

/* ============================================================
   ROLLBACK
============================================================ */

function rollback() {

  if (!fs.existsSync(BACKUP_ROOT)) {

    console.log(
      "❌ No backup found."
    );

    return;
  }

  function restore(dir: string) {

    const files = fs.readdirSync(dir);

    for (const file of files) {

      const full = path.join(
        dir,
        file
      );

      const stat =
        fs.statSync(full);

      if (stat.isDirectory()) {

        restore(full);

        continue;

      }

      const target = path.join(
        ROOT,
        path.relative(
          BACKUP_ROOT,
          full
        )
      );

      ensureDirectory(
        path.dirname(target)
      );

      fs.copyFileSync(
        full,
        target
      );

      console.log(
        "✅ Restored:",
        path.relative(
          ROOT,
          target
        )
      );

    }

  }

  restore(BACKUP_ROOT);

  console.log(
    "\nRollback Complete."
  );

}

/* ============================================================
   PATH VALIDATION
============================================================ */

function validatePaths() {

  console.log(
    "\nChecking Component Paths..."
  );

  Object.values(PATHS).forEach(
    (p) => {

      const full =
        path.join(
          process.cwd(),
          p
        );

      if (!fs.existsSync(full)) {

        console.warn(
          "⚠ Missing:",
          p
        );

      } else {

        console.log(
          "✓",
          p
        );

      }

    }
  );

}

/* ============================================================
   SAFE FILE WALKER
============================================================ */

function walk(

  dir: string,

  callback: (
    file: string
  ) => void

) {

  const files =
    fs.readdirSync(dir);

  for (const file of files) {

    const full =
      path.join(dir, file);

    const stat =
      fs.statSync(full);

    if (stat.isDirectory()) {

      if (
        SKIP_DIRS.includes(file)
      ) {
        continue;
      }

      walk(
        full,
        callback
      );

      continue;

    }

    if (
      !VALID_EXTENSIONS.includes(
        path.extname(full)
      )
    ) {
      continue;
    }

    callback(full);

  }

}

/* ============================================================
   SAFE FILE READER
============================================================ */

function readFile(
  fullPath: string
) {

  return fs.readFileSync(
    fullPath,
    "utf8"
  );

}

/* ============================================================
   SAFE FILE WRITER
============================================================ */

function writeFile(
  fullPath: string,
  content: string
) {

  ensureDirectory(
    path.dirname(fullPath)
  );

  fs.writeFileSync(
    fullPath,
    content,
    "utf8"
  );

}

/* ============================================================
   NORMALIZE PATH
============================================================ */

function normalizePath(
  file: string
) {

  return file.replace(
    /\\/g,
    "/"
  );

}

/* ============================================================
   RELATIVE PATH
============================================================ */

function relativePath(
  full: string
) {

  return path.relative(
    ROOT,
    full
  );

}

/* ============================================================
   PART 3
   CORE PROCESSING ENGINE
============================================================ */

function processFile(fullPath: string) {

  const normalized = normalizePath(fullPath);

  if (
    normalized.includes("src/scripts") ||
    normalized.includes(".theme-backup")
  ) {
    return;
  }

  report.filesScanned++;

  const originalContent = readFile(fullPath);

  let modifiedContent = originalContent;

  /* ============================================================
     VERIFY MODE
  ============================================================ */

  if (MODE === "verify") {

    const hexColors =
      originalContent.match(
        /#[0-9A-Fa-f]{3,8}/g
      ) || [];

    const tailwindColors =
      originalContent.match(
        /\b(bg|text|border|ring|from|to|via)-(red|blue|green|yellow|purple|pink|orange|gray|slate|zinc|neutral|stone|emerald|lime|cyan|sky|teal|amber)-\d+\b/g
      ) || [];

    const inlineStyles =
      originalContent.match(
        /(background|backgroundColor|color|border|borderColor)\s*:\s*["'`]?#[0-9A-Fa-f]{3,8}/g
      ) || [];

    const cssVariables =
      originalContent.match(
        /var\(--([^)]+)\)/g
      ) || [];

    cssVariables.forEach(variable => {

      const key = variable.slice(4, -1);

      if (!ALLOWED_VARIABLES.has(key)) {

        report.matches.push({

          file: relativePath(fullPath),

          type: "UNKNOWN_VARIABLE",

          found: [key]

        });

      }

    });

    if (
      hexColors.length ||
      tailwindColors.length ||
      inlineStyles.length
    ) {

      report.matches.push({

        file: relativePath(fullPath),

        type: "VERIFY",

        found: [

          ...hexColors,

          ...tailwindColors,

          ...inlineStyles

        ]

      });

    }

    return;

  }

  /* ============================================================
     SCAN MODE
  ============================================================ */

  if (MODE === "scan") {

    RULES.forEach(rule => {

      if (
        rule.include.length > 0 &&
        !rule.include.some(p =>
          normalized.endsWith(p)
        )
      ) {
        return;
      }

      const matches =
        originalContent.match(rule.regex);

      if (!matches) {
        return;
      }

      report.matches.push({

        file: relativePath(fullPath),

        rule: rule.name,

        count: matches.length

      });

      report.ruleStats[rule.name] =
        (report.ruleStats[rule.name] || 0)
        + matches.length;

    });

    return;

  }

  /* ============================================================
     PREVIEW / APPLY
  ============================================================ */

  RULES.forEach(rule => {

    if (
      rule.include.length > 0 &&
      !rule.include.some(p =>
        normalized.endsWith(p)
      )
    ) {
      return;
    }

    modifiedContent =
      modifiedContent.replace(

        rule.regex,

        (match) => {

          const replacement =
            typeof rule.replacement === "function"
              ? rule.replacement(match)
              : rule.replacement;

          if (match === replacement) {
            return match;
          }

          previewData.push({

            file: relativePath(fullPath),

            rule: rule.name,

            before: match,

            after: replacement

          });

          report.ruleStats[rule.name] =
            (report.ruleStats[rule.name] || 0)
            + 1;

          return replacement;

        }

      );

  });

  /* ============================================================
     APPLY
  ============================================================ */

  if (
    MODE === "apply" &&
    modifiedContent !== originalContent
  ) {

    backupFile(fullPath);

    writeFile(

      fullPath,

      modifiedContent

    );

    console.log(
      "✅ Updated:",
      relativePath(fullPath)
    );

  }

}
/* ============================================================
   PART 4
   EXECUTION ENGINE
============================================================ */

function saveReports() {

  ensureDirectory(REPORT_DIR);

  report.matchesFound = Object
    .values(report.ruleStats)
    .reduce((a, b) => a + b, 0);

  switch (MODE) {

    case "scan":

      writeFile(
        SCAN_REPORT_FILE,
        JSON.stringify(report, null, 2)
      );

      console.log(
        `📄 Scan report saved`
      );

      break;

    case "verify":

      writeFile(
        VERIFY_REPORT_FILE,
        JSON.stringify(report, null, 2)
      );

      console.log(
        `📄 Verify report saved`
      );

      break;

    case "preview":

    case "apply":

      writeFile(
        PREVIEW_REPORT_FILE,
        JSON.stringify(previewData, null, 2)
      );

      console.log(
        `📄 Preview report saved`
      );

      break;

  }

}

/* ============================================================
   SUMMARY
============================================================ */

function printSummary() {

  console.log("\n");

  console.log(
    "======================================"
  );

  console.log(
    " JembeeKart Theme Codemod "
  );

  console.log(
    "======================================"
  );

  console.log(
    "Mode:",
    MODE
  );

  console.log(
    "Generated:",
    report.generatedAt
  );

  console.log(
    "Files Scanned:",
    report.filesScanned
  );

  console.log(
    "Matches Found:",
    report.matchesFound
  );

  console.log(
    "Rules Applied:"
  );

  console.table(
    report.ruleStats
  );

  console.log(
    "======================================"
  );

}

/* ============================================================
   MAIN
============================================================ */

function run() {

  console.log("");

  console.log(
    "🚀 JembeeKart Theme Codemod"
  );

  console.log(
    "Mode:",
    MODE
  );

  console.log("");

  validatePaths();

  if (MODE === "rollback") {

    rollback();

    return;

  }

  walk(
    ROOT,
    processFile
  );

  saveReports();

  printSummary();

}

/* ============================================================
   ENTRY
============================================================ */

run();

/* ============================================================
   PART 5
   ADVANCED AUDIT & HEALTH REPORT
============================================================ */

interface ThemeHealth {

  score: number;

  status: "Excellent" | "Good" | "Warning" | "Critical";

  filesScanned: number;

  totalViolations: number;

  hardcodedHex: number;

  hardcodedTailwind: number;

  inlineStyles: number;

  unknownVariables: number;

}

const health: ThemeHealth = {

  score: 100,

  status: "Excellent",

  filesScanned: 0,

  totalViolations: 0,

  hardcodedHex: 0,

  hardcodedTailwind: 0,

  inlineStyles: 0,

  unknownVariables: 0

};

/* ============================================================
   UPDATE HEALTH
============================================================ */

function updateHealth() {

  health.filesScanned =
    report.filesScanned;

  report.matches.forEach((item: any) => {

    if (!item.type) return;

    switch (item.type) {

      case "VERIFY":

        item.found?.forEach((v: string) => {

          if (v.startsWith("#")) {

            health.hardcodedHex++;

          } else if (
            v.startsWith("bg-") ||
            v.startsWith("text-") ||
            v.startsWith("border-")
          ) {

            health.hardcodedTailwind++;

          } else {

            health.inlineStyles++;

          }

        });

        break;

      case "UNKNOWN_VARIABLE":

        health.unknownVariables++;

        break;

    }

  });

  health.totalViolations =
      health.hardcodedHex
    + health.hardcodedTailwind
    + health.inlineStyles
    + health.unknownVariables;

  health.score =
    Math.max(
      0,
      100 - health.totalViolations
    );

  if (health.score >= 95)
    health.status = "Excellent";

  else if (health.score >= 80)
    health.status = "Good";

  else if (health.score >= 60)
    health.status = "Warning";

  else
    health.status = "Critical";

}

/* ============================================================
   SAVE HEALTH REPORT
============================================================ */

function saveHealthReport() {

  const healthFile =
    path.join(
      REPORT_DIR,
      "theme-health.json"
    );

  writeFile(

    healthFile,

    JSON.stringify(
      health,
      null,
      2
    )

  );

}

/* ============================================================
   PRINT HEALTH
============================================================ */

function printHealth() {

  console.log("");

  console.log(
    "========== THEME HEALTH =========="
  );

  console.table({

    Score: health.score,

    Status: health.status,

    Files: health.filesScanned,

    Violations: health.totalViolations,

    HardcodedHEX:
      health.hardcodedHex,

    Tailwind:
      health.hardcodedTailwind,

    Inline:
      health.inlineStyles,

    UnknownVariables:
      health.unknownVariables

  });

}

/* ============================================================
   CI / GITHUB ACTION SUPPORT
============================================================ */

function exitIfCritical() {

  if (
    MODE === "verify" &&
    health.status === "Critical"
  ) {

    console.error(
      "\n❌ Theme verification failed."
    );

    process.exit(1);

  }

}

/* ============================================================
   PART 6
   THEME GOVERNANCE ENGINE
============================================================ */

interface GovernanceReport {

  generatedAt: string;

  themeCoverage: number;

  duplicateVariables: string[];

  unusedVariables: string[];

  missingVariables: string[];

  firestoreReady: boolean;

  suggestions: string[];

}

const governance: GovernanceReport = {

  generatedAt: new Date().toISOString(),

  themeCoverage: 0,

  duplicateVariables: [],

  unusedVariables: [],

  missingVariables: [],

  firestoreReady: true,

  suggestions: []

};

/* ============================================================
   REQUIRED VARIABLES
============================================================ */

const REQUIRED_THEME_VARIABLES = [

  "--primary-color",

  "--secondary-color",

  "--background-color",

  "--surface-color",

  "--card-color",

  "--text-color",

  "--muted-text-color",

  "--border-color",

  "--button-color",

  "--button-text-color",

  "--header-background",

  "--searchbar-color",

  "--card-border-color",

  "--success-color",

  "--warning-color",

  "--danger-color"

];

/* ============================================================
   VARIABLE AUDIT
============================================================ */

function auditThemeVariables() {

  const usedVariables = new Set<string>();

  report.matches.forEach((item: any) => {

    if (!item.found) return;

    item.found.forEach((value: string) => {

      const match = value.match(/var\((--[^)]+)\)/);

      if (match) {

        usedVariables.add(match[1]);

      }

    });

  });

  REQUIRED_THEME_VARIABLES.forEach(variable => {

    if (!usedVariables.has(variable)) {

      governance.missingVariables.push(variable);

    }

  });

  governance.themeCoverage =

    Math.round(

      ((REQUIRED_THEME_VARIABLES.length -

      governance.missingVariables.length)

      /

      REQUIRED_THEME_VARIABLES.length)

      * 100

    );

}

/* ============================================================
   FIRESTORE READINESS
============================================================ */

function checkFirestoreReadiness() {

  if (

    governance.missingVariables.length > 0

  ) {

    governance.firestoreReady = false;

    governance.suggestions.push(

      "Move missing variables into Firestore Theme Settings."

    );

  }

}

/* ============================================================
   AUTO SUGGESTIONS
============================================================ */

function generateSuggestions() {

  if (health.hardcodedHex > 0) {

    governance.suggestions.push(

      "Replace all HEX colors with CSS Variables."

    );

  }

  if (health.hardcodedTailwind > 0) {

    governance.suggestions.push(

      "Replace Tailwind colors with theme variables."

    );

  }

  if (health.inlineStyles > 0) {

    governance.suggestions.push(

      "Avoid inline colors. Use CSS Variables."

    );

  }

  if (health.unknownVariables > 0) {

    governance.suggestions.push(

      "Remove undefined CSS Variables."

    );

  }

}

/* ============================================================
   SAVE GOVERNANCE REPORT
============================================================ */

function saveGovernanceReport() {

  const file = path.join(

    REPORT_DIR,

    "theme-governance.json"

  );

  writeFile(

    file,

    JSON.stringify(

      governance,

      null,

      2

    )

  );

}

/* ============================================================
   HTML DASHBOARD
============================================================ */

function generateDashboard() {

  const html = `

<!DOCTYPE html>

<html>

<head>

<title>Theme Governance Dashboard</title>

<style>

body{

font-family:Arial;

padding:40px;

background:#fafafa;

}

table{

border-collapse:collapse;

width:100%;

}

td,th{

padding:10px;

border:1px solid #ddd;

}

</style>

</head>

<body>

<h1>Theme Governance Report</h1>

<p><b>Generated:</b> ${governance.generatedAt}</p>

<p><b>Coverage:</b> ${governance.themeCoverage}%</p>

<p><b>Firestore Ready:</b> ${governance.firestoreReady}</p>

<p><b>Health Score:</b> ${health.score}</p>

<p><b>Status:</b> ${health.status}</p>

<h2>Suggestions</h2>

<ul>

${governance.suggestions

.map(

s=>`<li>${s}</li>`

)

.join("")}

</ul>

</body>

</html>

`;

  writeFile(

    path.join(

      REPORT_DIR,

      "theme-dashboard.html"

    ),

    html

  );

}

/* ============================================================
   GOVERNANCE PIPELINE
============================================================ */

function runGovernance() {

  auditThemeVariables();

  checkFirestoreReadiness();

  generateSuggestions();

  saveGovernanceReport();

  generateDashboard();

}

