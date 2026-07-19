import fs from "fs";
import path from "path";

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
    regex: /\bcommission\s*[:=]\s*\d+/gi,
    reason: "Hardcoded commission value",
  },
  {
    regex: /\bcashback\s*[:=]\s*\d+/gi,
    reason: "Hardcoded cashback value",
  },
  {
    regex: /\bwithdraw(al)?\w*\s*[:=]\s*\d+/gi,
    reason: "Hardcoded withdrawal value",
  },
  {
    regex: /\b(min|max)\w*\s*[:=]\s*\d+/gi,
    reason: "Hardcoded limit",
  },
];

function scan(dir: string): string[] {
  const files: string[] = [];

  for (const item of fs.readdirSync(dir)) {
    if (SKIP_DIRS.includes(item)) continue;

    const full = path.join(dir, item);
    const stat = fs.statSync(full);

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
      PATTERNS.forEach(pattern => {
        const match = line.match(pattern.regex);

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
