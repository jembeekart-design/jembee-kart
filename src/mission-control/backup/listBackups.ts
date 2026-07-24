import fs from "fs";
import path from "path";
import { BackupEntry } from "./backupTypes";

const BACKUP_ROOT = path.join(
  process.cwd(),
  ".mission-control-backup"
);

export function listBackups(): BackupEntry[] {
  if (!fs.existsSync(BACKUP_ROOT)) {
    return [];
  }

  const folders = fs
    .readdirSync(BACKUP_ROOT, {
      withFileTypes: true,
    })
    .filter((entry) => entry.isDirectory());

  const backups: BackupEntry[] = [];

  for (const folder of folders) {
    const backupPath = path.join(
      BACKUP_ROOT,
      folder.name
    );

    const metadataFile = path.join(
      backupPath,
      "backup.json"
    );

    if (!fs.existsSync(metadataFile)) {
      continue;
    }

    try {
      const metadata = JSON.parse(
        fs.readFileSync(metadataFile, "utf8")
      );

      backups.push({
        name: folder.name,
        path: backupPath,
        createdAt: metadata.createdAt,
        filesCopied: metadata.filesCopied,
      });
    } catch {
      continue;
    }
  }

  backups.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() -
      new Date(a.createdAt).getTime()
  );

  return backups;
}
