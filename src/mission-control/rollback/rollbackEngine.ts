import fs from "fs";
import path from "path";
import { RollbackResult } from "./types";

function copyRecursive(source: string, destination: string): number {
  let files = 0;

  if (!fs.existsSync(source)) {
    return 0;
  }

  fs.mkdirSync(destination, { recursive: true });

  const entries = fs.readdirSync(source, { withFileTypes: true });

  for (const entry of entries) {
    const src = path.join(source, entry.name);
    const dest = path.join(destination, entry.name);

    if (entry.isDirectory()) {
      files += copyRecursive(src, dest);
    } else {
      fs.copyFileSync(src, dest);
      files++;
    }
  }

  return files;
}

export function rollback(backupPath: string): RollbackResult {
  const source = path.join(backupPath, "src");
  const destination = path.join(process.cwd(), "src");

  if (!fs.existsSync(source)) {
    return {
      success: false,
      restoredFiles: 0,
      backupPath,
      message: "Backup not found.",
    };
  }

  const restoredFiles = copyRecursive(source, destination);

  return {
    success: true,
    restoredFiles,
    backupPath,
    message: `Rollback completed. ${restoredFiles} file(s) restored.`,
  };
}
