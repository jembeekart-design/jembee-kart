import { generateModifiedFiles } from "./generateModifiedFiles";

export interface AutoFixPreviewResult {
  files: {
    path: string;
    modifiedContent: string;
  }[];
}

export async function getAutoFixFiles(): Promise<AutoFixPreviewResult> {
  const files = generateModifiedFiles();

  return {
    files: files.map((file) => ({
      path: file.path,
      modifiedContent: file.modifiedContent,
    })),
  };
}
