import fs from "fs";
import path from "path";

const ROOT = path.join(process.cwd(), "src");

const replacements: Record<string, string> = {};


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
