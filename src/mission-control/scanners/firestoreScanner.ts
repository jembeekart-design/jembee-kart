import fs from "fs";
import path from "path";

export interface FirestoreIssue {
  file: string;
  line: number;
  type: "collection" | "doc" | "write" | "delete";
  value: string;
}

const SKIP_DIRS = [
  ".git",
  ".next",
  "node_modules",
  "dist",
  "coverage",
];

const EXTENSIONS = [".ts", ".tsx", ".js", ".jsx"];

const PATTERNS = [
  {
    type: "collection" as const,
    regex: /collection\s*\(\s*[^,]+,\s*["'`]([^"'`]+)["'`]/g,
  },
  {
    type: "doc" as const,
    regex: /doc\s*\(\s*[^,]+,\s*["'`]([^"'`]+)["'`]/g,
  },
  {
    type: "write" as const,
    regex: /\b(setDoc|addDoc|updateDoc)\b/g,
  },
  {
    type: "delete" as const,
    regex: /\bdeleteDoc\b/g,
  },
];

function scan(dir: string): string[] {
  const files: string[] = [];

  for (const item of fs.readdirSync(dir)) {
    if (SKIP_DIRS.includes(item)) continue;

    const full = path.join(dir, item);
    const stat = fs.statSync(full);

    if (stat.isDirectory()) {
      files.push(...scan(full));
    } else if (EXTENSIONS.some(ext => full.endsWith(ext))) {
      files.push(full);
    }
  }

  return files;
}

export async function scanFirestore() {
  const root = path.join(process.cwd(), "src");
  const files = scan(root);

  const issues: FirestoreIssue[] = [];

  for (const file of files) {
    const lines = fs.readFileSync(file, "utf8").split("\n");

    lines.forEach((line, index) => {
      for (const pattern of PATTERNS) {
        pattern.regex.lastIndex = 0;

        let match: RegExpExecArray | null;

        while ((match = pattern.regex.exec(line)) !== null) {
          issues.push({
            file,
            line: index + 1,
            type: pattern.type,
            value: match[1] ?? match[0],
          });
        }
      }
    });
  }

  return {
    scannedFiles: files.length,
    issueCount: issues.length,
    issues,
  };
}
