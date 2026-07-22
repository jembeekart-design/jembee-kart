import { NextResponse } from "next/server";

import {
  fixHardcodedTheme,
} from "@/mission-control/autofix/themeAutoFix";

import {
  findHardcodedBusinessRules,
} from "@/mission-control/autofix/hardcodedRuleAutoFix";

export async function POST() {
  try {
    const started = Date.now();

    const [theme, rules] = await Promise.all([
      fixHardcodedTheme(),
      findHardcodedBusinessRules(),
    ]);

    const duration = Date.now() - started;

    return NextResponse.json({
      success: true,
      message: "Auto Fix completed.",

      theme: {
        scannedFiles: theme.scannedFiles,
        modifiedFiles: theme.modifiedFiles,
        replacements: theme.totalReplacements,
      },

      rules: {
        scannedFiles: rules.scannedFiles,
        issueCount: rules.issueCount,
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
