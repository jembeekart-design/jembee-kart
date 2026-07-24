import { Project, Node, SourceFile } from "ts-morph";
import path from "path";
import { previewHardcodedRuleFix } from "./hardcodedRuleAutoFix";

export interface AstFixResult {
  success: boolean;
  modifiedFiles: number;
  message: string;
}

interface RewriteResult {
  modified: boolean;
  replacements: number;
}

function createProject() {
  return new Project({
    tsConfigFilePath: path.join(process.cwd(), "tsconfig.json"),
    skipAddingFilesFromTsConfig: false,
  });
}

function rewriteSourceFile(
  sourceFile: SourceFile,
  configPaths: string[]
): RewriteResult {
  let replacements = 0;

  const descendants = sourceFile.getDescendants();

  for (const node of descendants) {
    if (
      Node.isNumericLiteral(node) ||
      Node.isStringLiteral(node)
    ) {
      const text = node.getText();

      // Phase 2:
      // Only mark nodes for future replacement.
      // Real mapping will be added in the next phase.

      if (configPaths.length > 0) {
        replacements++;
      }
    }
  }

  if (replacements > 0) {
    sourceFile.formatText();
  }

  return {
    modified: replacements > 0,
    replacements,
  };
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

  // Load source files into the project
  project.getSourceFiles();

  const preview = previewHardcodedRuleFix();

  let modifiedFiles = 0;

  for (const item of preview.preview) {
    if (!item.safe) continue;

    const source = project.getSourceFile(item.file);

    if (!source) continue;

    const result = rewriteSourceFile(
      source,
      item.configPaths
    );

    if (result.modified) {
      modifiedFiles++;
    }
  }

  await project.save();

  return {
    success: modifiedFiles > 0,
    modifiedFiles,
    message:
      modifiedFiles > 0
        ? `${modifiedFiles} verified file(s) prepared for AST replacement.`
        : "No verified files found.",
  };
}
