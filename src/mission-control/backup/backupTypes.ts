export interface BackupMetadata {
  createdAt: string;
  filesCopied: number;
  version: string;
  scanner: string;
}

export interface BackupResult {
  success: boolean;
  backupPath: string;
  filesCopied: number;
  message: string;
}

export interface RestoreResult {
  success: boolean;
  restoredFiles: number;
  message: string;
}

export interface BackupEntry {
  name: string;
  path: string;
  createdAt: string;
  filesCopied: number;
}
