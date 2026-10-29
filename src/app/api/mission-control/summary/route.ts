import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/api/adminAuth";
import { runEnterpriseScanners } from "@/mission-control/scanners/runEnterpriseScanners";

export async function GET(request: NextRequest) {
  return withAdminAuth(async () => {
    try {
      const result = await runEnterpriseScanners({ executionId: crypto.randomUUID() });
      const firestore = result.scanners.find((s) => s.id === "firestore");
      const duplicate = result.scanners.find((s) => s.id === "duplicate-code");
      const rules = result.scanners.find((s) => s.id === "business-rules");
      return NextResponse.json({
        success: true,
        generatedAt: result.finishedAt,
        duration: result.duration,
        scanners: {
          firestore: { scannedFiles: firestore?.scannedItems ?? 0, collections: firestore?.scannedItems ?? 0 },
          duplicate: { duplicates: duplicate?.warnings ?? 0, duplicateGroups: duplicate?.warnings ?? 0 },
          rules: { issueCount: rules?.warnings ?? 0 },
        },
      });
    } catch (error) {
      console.error("Mission-control summary scan failed:", error);
      return NextResponse.json({ success: false, message: "Unable to run mission-control summary scan." }, { status: 500 });
    }
  }, request);
}
