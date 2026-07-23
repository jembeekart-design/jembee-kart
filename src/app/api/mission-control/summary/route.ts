import { NextResponse } from "next/server";
import { runEnterpriseScanners } from "@/mission-control/scanners/runEnterpriseScanners";

export async function GET() {
  try {
    const result = await runEnterpriseScanners({
      executionId: crypto.randomUUID(),
    });

    const firestore =
      result.scanners.find((s) => s.id === "firestore");

    const duplicate =
      result.scanners.find((s) => s.id === "duplicate-code");

    const rules =
      result.scanners.find((s) => s.id === "business-rules");

    return NextResponse.json({
      success: true,

      generatedAt: result.finishedAt,
      duration: result.duration,

      scanners: {
        firestore: {
          scannedFiles: firestore?.scannedItems ?? 0,
          collections: firestore?.scannedItems ?? 0,
        },

        duplicate: {
          duplicates: duplicate?.warnings ?? 0,
          duplicateGroups: duplicate?.warnings ?? 0,
        },

        rules: {
          issueCount: rules?.warnings ?? 0,
        },
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      {
        success: false,
        message: e?.message ?? "Unknown error",
      },
      {
        status: 500,
      }
    );
  }
}
