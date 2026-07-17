import fs from "fs";
import path from "path";
import crypto from "crypto";

const ROOT = path.join(process.cwd(), "src");

const SKIP_DIRS = new Set([
  ".next",
  ".git",
  "node_modules",
  "dist",
  "coverage",
  ".theme-backup",
]);

type HardcodedIssue = {
  id: string;
  file: string;
  issue: string;
  line: number;
  column: number;
  currentCode: string;
  matchedValue: string;
  fixedCode: string;
  suggestion: string;
  autoFix: boolean;
  patchId: string;
};

const PATTERNS = [
  {
    name: "Hardcoded Percentage",
    regex: /\b\d+\s*%/g,
  },
  {
    name: "Hardcoded Currency",
    regex: /₹\s*\d+/g,
  },
  {
    name: "Hardcoded Boolean",
    regex: /:\s*(true|false)/g,
  },
  {
    name: "Hardcoded Number",
    regex: /=\s*\d+/g,
  },
];

const results: HardcodedIssue[] = [];

const IGNORE_KEYWORDS = [
  "width",
  "height",
  "maxWidth",
  "minWidth",
  "maxHeight",
  "minHeight",
  "padding",
  "margin",
  "gap",
  "spacing",
  "fontSize",
  "lineHeight",
  "borderRadius",
  "opacity",
  "zIndex",
  "duration",
  "delay",
  "timeout",
  "transition",
  "animate",
  "animation",
  "rotate",
  "translate",
  "scale",
  "flex",
  "grid",
  "className",
  "style=",
  "style={{",
  "loading",
  "setLoading",
  "setState",
  "useState",
  "index",
  "currentIndex",
  "page",
  "currentPage",
  "router",
  "pathname",
  "pathname:",
];

function shouldIgnore(line: string): boolean {
  return IGNORE_KEYWORDS.some((keyword) =>
    line.includes(keyword)
  );
}

function createId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

function getFix(issue: string) {
  switch (issue) {
    case "Hardcoded Percentage":
      return {
        fixedCode:
          "const rules = await businessRules.get();\nrules.referral.level1Percent",
        suggestion:
          "Move percentage value to Firestore Business Rules.",
        autoFix: true,
      };

    case "Hardcoded Currency":
      return {
        fixedCode:
          "const rules = await businessRules.get();\nrules.wallet.rewardAmount",
        suggestion:
          "Move currency amount to Firestore Admin Settings.",
        autoFix: true,
      };

    case "Hardcoded Boolean":
      return {
        fixedCode:
          "const flags = await featureFlags.get();",
        suggestion:
          "Replace hardcoded boolean with Firestore Feature Flag.",
        autoFix: true,
      };

    case "Hardcoded Number":
      return {
        fixedCode:
          "const rules = await businessRules.get();",
        suggestion:
          "Move business number to Firestore configuration.",
        autoFix: false,
      };

    default:
      return {
        fixedCode: "",
        suggestion: "",
        autoFix: false,
      };
  }
}
function scan(dir: string) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    // Skip unwanted directories
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) {
        continue;
      }

      scan(fullPath);
      continue;
    }

    // Scan only TypeScript files
    if (
      !fullPath.endsWith(".ts") &&
      !fullPath.endsWith(".tsx")
    ) {
      continue;
    }

    let content = "";

    try {
      content = fs.readFileSync(fullPath, "utf8");
    } catch (error) {
      console.error(`Unable to read ${fullPath}`, error);
      continue;
    }

    const lines = content.split(/\r?\n/);

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const currentLine = lines[lineIndex];

      if (!currentLine.trim()) {
        continue;
      }

      // Ignore comments
      if (
        currentLine.trim().startsWith("//") ||
        currentLine.trim().startsWith("*") ||
        currentLine.trim().startsWith("/*")
      ) {
        continue;
      }

      // Ignore UI/Layout constants
      if (shouldIgnore(currentLine)) {
        continue;
      }

      for (const pattern of PATTERNS) {
        pattern.regex.lastIndex = 0;

        const matches = [...currentLine.matchAll(pattern.regex)];

        if (matches.length === 0) {
          continue;
        }

        for (const match of matches) {
          const fix = getFix(pattern.name);

          const id = createId("HC");

          results.push({
            id,

            file: fullPath.replace(process.cwd(), ""),

            issue: pattern.name,

            line: lineIndex + 1,

            column: (match.index ?? 0) + 1,

            currentCode: currentLine.trim(),

            matchedValue: match[0],

            fixedCode: fix.fixedCode,

            suggestion: fix.suggestion,

            autoFix: fix.autoFix,

            patchId: id,
          });
        }
      }
    }
  }
}
// ---------------------------------------------
// Remove Duplicate Issues
// ---------------------------------------------
const uniqueResults = Array.from(
  new Map(
    results.map((issue) => [
      `${issue.file}:${issue.line}:${issue.column}:${issue.issue}:${issue.matchedValue}`,
      issue,
    ])
  ).values()
);

// ---------------------------------------------
// Sort Results
// ---------------------------------------------
uniqueResults.sort((a, b) => {
  if (a.file !== b.file) {
    return a.file.localeCompare(b.file);
  }

  if (a.line !== b.line) {
    return a.line - b.line;
  }

  return a.column - b.column;
});

// ---------------------------------------------
// Statistics
// ---------------------------------------------
const statistics = {
  totalIssues: uniqueResults.length,

  autoFixable: uniqueResults.filter(
    (x) => x.autoFix
  ).length,

  manualFix: uniqueResults.filter(
    (x) => !x.autoFix
  ).length,

  percentages: uniqueResults.filter(
    (x) => x.issue === "Hardcoded Percentage"
  ).length,

  currencies: uniqueResults.filter(
    (x) => x.issue === "Hardcoded Currency"
  ).length,

  booleans: uniqueResults.filter(
    (x) => x.issue === "Hardcoded Boolean"
  ).length,

  numbers: uniqueResults.filter(
    (x) => x.issue === "Hardcoded Number"
  ).length,

  scannedFiles: new Set(
    uniqueResults.map((x) => x.file)
  ).size,
};

// ---------------------------------------------
// Report
// ---------------------------------------------
const report = {
  generatedAt: new Date().toISOString(),

  scanner: "Jembee Governance Hardcoded Scanner",

  version: "2.0.0",

  summary: statistics,

  issues: uniqueResults,
};

// ---------------------------------------------
// Save JSON
// ---------------------------------------------
const reportPath = path.join(
  process.cwd(),
  "hardcoded-report.json"
);

fs.writeFileSync(
  reportPath,
  JSON.stringify(report, null, 2),
  "utf8"
);

// ---------------------------------------------
// Console Summary
// ---------------------------------------------
console.log("");
console.log("==========================================");
console.log(" Jembee Governance Hardcoded Scanner");
console.log("==========================================");

console.log(
  `Scanned Files     : ${statistics.scannedFiles}`
);

console.log(
  `Total Issues      : ${statistics.totalIssues}`
);

console.log(
  `Auto Fixable      : ${statistics.autoFixable}`
);

console.log(
  `Manual Review     : ${statistics.manualFix}`
);

console.log("------------------------------------------");

console.log(
  `Percentages       : ${statistics.percentages}`
);

console.log(
  `Currencies        : ${statistics.currencies}`
);

console.log(
  `Booleans          : ${statistics.booleans}`
);

console.log(
  `Numbers           : ${statistics.numbers}`
);

console.log("------------------------------------------");

console.log(`Report Saved      : ${reportPath}`);

console.log("==========================================");
console.log("");
