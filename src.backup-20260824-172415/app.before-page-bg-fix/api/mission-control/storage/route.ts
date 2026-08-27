import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    totalStorage: "100 GB",
    usedStorage: "28 GB",
    freeStorage: "72 GB",
    usagePercent: 28,
    updatedAt: new Date().toISOString(),
  });
}
