import fs from "fs";
import path from "path";

export interface RestoreResult {
  success: boolean;
  restoredFiles: number;
  message: string;
}

function copyRecursive(source: string, destination: string): number {
  let files = 0;

  if (!fs.existsSync(source)) {
    return 0;
  }

  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  }

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

export function restoreBackup(
  backupPath: string
): RestoreResult {
  const backupSource = path.join(backupPath, "src");
  const projectSource = path.join(process.cwd(), "src");

  if (!fs.existsSync(backupSource)) {
    return {
      success: false,
      restoredFiles: 0,
      message: "Backup source not found.",
    };
  }

  const restoredFiles = copyRecursive(
    backupSource,
    projectSource
  );

  return {
    success: true,
    restoredFiles,
    message: `Successfully restored ${restoredFiles} file(s).`,
  };
}
