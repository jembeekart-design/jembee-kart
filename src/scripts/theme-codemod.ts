import fs from "fs";
import path from "path";

const ROOT = path.join(process.cwd(), "src");

const replacements: Record<string, string> = {
  "bg-white": "bg-[var(--background-color)]",
  "bg-black": "bg-[var(--card-color)]",

  "text-black": "text-[var(--text-color)]",
  "text-white": "text-[var(--button-text-color)]",

  "bg-gray-50": "bg-[var(--background-color)]",
  "bg-gray-100": "bg-[var(--card-color)]",
  "bg-gray-200": "bg-[var(--card-color)]",

  "text-gray-400": "text-[var(--muted-text-color)]",
  "text-gray-500": "text-[var(--muted-text-color)]",
  "text-gray-600": "text-[var(--muted-text-color)]",
  "text-gray-700": "text-[var(--text-color)]",

  "border-gray-200": "border-[var(--border-color)]",
  "border-gray-300": "border-[var(--border-color)]",

  "bg-blue-500": "bg-[var(--primary-color)]",
  "text-blue-500": "text-[var(--primary-color)]",

  "bg-green-500": "bg-[var(--success-color)]",
  "text-green-500": "text-[var(--success-color)]",

  "bg-red-500": "bg-[var(--danger-color)]",
  "text-red-500": "text-[var(--danger-color)]",

  "bg-yellow-500": "bg-[var(--warning-color)]",
  "text-yellow-500": "text-[var(--warning-color)]",
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
