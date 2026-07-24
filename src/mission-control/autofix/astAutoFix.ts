import { Project } from "ts-morph";
import path from "path";
import { previewHardcodedRuleFix } from "./hardcodedRuleAutoFix";

export interface AstFixResult {
  success: boolean;
  modifiedFiles: number;
  message: string;
}

function createProject() {
  return new Project({
    tsConfigFilePath: path.join(process.cwd(), "tsconfig.json"),
    skipAddingFilesFromTsConfig: false,
  });
}

export async function previewAstFix(): Promise<AstFixResult> {
  const project = createProject();

  // Load all source files
  project.getSourceFiles();

  const preview = previewHardcodedRuleFix();

  return {
    success: true,
    modifiedFiles: preview.filesToModify,
    message: `${preview.filesToModify} verified file(s) ready for AST Auto Fix.`,
  };
}

export async function applyAstFix(): Promise<AstFixResult> {
  const project = createProject();

  const preview = previewHardcodedRuleFix();

  let modifiedFiles = 0;

  for (const item of preview.preview) {
    if (!item.safe) continue;

    const source = project.getSourceFile(item.file);

    if (!source) continue;

    // Phase-1:
    // Source file loaded successfully.
    // Actual AST replacement will be added in Phase-2.

    modifiedFiles++;
  }

  return {
    success: modifiedFiles > 0,
    modifiedFiles,
    message:
      modifiedFiles > 0
        ? `${modifiedFiles} verified file(s) prepared for AST replacement.`
        : "No verified files found.",
  };
}
