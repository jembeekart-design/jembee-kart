import { NextResponse } from "next/server";

export async function GET() {
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
}
