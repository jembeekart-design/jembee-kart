import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    cpuUsage: 18,
    memoryUsage: 46,
    diskUsage: 32,
    networkLatency: 24,
    averageResponseTime: 182,
    uptime: "99.99%",
    updatedAt: new Date().toISOString(),
  });
}
