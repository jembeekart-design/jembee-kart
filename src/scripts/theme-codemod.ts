import fs from "fs";
import path from "path";

const ROOT = path.join(process.cwd(), "src");

const replacements: Record<string, string> = {
  "bg-[var(--primary-color)]": "bg-[var(--primary-color)]",
  "bg-[var(--primary-color)]": "bg-[var(--primary-color)]",
  "bg-[var(--secondary-color)]": "bg-[var(--secondary-color)]",

  "bg-[var(--success-color)]": "bg-[var(--success-color)]",
  "bg-[var(--danger-color)]": "bg-[var(--danger-color)]",
  "bg-[var(--warning-color)]": "bg-[var(--warning-color)]",

  "text-[var(--button-text-color)]": "text-[var(--button-text-color)]",
  "text-[var(--text-color)]": "text-[var(--text-color)]",
  "text-[var(--muted-text-color)]": "text-[var(--muted-text-color)]",
  "text-[var(--muted-text-color)]": "text-[var(--muted-text-color)]",
  "text-[var(--text-color)]": "text-[var(--text-color)]",

  "bg-[var(--card-color)]": "bg-[var(--card-color)]",
  "bg-[var(--background-color)]": "bg-[var(--background-color)]",

  "border-[var(--border-color)]": "border-[var(--border-color)]",
  "border-[var(--border-color)]": "border-[var(--border-color)]",
};

function walk(dir: string) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const full = path.join(dir, file);

    if (fs.statSync(full).isDirectory()) {
      if (
        file === "node_modules" ||
        file === ".next" ||
        file === "dist"
      )
        continue;

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
