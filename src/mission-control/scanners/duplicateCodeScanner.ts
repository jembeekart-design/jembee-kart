import fs from "fs";
import path from "path";
import crypto from "crypto";

export interface DuplicateBlock {
  hash: string;
  files: string[];
  occurrences: number;
}

const ROOT = path.join(process.cwd(), "src");

const SKIP_DIRS = [
  ".git",
  ".next",
  "node_modules",
  "dist",
  "coverage",
];

const EXTENSIONS = [
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
];

function scan(dir: string): string[] {
  const files: string[] = [];

  for (const item of fs.readdirSync(dir)) {

    if (SKIP_DIRS.includes(item)) continue;

    const full = path.join(dir, item);

    const stat = fs.statSync(full);

    if (stat.isDirectory()) {
      files.push(...scan(full));
    } else {

      if (EXTENSIONS.some(ext => full.endsWith(ext))) {
        files.push(full);
      }

    }
  }

  return files;
}

function normalize(code: string) {

  return code
    .replace(/\/\/.*$/gm, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .trim();

}

export async function scanDuplicateCode() {

  const files = scan(ROOT);

  const map = new Map<
    string,
    string[]
  >();

  for (const file of files) {

    const content = normalize(
      fs.readFileSync(file, "utf8")
    );

    const hash = crypto
      .createHash("sha256")
      .update(content)
      .digest("hex");

    if (!map.has(hash)) {
      map.set(hash, []);
    }

    map.get(hash)!.push(file);

  }

  const duplicates: DuplicateBlock[] = [];

  for (const [hash, fileList] of map.entries()) {

    if (fileList.length > 1) {

      duplicates.push({
        hash,
        files: fileList,
        occurrences: fileList.length,
      });

    }

  }

  return {

    scannedFiles: files.length,

    duplicateGroups: duplicates.length,

    duplicates,

  };

}
