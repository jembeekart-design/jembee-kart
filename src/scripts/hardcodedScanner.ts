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

    if (!full.endsWith(".ts") && !full.endsWith(".tsx")) {
      continue;
    }

    const content = fs.readFileSync(full, "utf8");
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      for (const pattern of PATTERNS) {
        const matches = [...line.matchAll(pattern.regex)];

        if (matches.length === 0) continue;

        for (const match of matches) {
          results.push({
            id: `${pattern.name}-${results.length + 1}`,
            file: full.replace(process.cwd(), ""),
            issue: pattern.name,

            line: i + 1,
            column: (match.index ?? 0) + 1,

            currentCode: line.trim(),

            matchedValue: match[0],

            fixedCode:
              "Move this configuration to Firestore Admin Panel.",

            suggestion:
              "Replace hardcoded configuration with Firestore Admin Settings.",

            autoFix: true,

            patchId: `${pattern.name}-${results.length + 1}`,
          });
        }
      }
    }
  }
}

scan(ROOT);

fs.writeFileSync(
  path.join(process.cwd(), "hardcoded-report.json"),
  JSON.stringify(results, null, 2),
  "utf8"
);

console.log("=======================================");
console.log(" Hardcoded Scan Complete");
console.log("=======================================");
console.log(`${results.length} issues found.`);
console.log("Report:");
console.log(path.join(process.cwd(), "hardcoded-report.json"));
console.log("=======================================");
