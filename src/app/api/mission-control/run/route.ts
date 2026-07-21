import { NextResponse } from "next/server";

import { scanFirestore } from "@/mission-control/scanners/firestoreScanner";
import { duplicateCodeScanner } from "@/mission-control/scanners/duplicateCodeScanner";
import { findHardcodedBusinessRules } from "@/mission-control/autofix/hardcodedRuleAutoFix";
import { previewThemeFix } from "@/mission-control/autofix/themeAutoFix";

export async function POST() {
  try {
    const started = Date.now();

    const [
      firestore,
      duplicate,
      businessRules,
      theme,
    ] = await Promise.all([
      scanFirestore(),
      duplicateCodeScanner.run({} as any),
      findHardcodedBusinessRules(),
      previewThemeFix(),
    ]);

    const finished = Date.now();

    return NextResponse.json({
      success: true,
      duration: finished - started,

      theme: {
        scannedFiles: theme.scannedFiles,
        filesToModify: theme.filesToModify,
      },

      firestore: {
        scannedFiles: firestore.scannedFiles,
        issues: firestore.issueCount,
      },

      duplicate: {
        scannedFiles: duplicate.scannedFiles,
        issues: duplicate.issueCount,
      },

      rules: {
        scannedFiles: businessRules.scannedFiles,
        issues: businessRules.issueCount,
      },
    });

  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      {
        status: 500,
      }
    );
  }
}
