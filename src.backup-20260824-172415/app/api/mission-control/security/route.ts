import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    {
      id: "sec-1",
      severity: "low",
      title: "No security threats detected",
      resolved: true,
      detectedAt: new Date().toISOString(),
    },
  ]);
}
