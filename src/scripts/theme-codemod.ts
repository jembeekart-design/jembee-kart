import fs from "fs";
import path from "path";

const ROOT = path.join(process.cwd(), "src");
<<<<<<< HEAD

const replacements: Record<string, string> = {
  "bg-[var(--background-color)]": "bg-[var(--background-color)]",
  "bg-[var(--card-color)]": "bg-[var(--card-color)]",

  "text-[var(--text-color)]": "text-[var(--text-color)]",
  "text-[var(--button-text-color)]": "text-[var(--button-text-color)]",

  "bg-[var(--background-color)]": "bg-[var(--background-color)]",
  "bg-[var(--card-color)]": "bg-[var(--card-color)]",
  "bg-[var(--card-color)]": "bg-[var(--card-color)]",

  "text-[var(--muted-text-color)]": "text-[var(--muted-text-color)]",
  "text-[var(--muted-text-color)]": "text-[var(--muted-text-color)]",
  "text-[var(--muted-text-color)]": "text-[var(--muted-text-color)]",
  "text-[var(--text-color)]": "text-[var(--text-color)]",

  "border-[var(--border-color)]": "border-[var(--border-color)]",
  "border-[var(--border-color)]": "border-[var(--border-color)]",

  "bg-[var(--primary-color)]": "bg-[var(--primary-color)]",
  "text-[var(--primary-color)]": "text-[var(--primary-color)]",

  "bg-[var(--success-color)]": "bg-[var(--success-color)]",
  "text-[var(--success-color)]": "text-[var(--success-color)]",

  "bg-[var(--danger-color)]": "bg-[var(--danger-color)]",
  "text-[var(--danger-color)]": "text-[var(--danger-color)]",

  "bg-[var(--warning-color)]": "bg-[var(--warning-color)]",
  "text-[var(--warning-color)]": "text-[var(--warning-color)]",
};
=======
let totalFilesUpdated = 0;
>>>>>>> 644631157890e482723c7786bc11ac85c3a93afb

