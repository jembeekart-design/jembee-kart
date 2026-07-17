import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const reportPath = path.join(
      process.cwd(),
      "hardcoded-report.json"
    );

    if (!fs.existsSync(reportPath)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "hardcoded-report.json not found. Run: npm run scan:hardcoded",
          results: [],
        },
        { status: 404 }
      );
    }

    const file = fs.readFileSync(reportPath, "utf8");
    const report = JSON.parse(file);

    const results = report.map(
      (
        item: {
          file: string;
          issue: string;
          matches?: string[];
        },
        index: number
      ) => ({
        id: `hardcoded-${index + 1}`,
        name: item.issue,
        status: "WARNING",
        severity: "MEDIUM",
        message: `${item.matches?.length ?? 0} hardcoded value(s) detected.`,
        file: item.file,
        line: 1,

        autoFix: true,
        patchId: `hardcoded-${index + 1}`,

        currentCode:
          item.matches?.join(", ") ?? "Hardcoded value detected",

        fixedCode:
          "Move this configuration to Firestore Admin Panel.",

        suggestion:
          "Remove hardcoded values and load them dynamically from Firestore."
      })
    );

    return NextResponse.json({
      success: true,
      totalIssues: results.length,
      results,
    });
  } catch (error) {
    console.error("Hardcoded Scanner API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load hardcoded report.",
        results: [],
      },
      { status: 500 }
    );
  }
}
