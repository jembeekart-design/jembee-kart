import fs from "fs";
import path from "path";

const ROOT = path.join(process.cwd(), "src");

const PATTERNS = [
  {
    name: "Hardcoded Percentage",
    regex: /\b\d+\s*%/g,
  },
  {
    name: "Hardcoded Currency",
    regex: /₹\s*\d+/g,
  },
  {
    name: "Hardcoded Boolean",
    regex: /:\s*(true|false)/g,
  },
  {
    name: "Hardcoded Number",
    regex: /=\s*\d+/g,
  },
];

const results: any[] = [];

function scan(dir: string) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const full = path.join(dir, file);

    if (fs.statSync(full).isDirectory()) {
      scan(full);
      continue;
    }

    if (
      !full.endsWith(".ts") &&
      !full.endsWith(".tsx")
    ) {
      continue;
    }

    const content = fs.readFileSync(full, "utf8");

    PATTERNS.forEach((pattern) => {
      const matches = content.match(pattern.regex);

      if (matches) {
        results.push({
          file: full.replace(process.cwd(), ""),
          issue: pattern.name,
          matches,
        });
      }
    });
  }
}

scan(ROOT);

fs.writeFileSync(
  "hardcoded-report.json",
  JSON.stringify(results, null, 2)
);

console.log("Hardcoded Scan Complete");
console.log(results.length + " issues found.");
