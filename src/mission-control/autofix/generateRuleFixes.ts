import fs from "fs";
import path from "path";

export interface RuleFixFile {
  path: string;
  originalContent: string;
  modifiedContent: string;
  replacements: number;
}

const SKIP_DIRS = [
  ".git",
  ".next",
  "node_modules",
  "dist",
  "coverage",
];

const EXTENSIONS = [
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
];

function scan(dir: string): string[] {
  const files: string[] = [];

  for (const item of fs.readdirSync(dir)) {
    if (SKIP_DIRS.includes(item)) continue;

    const full = path.join(dir, item);
    const stat = fs.statSync(full);

    if (stat.isDirectory()) {
      files.push(...scan(full));
      continue;
    }

    if (EXTENSIONS.some((ext) => full.endsWith(ext))) {
      files.push(full);
    }
  }

  return files;
}

const RULES = [
  {
    regex: /\bcommission\b\s*:\s*\d+/gi,
    replace: "commission: config.commission",
  },
  {
    regex: /\bcashback\b\s*:\s*\d+/gi,
    replace: "cashback: config.cashback",
  },
  {
    regex: /\b(minWithdrawal|withdrawal|minWithdraw)\b\s*:\s*\d+/gi,
    replace: "minWithdrawal: config.minWithdrawal",
  },
  {
    regex: /\bmin[A-Za-z]*\b\s*:\s*\d+/gi,
    replace: "minAmount: config.minAmount",
  },
  {
    regex: /\bmax[A-Za-z]*\b\s*:\s*\d+/gi,
    replace: "maxAmount: config.maxAmount",
  },
];

export function generateRuleFixes(): RuleFixFile[] {
  const root = path.join(process.cwd(), "src");

  const files = scan(root);

  const result: RuleFixFile[] = [];

  for (const file of files) {
    const originalContent = fs.readFileSync(file, "utf8");

    let modifiedContent = originalContent;
    let replacements = 0;

    for (const rule of RULES) {
      const matches = modifiedContent.match(rule.regex);

      if (!matches) continue;

      replacements += matches.length;

      modifiedContent = modifiedContent.replace(
        rule.regex,
        rule.replace
      );
    }

    if (replacements > 0) {
      result.push({
        path: path.relative(process.cwd(), file),
        originalContent,
        modifiedContent,
        replacements,
      });
    }
  }

  return result;
}
