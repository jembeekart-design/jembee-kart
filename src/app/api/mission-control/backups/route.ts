import { NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/api/adminAuth";

export async function GET(req: Request) {
  return withAdminAuth(async () => {
    return NextResponse.json([
      {
        id: "backup-1",
        name: "Daily Backup",
        size: "145 MB",
        status: "completed",
        createdAt: new Date().toISOString(),
      },
    ]);
  }, req);
}
