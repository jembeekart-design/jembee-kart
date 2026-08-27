import { NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/api/adminAuth";

export async function GET(req: Request) {
  return withAdminAuth(async () => {
    return NextResponse.json([
      {
        id: "daily-scan",
        name: "Daily Scanner",
        description: "Runs all governance scanners",
        enabled: true,
        status: "idle",
        lastRun: new Date().toISOString(),
        nextRun: new Date(Date.now() + 86400000).toISOString(),
      },
    ]);
  }, req);
}
