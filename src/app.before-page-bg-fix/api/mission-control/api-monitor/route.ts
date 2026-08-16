import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    {
      id: "health-api",
      name: "System Health API",
      endpoint: "/api/mission-control/system-health",
      method: "GET",
      status: "healthy",
      responseTime: 82,
      lastChecked: new Date().toISOString(),
    },
    {
      id: "summary-api",
      name: "Mission Summary API",
      endpoint: "/api/mission-control/summary",
      method: "GET",
      status: "healthy",
      responseTime: 65,
      lastChecked: new Date().toISOString(),
    },
  ]);
}
