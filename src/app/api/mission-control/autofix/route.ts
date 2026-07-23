import { NextResponse } from "next/server";

import {
  previewThemeFix,
} from "@/mission-control/autofix/themeAutoFix";

import {
  findHardcodedBusinessRules,
} from "@/mission-control/autofix/hardcodedRuleAutoFix";

import {
  previewAstFix,
} from "@/mission-control/autofix/astAutoFix";

export async function POST() {
  try {
    const started = Date.now();

    const [theme, rules, ast] = await Promise.all([
      Promise.resolve(previewThemeFix()),
      findHardcodedBusinessRules(),
      previewAstFix(),
    ]);

    const duration = Date.now() - started;

    return NextResponse.json({
      success: true,
      message: "Auto Fix Preview completed.",

      theme: {
        scannedFiles: theme.scannedFiles,
        filesToModify: theme.filesToModify,
        preview: theme.preview,
      },

      rules: {
        scannedFiles: rules.scannedFiles,
        issueCount: rules.issueCount,
        issues: rules.issues,
      },

      ast: {
        success: ast.success,
        modifiedFiles: ast.modifiedFiles,
        message: ast.message,
      },

      duration,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      {
        status: 500,
      }
    );
  }
}
