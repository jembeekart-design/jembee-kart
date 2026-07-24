import fs from "fs";
import path from "path";

export interface BackupResult {
  success: boolean;
  backupPath: string;
  filesCopied: number;
  message: string;
}

const BACKUP_ROOT = path.join(process.cwd(), ".mission-control-backup");

function ensureDirectory(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function timestampFolder() {
  return new Date()
    .toISOString()
    .replace(/[:.]/g, "-");
}

function copyRecursive(source: string, destination: string): number {
  let files = 0;

  ensureDirectory(destination);

  const entries = fs.readdirSync(source, {
    withFileTypes: true,
  });

  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const destinationPath = path.join(destination, entry.name);

    if (entry.isDirectory()) {
      files += copyRecursive(sourcePath, destinationPath);
    } else {
      fs.copyFileSync(sourcePath, destinationPath);
      files++;
    }
  }

  return files;
}

export function createBackup(): BackupResult {
  ensureDirectory(BACKUP_ROOT);

  const backupFolder = path.join(
    BACKUP_ROOT,
    timestampFolder()
  );

  const sourceRoot = path.join(process.cwd(), "src");

  const filesCopied = copyRecursive(
    sourceRoot,
    path.join(backupFolder, "src")
  );

  const metadata = {
    createdAt: new Date().toISOString(),
    filesCopied,
    version: "1.1",
    scanner: "Mission Control Backup Engine",
  };

  fs.writeFileSync(
    path.join(backupFolder, "backup.json"),
    JSON.stringify(metadata, null, 2)
  );

  return {
    success: true,
    backupPath: backupFolder,
    filesCopied,
    message: `Backup created successfully. ${filesCopied} file(s) copied.`,
  };
}
