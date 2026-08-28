import { NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/api/adminAuth";

export async function GET(req: Request) {
  return withAdminAuth(async () => {
    return NextResponse.json({
      cpuUsage: 18,
      memoryUsage: 46,
      diskUsage: 32,
      networkLatency: 24,
      averageResponseTime: 182,
      uptime: "99.99%",
      updatedAt: new Date().toISOString(),
    });
  }, req);
}
