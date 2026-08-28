import { NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/api/adminAuth";

export async function GET(req: Request) {
  return withAdminAuth(async () => {
    return NextResponse.json([
      {
        id: "sec-1",
        severity: "low",
        title: "No security threats detected",
        resolved: true,
        detectedAt: new Date().toISOString(),
      },
    ]);
  }, req);
}
