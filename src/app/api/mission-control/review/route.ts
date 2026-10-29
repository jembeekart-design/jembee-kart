import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/api/adminAuth";
import { reviewManager } from "@/mission-control/review/reviewManager";

export async function GET(request: NextRequest) {
  return withAdminAuth(async () => {
    try {
      const report = await reviewManager.getReport();
      return NextResponse.json({ success: true, ...report });
    } catch (error) {
      console.error("Mission-control review report failed:", error);
      return NextResponse.json({ success: false, message: "Failed to generate review report." }, { status: 500 });
    }
  }, request);
}
