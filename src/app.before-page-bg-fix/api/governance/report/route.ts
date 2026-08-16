import { NextRequest, NextResponse } from "next/server";
import { governanceEngine } from "@/jembee-governance";

/**
 * GET /api/governance/report
 * 
 * Server-side endpoint for generating governance reports.
 * This keeps all file-system scanning (fs, path, process.cwd) server-only.
 */
export async function GET(request: NextRequest) {
  try {
    const report = await governanceEngine.run();

    return NextResponse.json({
      success: true,
      data: {
        total: report.totalViolations,
        critical: report.criticalCount,
        warning: report.warningCount,
        info: 0,
        issues: report.violations,
        deploymentStatus: report.deploymentStatus,
        overallScore: report.overallScore,
        generatedAt: report.generatedAt,
      },
    });
  } catch (error) {
    console.error("[Governance API Error]", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
