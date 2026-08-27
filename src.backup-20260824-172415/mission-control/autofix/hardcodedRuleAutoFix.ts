import fs from "fs";
import path from "path";
import { VERIFIED_RULES } from "./ruleMappings";

export interface RuleIssue {
  file: string;
  line: number;
  value: string;
  reason: string;
}

const SKIP_DIRS = [
  ".git",
  ".next",
  "node_modules",
  "dist",
  "coverage",
];

const EXTENSIONS = [".ts", ".tsx", ".js", ".jsx"];

/*
  Business rules that should normally come
  from Firestore/Admin Settings instead of
  being hardcoded.
*/
const PATTERNS = [
  {
    regex: /\bcommission\s*[:=]\s*\d+/i,
    reason: "Hardcoded commission value",
  },
  {
    regex: /\bcashback\s*[:=]\s*\d+/i,
    reason: "Hardcoded cashback value",
  },
  {
    regex: /\bwithdraw(al)?\w*\s*[:=]\s*\d+/i,
    reason: "Hardcoded withdrawal value",
  },
  {
    regex: /\b(min|max)\w*\s*[:=]\s*\d+/i,
    reason: "Hardcoded limit",
  },
];

// Startup पर ही global regex तैयार करना (Performance Optimization)
const GLOBAL_PATTERNS = PATTERNS.map(pattern => ({
  ...pattern,
  globalRegex: new RegExp(pattern.regex.source, `${pattern.regex.flags}g`),
}));

function scan(dir: string): string[] {
  const files: string[] = [];

  for (const item of fs.readdirSync(dir)) {
    if (SKIP_DIRS.includes(item)) continue;

    const full = path.join(dir, item);
    const stat = fs.lstatSync(full); // Symlink protection

    if (stat.isSymbolicLink()) {
      continue;
    }

    if (stat.isDirectory()) {
      files.push(...scan(full));
    } else if (EXTENSIONS.some(ext => full.endsWith(ext))) {
      files.push(full);
    }
  }

  return files;
}

export async function findHardcodedBusinessRules() {
  const root = path.join(process.cwd(), "src");

  const files = scan(root);

  const issues: RuleIssue[] = [];

  for (const file of files) {
    const lines = fs.readFileSync(file, "utf8").split("\n");

    lines.forEach((line, index) => {
      GLOBAL_PATTERNS.forEach(pattern => {
        // Reset lastIndex for global regex
        pattern.globalRegex.lastIndex = 0;
        const match = line.match(pattern.globalRegex);

        if (match) {
          issues.push({
            file,
            line: index + 1,
            value: match.join(", "),
            reason: pattern.reason,
          });
        }
      });
    });
  }

  return {
    scannedFiles: files.length,
    issueCount: issues.length,
    issues,
  };
}

export interface RuleFixPreview {
  file: string;
  replacements: number;
  safe: boolean;
  reason: string;
  configPaths: string[];
}

export function previewHardcodedRuleFix() {
  const root = path.join(process.cwd(), "src");

  const files = scan(root);

  const preview: RuleFixPreview[] = [];

  for (const file of files) {
    const original = fs.readFileSync(file, "utf8");

    let replacements = 0;
    for (const pattern of GLOBAL_PATTERNS) {
      pattern.globalRegex.lastIndex = 0;
      const matches = original.match(pattern.globalRegex);
      if (matches) {
        replacements += matches.length;
      }
    }

    if (replacements > 0) {
      const matchedRules = VERIFIED_RULES.filter(rule => {
        rule.pattern.lastIndex = 0; // Prevent lastIndex state issues with 'g' flag
        return rule.pattern.test(original);
      });

      preview.push({
        file,
        replacements,
        safe: matchedRules.length > 0,
        reason:
          matchedRules.length > 0
            ? "Verified mappings found."
            : "Manual Review Required",
        configPaths: matchedRules.map(r => r.configPath),
      });
    }
  }

  return {
    scannedFiles: files.length,
    filesToModify: preview.length,
    preview,
  };
}

export function fixHardcodedBusinessRules() {
  const result = previewHardcodedRuleFix();

  let modifiedFiles = 0;
  const manualReview: string[] = [];

  for (const file of result.preview) {
    if (!file.safe) {
      manualReview.push(file.file);
      continue;
    }

    // Safe auto fix implementation can go here later
    // modifiedFiles++;
  }

  return {
    success: modifiedFiles > 0,
    modifiedFiles,
    manualReviewFiles: manualReview.length,
    manualReview,
    message:
      modifiedFiles > 0
        ? "Safe fixes applied."
        : "No safe auto fixes available. Manual review required.",
  };
}
