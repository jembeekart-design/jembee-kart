import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  // 1. Scope fix: reportPath try block ke bahar declare kiya
  const reportPath = path.join(
    process.cwd(),
    "hardcoded-governance-report.json"
  );

  try {
    console.log("Report Path:", reportPath);

    if (!fs.existsSync(reportPath)) {
      console.error("Report file not found:", reportPath);
      return NextResponse.json(
        {
          success: false,
          message:
            "hardcoded-governance-report.json not found. Run: npm run scan:hardcoded",
          results: [],
        },
        { status: 404 }
      );
    }

    console.log("Reading report...");
    const file = fs.readFileSync(reportPath, "utf8");
    console.log("Report loaded successfully");
    const report = JSON.parse(file);

    const issues = Array.isArray(report)
      ? report
      : (report.findings ?? report.issues ?? []);
    
    const results = issues.map((item: any, index: number) => {
      // 2. Case-insensitive severity mapping
      const severity = String(item.severity || "").toLowerCase();
      const status =
        severity === "critical"
          ? "FAIL"
          : severity === "high"
          ? "WARNING"
          : "PASS";

      return {
        id: item.id ?? `hardcoded-${index + 1}`,
        name: item.ruleName ?? item.issue ?? "Unknown Issue",
        severity: (item.severity?.toUpperCase?.() ?? "LOW") as "LOW" | "MEDIUM" | "HIGH",
        status, // Mapped status
        category: item.governanceCategory ?? "Hardcoded Rules",
        message: `${item.ruleName ?? item.issue ?? "Hardcoded value"} detected.`,
        file: item.file ?? "unknown-file",
        line: item.line ?? 1,
        column: item.column ?? 1,
        currentCode: item.currentCode ?? item.matchedValue ?? "Hardcoded value detected.",
        matchedValue: item.matchedValue ?? "",
        fixedCode: item.remediation?.fixedCode ?? item.fixedCode ?? "Move this configuration to Firestore Admin Panel.",
        suggestion: item.remediation?.suggestion ?? item.suggestion ?? "Replace hardcoded values with Firestore Admin configuration.",
        recommendation: [
          "Move configuration to Firestore.",
          "Control business rules from Admin Panel.",
          "Avoid hardcoded values.",
        ],
        autoFix: item.remediation?.isAutoFixable ?? item.autoFix ?? false,
        patchId: item.patchId ?? `hardcoded-${index + 1}`,
      };
    });

    console.log("Total Issues:", results.length);
    return NextResponse.json({
      success: true,
      totalIssues: results.length,
      results,
    });
  } catch (error) {
    // 3. Catch block ab reportPath ko safely access kar sakta hai
    console.error("Hardcoded Scanner API Error:", error);
    console.error("Report Path:", reportPath);

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
