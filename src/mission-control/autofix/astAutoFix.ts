
import {
  Project,
  Node,
  SourceFile,
  SyntaxKind,
  DiagnosticCategory,
} from "ts-morph";
import path from "path";
import fs from "fs";
import { previewHardcodedRuleFix } from "./hardcodedRuleAutoFix";
import { VERIFIED_RULES } from "./ruleMappings";

export interface AstFixResult {
  success: boolean;
  modifiedFiles: number;
  message: string;
}

interface RewriteResult {
  modified: boolean;
  replacements: number;
}

function createProject(): Project {
  return new Project({
    tsConfigFilePath: path.join(process.cwd(), "tsconfig.json"),
    skipAddingFilesFromTsConfig: false,
  });
}

function createBackup(filePath: string): void {
  const absolutePath = path.resolve(filePath);
  if (fs.existsSync(absolutePath)) {
    const backupPath = `${absolutePath}.bak`;
    if (!fs.existsSync(backupPath)) {
      fs.copyFileSync(absolutePath, backupPath);
    }
  }
}

function cleanupBackup(filePath: string): void {
  const absolutePath = path.resolve(filePath);
  const backupPath = `${absolutePath}.bak`;
  if (fs.existsSync(backupPath)) {
    try {
      fs.unlinkSync(backupPath);
    } catch {
      // Ignore cleanup errors
    }
  }
}

function restoreBackup(filePath: string): void {
  const absolutePath = path.resolve(filePath);
  const backupPath = `${absolutePath}.bak`;
  if (fs.existsSync(backupPath)) {
    fs.copyFileSync(backupPath, absolutePath);
    fs.unlinkSync(backupPath);
  }
}

function rewriteSourceFile(
  sourceFile: SourceFile,
  configPaths: string[]
): RewriteResult {
  let replacements = 0;
  const propertyAccessNodes = sourceFile.getDescendantsOfKind(
    SyntaxKind.PropertyAccessExpression
  );

  for (const node of propertyAccessNodes) {
    if (!Node.isPropertyAccessExpression(node)) {
      continue;
    }

    const expressionText = node.getText();
    const parent = node.getParent();

    if (!parent) {
      continue;
    }

    const grandParent = parent.getParent();

    if (
      Node.isTypeReference(parent) ||
      (grandParent && Node.isImportDeclaration(grandParent)) ||
      (Node.isPropertyAssignment(parent) &&
        parent.getNameNode().getText() === node.getText())
    ) {
      continue;
    }

    for (const mapping of VERIFIED_RULES) {
      if (!mapping.safe) {
        continue;
      }

      if (!configPaths.includes(mapping.configPath)) {
        continue;
      }

      if (mapping.pattern.global) {
        mapping.pattern.lastIndex = 0;
      }

      if (!mapping.pattern.test(expressionText)) {
        continue;
      }

      if (expressionText === mapping.replacement) {
        continue;
      }

      try {
        node.replaceWithText(mapping.replacement);
        replacements++;
        break;
      } catch (error) {
        console.warn(
          `Failed to replace ${expressionText} in ${sourceFile.getFilePath()}:`,
          error
        );
      }
    }
  }

  if (replacements > 0) {
    sourceFile.organizeImports();
    sourceFile.fixMissingImports();
    sourceFile.formatText();
  }

  return {
    modified: replacements > 0,
    replacements,
  };
}

export async function previewAstFix(): Promise<AstFixResult> {
  const preview = previewHardcodedRuleFix();

  return {
    success: true,
    modifiedFiles: preview.filesToModify,
    message: `${preview.filesToModify} verified file(s) ready for AST PropertyAccessExpression fix.`,
  };
}

export async function applyAstFix(): Promise<AstFixResult> {
  const project = createProject();
  const preview = previewHardcodedRuleFix();

  let modifiedFilesCount = 0;
  let totalReplacements = 0;
  const processedFiles: { path: string; source: SourceFile }[] = [];

  for (const item of preview.preview) {
    if (!item.safe) {
      continue;
    }

    const source = project.getSourceFile(item.file);
    if (!source) {
      continue;
    }

    createBackup(item.file);

    const result = rewriteSourceFile(source, item.configPaths);

    if (result.modified) {
      modifiedFilesCount++;
      totalReplacements += result.replacements;
      processedFiles.push({ path: item.file, source });
    } else {
      cleanupBackup(item.file);
    }
  }

  if (modifiedFilesCount > 0) {
    let hasSyntaxErrors = false;

    const diagnostics = project.getPreEmitDiagnostics();
    const syntaxOrTypeErrors = diagnostics.filter(
      (diag) => diag.getCategory() === DiagnosticCategory.Error
    );

    if (syntaxOrTypeErrors.length > 0) {
      hasSyntaxErrors = true;
      for (const fileObj of processedFiles) {
        restoreBackup(fileObj.path);
      }
    }

    if (hasSyntaxErrors) {
      return {
        success: false,
        modifiedFiles: 0,
        message:
          "AST fixes introduced syntax or type errors. Changes were rolled back and nothing was saved.",
      };
    }

    await project.save();

    for (const fileObj of processedFiles) {
      cleanupBackup(fileObj.path);
    }
  }

  return {
    success: true,
    modifiedFiles: modifiedFilesCount,
    message:
      modifiedFilesCount > 0
        ? `Successfully applied AST fixes to ${modifiedFilesCount} file(s) with ${totalReplacements} total replacement(s).`
        : "No verified files required modification.",
  };
}