function walk(dir: string) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stats = fs.statSync(fullPath);

    // 1. Skip Directories and self-directory (scripts)
    if (stats.isDirectory()) {
      if (["node_modules", ".next", "dist", ".git", "coverage"].includes(file)) continue;
      if (fullPath.includes("src/scripts")) continue;
      
      walk(fullPath);
      continue;
    }

    // Sirf valid source files process karein
    if (!/\.(ts|tsx|js|jsx)$/.test(file)) continue;

    let content = fs.readFileSync(fullPath, "utf8");
    const originalContent = content;

    // Mass Replacement Logic
    content = content
      // Gray / Slate / Zinc / Neutral / Stone
      .replace(/\bbg-(gray|slate|zinc|neutral|stone)-\d+\b/g, "bg-[var(--card-color)]")
      .replace(/\btext-(gray|slate|zinc|neutral|stone)-\d+\b/g, "text-[var(--text-color)]")
      .replace(/\bborder-(gray|slate|zinc|neutral|stone)-\d+\b/g, "border-[var(--border-color)]")
      
      // Blue
      .replace(/\bbg-blue-\d+\b/g, "bg-[var(--primary-color)]")
      .replace(/\btext-blue-\d+\b/g, "text-[var(--primary-color)]")
      .replace(/\bborder-blue-\d+\b/g, "border-[var(--primary-color)]")
      
      // Green / Lime / Emerald
      .replace(/\bbg-(green|lime|emerald)-\d+\b/g, "bg-[var(--success-color)]")
      .replace(/\btext-(green|lime|emerald)-\d+\b/g, "text-[var(--success-color)]")
      .replace(/\bborder-(green|lime|emerald)-\d+\b/g, "border-[var(--success-color)]")
      
      // Red
      .replace(/\bbg-red-\d+\b/g, "bg-[var(--danger-color)]")
      .replace(/\btext-red-\d+\b/g, "text-[var(--danger-color)]")
      .replace(/\bborder-red-\d+\b/g, "border-[var(--danger-color)]")
      
      // Yellow / Amber / Orange
      .replace(/\bbg-(yellow|amber|orange)-\d+\b/g, "bg-[var(--warning-color)]")
      .replace(/\btext-(yellow|amber|orange)-\d+\b/g, "text-[var(--warning-color)]")
      .replace(/\bborder-(yellow|amber|orange)-\d+\b/g, "border-[var(--warning-color)]")
      
      // Purple / Indigo / Violet / Pink / Rose / Fuchsia / Cyan / Sky / Teal
      .replace(/\bbg-(purple|indigo|violet|pink|rose|fuchsia|cyan|sky|teal)-\d+\b/g, "bg-[var(--primary-color)]")
      .replace(/\btext-(purple|indigo|violet|pink|rose|fuchsia|cyan|sky|teal)-\d+\b/g, "text-[var(--primary-color)]")
      .replace(/\bborder-(purple|indigo|violet|pink|rose|fuchsia|cyan|sky|teal)-\d+\b/g, "border-[var(--primary-color)]")
      
      // Black / White
      .replace(/\bbg-black\b/g, "bg-[var(--background-color)]")
      .replace(/\bbg-white\b/g, "bg-[var(--card-color)]")
      .replace(/\btext-black\b/g, "text-[var(--text-color)]")
      .replace(/\btext-white\b/g, "text-[var(--button-text-color)]")
      .replace(/\bborder-black\b/g, "border-[var(--border-color)]")
      .replace(/\bborder-white\b/g, "border-[var(--border-color)]")
      
      // Opacity / Ring / Divide / Outline
      .replace(/\bbg-[a-z]+-\d+\/\d+\b/g, "bg-[var(--card-color)]")
      .replace(/\btext-[a-z]+-\d+\/\d+\b/g, "text-[var(--text-color)]")
      .replace(/\bborder-[a-z]+-\d+\/\d+\b/g, "border-[var(--border-color)]")
      .replace(/\bring-[a-z]+-\d+\b/g, "ring-[var(--primary-color)]")
      .replace(/\bdivide-[a-z]+-\d+\b/g, "divide-[var(--border-color)]")
      .replace(/\boutline-[a-z]+-\d+\b/g, "outline-[var(--border-color)]")
      
      // Hover / Focus
      .replace(/\bhover:bg-[a-z-]+-\d+\b/g, "hover:bg-[var(--primary-color)]")
      .replace(/\bhover:text-[a-z-]+-\d+\b/g, "hover:text-[var(--text-color)]")
      .replace(/\bhover:border-[a-z-]+-\d+\b/g, "hover:border-[var(--border-color)]")
      .replace(/\bfocus:bg-[a-z-]+-\d+\b/g, "focus:bg-[var(--primary-color)]")
      .replace(/\bfocus:text-[a-z-]+-\d+\b/g, "focus:text-[var(--text-color)]")
      .replace(/\bfocus:border-[a-z-]+-\d+\b/g, "focus:border-[var(--border-color)]")
      
      // Gradient
      .replace(/\bfrom-[a-z-]+-\d+\b/g, "from-[var(--primary-color)]")
      .replace(/\bvia-[a-z-]+-\d+\b/g, "via-[var(--primary-color)]")
      .replace(/\bto-[a-z-]+-\d+\b/g, "to-[var(--primary-color)]")
      
      // Dark Mode
      .replace(/\bdark:bg-[a-z-]+-\d+\b/g, "dark:bg-[var(--background-color)]")
      .replace(/\bdark:text-[a-z-]+-\d+\b/g, "dark:text-[var(--text-color)]")
      .replace(/\bdark:border-[a-z-]+-\d+\b/g, "dark:border-[var(--border-color)]");

    if (content !== originalContent) {
      fs.writeFileSync(fullPath, content);
      console.log(`✅ Updated: ${fullPath}`);
      totalFilesUpdated++;
    }
  }
}

console.log("🚀 Starting Ultimate Theme Migration...");
try {
  walk(ROOT);
  console.log(`✨ Theme Codemod Completed Successfully!`);
  console.log(`📄 Files Updated: ${totalFilesUpdated}`);
} catch (error) {
  console.error("❌ Error during migration:", error);
}
