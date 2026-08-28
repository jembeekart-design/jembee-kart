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

interface RewriteResult {
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
): RewriteResult {
  let replacements = 0;

  for (const node of sourceFile.getDescendants()) {
    if (!Node.isIdentifier(node)) continue;

    const text = node.getText();

    for (const mapping of VERIFIED_RULES) {
      if (!mapping.safe) continue;

      if (!configPaths.includes(mapping.configPath)) continue;

      if (!mapping.pattern.test(text)) continue;

      node.replaceWithText(
        `getConfig("${mapping.configPath}")`
      );

      replacements++;
      break;
    }
  }

  if (replacements > 0) {
    sourceFile.saveSync();
  }

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
      message: "Backup failed.",
    };
  }

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
        ? `AST Auto Fix completed. ${modifiedFiles} file(s) modified, ${totalReplacements} replacement(s) applied.`
        : "AST Auto Fix completed. No verified files found.",
  };
}
