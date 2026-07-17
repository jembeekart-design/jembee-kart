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

    // Dynamic support for both array and object structures
    const issues = Array.isArray(report)
      ? report
      : (report.issues ?? []);

    const results = issues.map((item: any, index: number) => ({
      id: item.id ?? `hardcoded-${index + 1}`,

      name: item.issue ?? "Unknown Issue",

      status: "WARNING",

      severity: item.severity ?? "MEDIUM",

      category: item.governanceCategory ?? "Hardcoded Rules",

      message: `${item.issue ?? "Hardcoded value"} detected.`,

      file: item.file ?? "unknown-file",

      line: item.line ?? 1,

      column: item.column ?? 1,

      currentCode:
        item.currentCode ??
        item.matchedValue ??
        "Hardcoded value detected.",

      matchedValue: item.matchedValue ?? "",

      fixedCode:
        item.fixedCode ??
        "Move this configuration to Firestore Admin Panel.",

      suggestion:
        item.suggestion ??
        "Replace hardcoded values with Firestore Admin configuration.",

      recommendation: [
        "Move configuration to Firestore.",
        "Control business rules from Admin Panel.",
        "Avoid hardcoded values.",
      ],

      autoFix: item.autoFix ?? false,

      patchId:
        item.patchId ?? `hardcoded-${index + 1}`,
    }));

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
