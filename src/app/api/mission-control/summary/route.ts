import { NextResponse } from "next/server";
import { scanFirestore } from "@/mission-control/scanners/firestoreScanner";
import { scanDuplicateCode } from "@/mission-control/scanners/duplicateCodeScanner";
import { findHardcodedBusinessRules } from "@/mission-control/autofix/hardcodedRuleAutoFix";

export async function GET() {
  const startedAt = Date.now();

  try {
    const firestore = await scanFirestore();
    const duplicate = await scanDuplicateCode();
    const rules = await findHardcodedBusinessRules();

    return NextResponse.json({
      success: true,
      generatedAt: new Date().toISOString(),
      duration: Date.now() - startedAt,

      scanners: {
        firestore,
        duplicate,
        rules,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Mission Control summary failed.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
