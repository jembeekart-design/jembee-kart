import fs from "fs";
import path from "path";
import crypto from "crypto";

import {
  EnterpriseScanner,
  ScannerContext,
  ScannerIssue,
  ScannerResult,
} from "./types";

const ROOT = path.join(process.cwd(), "src");

const SKIP_DIRS = [
  ".git",
  ".next",
  "node_modules",
  "dist",
  "coverage",
  ".turbo",
  ".vercel",
];

const IGNORE_FILES = [
  ".d.ts",
  ".test.",
  ".spec.",
  ".stories.",
];

const EXTENSIONS = [
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
];

interface CodeBlock {
  id: string;
  file: string;
  name: string;
  startLine: number;
  endLine: number;
  code: string;
  hash: string;
}

function shouldSkip(file: string): boolean {
  return IGNORE_FILES.some(v => file.includes(v));
}

function normalize(code: string): string {
  return code
    .replace(/\/\/.*$/gm, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\r/g, "")
    .replace(/\n+/g, "\n")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function hash(content: string): string {
  return crypto
    .createHash("sha256")
    .update(content)
    .digest("hex");
}

function scanDirectory(dir: string): string[] {
  const files: string[] = [];

  for (const item of fs.readdirSync(dir)) {

    if (SKIP_DIRS.includes(item)) continue;

    const full = path.join(dir, item);

    const stat = fs.statSync(full);

    if (stat.isDirectory()) {
      files.push(...scanDirectory(full));
      continue;
    }

    if (
      EXTENSIONS.some(ext => full.endsWith(ext)) &&
      !shouldSkip(full)
    ) {
      files.push(full);
    }
  }

  return files;
}

function relative(file: string) {
  return file.replace(ROOT, "src");
}
function extractBlocks(file: string): CodeBlock[] {
  const source = fs.readFileSync(file, "utf8");
  const lines = source.split("\n");

  const blocks: CodeBlock[] = [];

  const patterns = [
    /function\s+([A-Za-z0-9_]+)\s*\(/,
    /const\s+([A-Za-z0-9_]+)\s*=\s*\(/,
    /const\s+([A-Za-z0-9_]+)\s*=\s*async\s*\(/,
    /const\s+([A-Za-z0-9_]+)\s*=\s*\(.*\)\s*=>/,
    /export\s+function\s+([A-Za-z0-9_]+)\s*\(/,
    /export\s+default\s+function\s+([A-Za-z0-9_]+)\s*\(/,
  ];

  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    let match: RegExpMatchArray | null = null;

    for (const pattern of patterns) {
      match = line.match(pattern);
      if (match) break;
    }

    if (!match) {
      i++;
      continue;
    }

    const name = match[1];

    let brace = 0;
    let started = false;

    const start = i;
    const buffer: string[] = [];

    while (i < lines.length) {
      const current = lines[i];

      buffer.push(current);

      for (const ch of current) {
        if (ch === "{") {
          brace++;
          started = true;
        }

        if (ch === "}") {
          brace--;
        }
      }

      if (started && brace === 0) {
        break;
      }

      i++;
    }

    const code = normalize(buffer.join("\n"));

    if (code.length > 80) {
      blocks.push({
        id: hash(relative(file) + name + start),
        file: relative(file),
        name,
        startLine: start + 1,
        endLine: i + 1,
        code,
        hash: hash(code),
      });
    }

    i++;
  }

  return blocks;
}

interface DuplicateGroup {
  hash: string;
  blocks: CodeBlock[];
}

function buildDuplicateGroups(
  blocks: CodeBlock[]
): DuplicateGroup[] {

  const map = new Map<string, CodeBlock[]>();

  for (const block of blocks) {

    if (!map.has(block.hash)) {
      map.set(block.hash, []);
    }

    map.get(block.hash)!.push(block);

  }

  const groups: DuplicateGroup[] = [];

  for (const [hashValue, items] of map.entries()) {

    if (items.length < 2) continue;

    groups.push({
      hash: hashValue,
      blocks: items,
    });

  }

  return groups;
}

function collectBlocks(files: string[]) {

  const blocks: CodeBlock[] = [];

  for (const file of files) {

    try {
      blocks.push(...extractBlocks(file));
    } catch (err) {
      console.error(
        "Duplicate Scanner:",
        file,
        err
      );
    }

  }

  return blocks;
}
function getSeverity(
  count: number
): ScannerIssue["severity"] {

  if (count >= 20) return "critical";
  if (count >= 10) return "high";
  if (count >= 5) return "medium";
  return "low";

}

function calculateQualityScore(
  duplicateGroups: number,
  scannedFiles: number
) {

  if (scannedFiles === 0) return 100;

  const penalty =
    (duplicateGroups / scannedFiles) * 100;

  return Math.max(
    0,
    Math.round(100 - penalty)
  );

}

function buildIssues(
  groups: DuplicateGroup[]
): ScannerIssue[] {

  const issues: ScannerIssue[] = [];

  for (const group of groups) {

    const severity = getSeverity(
      group.blocks.length
    );

    issues.push({
      id: crypto.randomUUID(),
      severity,
      title: "Duplicate Code",
      description:
        `${group.blocks.length} duplicate blocks detected.`,
      file: group.blocks[0].file,
      line: group.blocks[0].startLine,
      recommendation:
        "Extract shared logic into a reusable utility or component.",
      
    });

  }

  return issues;

}

async function runDuplicateScanner(
  context: ScannerContext
): Promise<ScannerResult> {

  const started = Date.now();

  const files = scanDirectory(ROOT);

  const blocks = collectBlocks(files);

  const duplicateGroups =
    buildDuplicateGroups(blocks);

  const issues =
    buildIssues(duplicateGroups);

  const duration =
    Date.now() - started;

  const qualityScore =
    calculateQualityScore(
      duplicateGroups.length,
      files.length
    );

  return {

    id: crypto.randomUUID(),

    name: "Duplicate Code Scanner",

    duration,

    scannedItems: files.length,

passed: issues.length === 0 ? files.length : 0,

warnings: issues.length,

failed: 0,

    issues,

    metadata: {

      scannedBlocks: blocks.length,

      duplicateGroups:
        duplicateGroups.length,

      qualityScore,

    },

  };

}
export const duplicateCodeScanner: EnterpriseScanner = {

  id: "duplicate-code",

  name: "Duplicate Code Scanner",

  description:
    "Scans the project for duplicate functions, components and reusable code blocks.",

  version: "1.0.0",

  category: "code-quality",

  async run(
    context: ScannerContext
  ): Promise<ScannerResult> {

    try {

      return await runDuplicateScanner(
        context
      );

    } catch (error) {

      return {

        id: crypto.randomUUID(),

        scanner: "duplicate-code",

        name: "Duplicate Code Scanner",

        success: false,

        duration: 0,

        scannedFiles: 0,

        issueCount: 1,

        issues: [
          {
            id: crypto.randomUUID(),
            severity: "critical",
            title: "Scanner Failed",
            description:
              error instanceof Error
                ? error.message
                : "Unknown scanner error",

            file: "",

            line: 0,

            scanner: "duplicate-code",

            recommendation:
              "Check scanner logs and project configuration.",

            metadata: {},
          },
        ],

        metadata: {
          scannedBlocks: 0,
          duplicateGroups: 0,
          qualityScore: 0,
        },

      };

    }

  },

};

export default duplicateCodeScanner;
