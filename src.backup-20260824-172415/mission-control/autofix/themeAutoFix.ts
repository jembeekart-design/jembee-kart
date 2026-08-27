import fs from "fs";
import path from "path";

export interface AutoFixResult {
  file: string;
  replacements: number;
  modified: boolean;
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
      continue;
    }

    if (EXTENSIONS.some(ext => full.endsWith(ext))) {
      files.push(full);
    }
  }

  return files;
}

export async function fixHardcodedTheme() {
  const src = path.join(process.cwd(), "src");

  const report: AutoFixResult[] = [];

  const files = scan(src);

  for (const file of files) {
    let code = fs.readFileSync(file, "utf8");

    let total = 0;

    for (const rule of RULES) {
      const matches = code.match(rule.find);

      if (!matches) continue;

      total += matches.length;

      code = code.replace(rule.find, rule.replace);
    }

    if (total > 0) {
      fs.writeFileSync(file, code);

      report.push({
        file,
        replacements: total,
        modified: true,
      });
    }
  }

  return {
    scannedFiles: files.length,
    modifiedFiles: report.length,
    totalReplacements: report.reduce(
      (sum, item) => sum + item.replacements,
      0
    ),
    report,
  };
}
/* ============================================================
   BACKUP + PREVIEW + ROLLBACK
============================================================ */

const BACKUP_ROOT = path.join(process.cwd(), ".theme-backup");

function ensureDirectory(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function backupFile(file: string) {
  const relative = path.relative(process.cwd(), file);

  const backup = path.join(
    BACKUP_ROOT,
    relative
  );

  ensureDirectory(path.dirname(backup));

  fs.copyFileSync(file, backup);
}

export function rollbackThemeFix() {
  if (!fs.existsSync(BACKUP_ROOT)) {
    return {
      success: false,
      message: "Backup folder not found.",
    };
  }

  const files = scan(BACKUP_ROOT);

  let restored = 0;

  for (const backupFilePath of files) {
    const relative = path.relative(
      BACKUP_ROOT,
      backupFilePath
    );

    const original = path.join(
      process.cwd(),
      relative
    );

    ensureDirectory(path.dirname(original));

    fs.copyFileSync(
      backupFilePath,
      original
    );

    restored++;
  }

  return {
    success: true,
    restoredFiles: restored,
  };
}

export function previewThemeFix() {
  const src = path.join(
    process.cwd(),
    "src"
  );

  const files = scan(src);

  const preview = [];

  for (const file of files) {
    const code = fs.readFileSync(
      file,
      "utf8"
    );

    let replacements = 0;

    for (const rule of RULES) {
      const matches = code.match(rule.find);

      if (matches) {
        replacements += matches.length;
      }
    }

    if (replacements > 0) {
      preview.push({
        file,
        replacements,
      });
    }
  }

  return {
    scannedFiles: files.length,
    filesToModify: preview.length,
    preview,
  };
}
