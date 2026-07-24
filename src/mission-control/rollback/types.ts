export interface RollbackResult {
  success: boolean;
  restoredFiles: number;
  backupPath: string;
  message: string;
}

export interface RollbackMetadata {
  createdAt: string;
  filesCopied: number;
  version: string;
  scanner: string;
}
