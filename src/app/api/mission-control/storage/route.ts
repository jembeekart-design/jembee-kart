import { NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/api/adminAuth";

export async function GET(req: Request) {
  return withAdminAuth(async () => {
    return NextResponse.json({
      totalStorage: "100 GB",
      usedStorage: "28 GB",
      freeStorage: "72 GB",
      usagePercent: 28,
      updatedAt: new Date().toISOString(),
    });
  }, req);
}
