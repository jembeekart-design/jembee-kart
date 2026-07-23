import { generateModifiedFiles } from "./generateModifiedFiles";
import { generateRuleFixes } from "./generateRuleFixes";

export interface AutoFixFile {
  path: string;
  modifiedContent: string;
}

export async function getAutoFixFiles() {
  const themeFiles = generateModifiedFiles();
  const ruleFiles = generateRuleFixes();

  const fileMap = new Map<string, AutoFixFile>();

  // Theme Auto Fix files
  for (const file of themeFiles) {
    fileMap.set(file.path, {
      path: file.path,
      modifiedContent: file.modifiedContent,
    });
  }

  // Hardcoded Rule Auto Fix files
  for (const file of ruleFiles) {
    fileMap.set(file.path, {
      path: file.path,
      modifiedContent: file.modifiedContent,
    });
  }

  return {
    files: Array.from(fileMap.values()),
    themeFiles: themeFiles.length,
    ruleFiles: ruleFiles.length,
    totalFiles: fileMap.size,
  };
}
