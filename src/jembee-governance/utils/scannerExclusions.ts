// Centralized scanner exclusions
// Every scanner should use this list

export const SCANNER_EXCLUSIONS = [
  // Dependencies
  "node_modules",

  // Next.js
  ".next",

  // Git
  ".git",

  // Vercel
  ".vercel",

  // Build Outputs
  "dist",
  "build",
  "out",

  // Coverage
  "coverage",

  // History / Backups
  ".history",
  ".old",
  "backup",
  "backups",
  "src_backup",
  "src_backup_theme",

  // IDE
  ".vscode",
  ".idea",

  // Cache
  ".cache",

  // Temporary
  "tmp",
  "temp",
] as const;

export function shouldExcludeDirectory(
  directoryName: string
): boolean {
  return SCANNER_EXCLUSIONS.includes(
    directoryName as (typeof SCANNER_EXCLUSIONS)[number]
  );
}
