import fs from "fs";
import path from "path";

export type AutoFixResult = {
  file: string;
  fixed: number;
};

const REPLACEMENTS: Record<string, string> = {
  "bg-blue-500": "bg-[var(--primary-color)]",
  "bg-blue-600": "bg-[var(--primary-color)]",
  "bg-indigo-600": "bg-[var(--primary-color)]",

  "text-blue-500": "text-[var(--primary-color)]",
  "text-blue-600": "text-[var(--primary-color)]",

  "border-blue-500": "border-[var(--primary-color)]",

  "bg-red-500": "bg-[var(--danger-color)]",
  "text-red-500": "text-[var(--danger-color)]",

  "bg-green-500": "bg-[var(--success-color)]",
  "text-green-500": "text-[var(--success-color)]",
};

function walk(dir: string): string[] {
  let files: string[] = [];

  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);

    if (fs.statSync(full).isDirectory()) {
      files.push(...walk(full));
    } else {
      if (
        full.endsWith(".tsx") ||
        full.endsWith(".ts") ||
        full.endsWith(".jsx") ||
        full.endsWith(".js")
      ) {
        files.push(full);
      }
    }
  }

  return files;
}

export async function fixHardcodedTheme() {
  const root = path.join(process.cwd(), "src");

  const files = walk(root);

  const report: AutoFixResult[] = [];

  for (const file of files) {
    let code = fs.readFileSync(file, "utf8");

    let count = 0;

    for (const oldValue in REPLACEMENTS) {
      const newValue = REPLACEMENTS[oldValue];

      while (code.includes(oldValue)) {
        code = code.replace(oldValue, newValue);
        count++;
      }
    }

    if (count > 0) {
      fs.writeFileSync(file, code);

      report.push({
        file,
        fixed: count,
      });
    }
  }

  return report;
}
