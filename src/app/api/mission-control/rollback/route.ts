import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/api/adminAuth";
import { RollbackManager } from "@/mission-control/rollback/rollbackManager";

export async function POST(req: NextRequest) {
  return withAdminAuth(async () => {
    try {
      const body = await req.json();
      if (typeof body?.backupPath !== "string" || !body.backupPath.trim()) {
        return NextResponse.json({ success: false, message: "Invalid backup path" }, { status: 400 });
      }
      const result = await RollbackManager.restore(body.backupPath);
      return NextResponse.json(result);
    } catch (error) {
      console.error("Rollback failed", error instanceof Error ? error.message : "unknown");
      return NextResponse.json({ success: false, message: "Rollback failed." }, { status: 500 });
    }
  }, req);
}
