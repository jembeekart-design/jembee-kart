import fs from "fs";
import path from "path";

const ROOT = path.join(process.cwd(), "src");

const replacements: Record<string, string> = {};
  // Background
  "bg-[var(--background-color)]": "bg-[var(--background-color)]",
  "bg-[var(--card-color)]": "bg-[var(--card-color)]",
  "bg-[var(--background-color)]": "bg-[var(--background-color)]",
  "bg-[var(--card-color)]": "bg-[var(--card-color)]",

  // Text
  "text-[var(--text-color)]": "text-[var(--text-color)]",
  "text-[var(--button-text-color)]": "text-[var(--button-text-color)]",
  "text-[var(--muted-text-color)]": "text-[var(--muted-text-color)]",
  "text-[var(--muted-text-color)]": "text-[var(--muted-text-color)]",
  "text-[var(--muted-text-color)]": "text-[var(--muted-text-color)]",
  "text-[var(--text-color)]": "text-[var(--text-color)]",
  "text-[var(--text-color)]": "text-[var(--text-color)]",
  "text-[var(--text-color)]": "text-[var(--text-color)]",

  // Border
  "border-[var(--border-color)]": "border-[var(--border-color)]",
  "border-[var(--border-color)]": "border-[var(--border-color)]",
  "border-[var(--border-color)]": "border-[var(--border-color)]",
  "border-[var(--border-color)]": "border-[var(--border-color)]",

  // Primary
  "bg-[var(--primary-color)]": "bg-[var(--primary-color)]",
  "bg-[var(--primary-color)]": "bg-[var(--primary-color)]",
  "text-[var(--primary-color)]": "text-[var(--primary-color)]",
  "text-[var(--primary-color)]": "text-[var(--primary-color)]",

  // Success
  "bg-[var(--success-color)]": "bg-[var(--success-color)]",
  "text-[var(--success-color)]": "text-[var(--success-color)]",

  // Danger
  "bg-[var(--danger-color)]": "bg-[var(--danger-color)]",
  "text-[var(--danger-color)]": "text-[var(--danger-color)]",
  "text-[var(--danger-color)]": "text-[var(--danger-color)]",

  // Warning
  "bg-[var(--warning-color)]": "bg-[var(--warning-color)]",
  "text-[var(--warning-color)]": "text-[var(--warning-color)]",
};

function walk(dir: string) {
  for (const file of fs.readdirSync(dir)) {
    const full = path.join(dir, file);

    if (fs.statSync(full).isDirectory()) {
      if (
        file === "node_modules" ||
        file === ".next" ||
        file === "dist"
      ) {
        continue;
      }

      walk(full);
      continue;
    }

    if (!/\.(ts|tsx|js|jsx)$/.test(full)) continue;

    let content = fs.readFileSync(full, "utf8");
    let changed = false;

    for (const [oldValue, newValue] of Object.entries(replacements)) {
      if (content.includes(oldValue)) {
        content = content.split(oldValue).join(newValue);
        changed = true;
      }
    }

    if (changed) {
      fs.writeFileSync(full, content);
      console.log("✔ Updated:", full);
    }
  }
}

walk(ROOT);

console.log("✅ Theme Codemod Completed");
