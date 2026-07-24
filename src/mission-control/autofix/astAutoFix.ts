import { Project, Node, SourceFile } from "ts-morph";
import path from "path";
import { previewHardcodedRuleFix } from "./hardcodedRuleAutoFix";
import { VERIFIED_RULES } from "./ruleMappings";
import { createBackup } from "../backup/backupEngine";

export interface AstFixResult {
  success: boolean;
  modifiedFiles: number;
  message: string;
}

interface PreviewResult {
  matched: boolean;
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
): PreviewResult {
  let replacements = 0;

  const descendants = sourceFile.getDescendants();

  for (const node of descendants) {
    if (!Node.isIdentifier(node)) {
      continue;
    }

    const text = node.getText();

    for (const mapping of VERIFIED_RULES) {
      if (!mapping.safe) continue;

      if (!configPaths.includes(mapping.configPath)) continue;

      if (!mapping.pattern.test(text)) continue;

      console.log(
        `[AST Preview] File=${sourceFile.getFilePath()} | Rule=${mapping.name} | Identifier=${text} | Config=${mapping.configPath}`
      );

      replacements++;

      break;
    }
  }

  // No source modification in preview mode

  return {
    matched: replacements > 0,
    replacements,
  };
}

export async function previewAstFix(): Promise<AstFixResult> {
  const preview = previewHardcodedRuleFix();

  const backup = createBackup();

  if (!backup.success) {
    return {
      success: false,
      modifiedFiles: 0,
      message: `Backup failed: `,
    };
  }

  console.log("[Mission Control] Backup:", backup.backupPath);

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
  let totalReplacements = 0;

  for (const item of preview.preview) {
    if (!item.safe) continue;

    const source = project.getSourceFile(item.file);

    if (!source) continue;

    const result = rewriteSourceFile(
      source,
      item.configPaths
    );

    if (result.matched) {
      modifiedFiles++;
      totalReplacements += result.replacements;
    }
  }

  return {
    success: true,
    modifiedFiles,
    message:
      modifiedFiles > 0
        ? `Preview completed. ${modifiedFiles} file(s) analyzed, ${totalReplacements} potential replacement(s) detected. No source code was modified.`
        : "Preview completed. No verified files found.",
  };
}
