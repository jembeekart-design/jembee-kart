import fs from "fs";
import path from "path";

const ROOT = path.join(process.cwd(), "src");

const replacements: Record<string, string> = {
  "bg-blue-500": "bg-[var(--primary-color)]",
  "bg-indigo-500": "bg-[var(--primary-color)]",
  "bg-violet-500": "bg-[var(--secondary-color)]",

  "bg-green-500": "bg-[var(--success-color)]",
  "bg-red-500": "bg-[var(--danger-color)]",
  "bg-yellow-500": "bg-[var(--warning-color)]",

  "text-white": "text-[var(--button-text-color)]",
  "text-black": "text-[var(--text-color)]",
  "text-gray-500": "text-[var(--muted-text-color)]",
  "text-gray-600": "text-[var(--muted-text-color)]",
  "text-gray-700": "text-[var(--text-color)]",

  "bg-white": "bg-[var(--card-color)]",
  "bg-gray-100": "bg-[var(--background-color)]",

  "border-gray-200": "border-[var(--border-color)]",
  "border-gray-300": "border-[var(--border-color)]",
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
