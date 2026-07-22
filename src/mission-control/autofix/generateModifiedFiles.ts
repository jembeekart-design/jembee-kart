import fs from "fs";
import path from "path";

export interface ModifiedFile {
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
  ".theme-backup",
];

const EXTENSIONS = [
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
];

const RULES = [
  {
    find: /\bbg-blue-(400|500|600|700)\b/g,
    replace: "bg-[var(--primary-color)]",
  },
  {
    find: /\btext-blue-(400|500|600|700)\b/g,
    replace: "text-[var(--primary-color)]",
  },
  {
    find: /\bborder-blue-(400|500|600|700)\b/g,
    replace: "border-[var(--primary-color)]",
  },
  {
    find: /\bbg-red-(400|500|600|700)\b/g,
    replace: "bg-[var(--danger-color)]",
  },
  {
    find: /\btext-red-(400|500|600|700)\b/g,
    replace: "text-[var(--danger-color)]",
  },
  {
    find: /\bbg-green-(400|500|600|700)\b/g,
    replace: "bg-[var(--success-color)]",
  },
  {
    find: /\btext-green-(400|500|600|700)\b/g,
    replace: "text-[var(--success-color)]",
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

export function generateModifiedFiles(): ModifiedFile[] {
  const root = path.join(process.cwd(), "src");

  const files = scan(root);

  const output: ModifiedFile[] = [];

  for (const file of files) {
    const originalContent = fs.readFileSync(file, "utf8");

    let modifiedContent = originalContent;

    let replacements = 0;

    for (const rule of RULES) {
      const matches = modifiedContent.match(rule.find);

      if (!matches) continue;

      replacements += matches.length;

      modifiedContent = modifiedContent.replace(
        rule.find,
        rule.replace
      );
    }

    if (replacements > 0) {
      output.push({
        path: path.relative(process.cwd(), file),
        originalContent,
        modifiedContent,
        replacements,
      });
    }
  }

  return output;
}
