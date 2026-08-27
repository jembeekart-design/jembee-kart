import { NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/api/adminAuth";

export async function GET(req: Request) {
  return withAdminAuth(async () => {
    return NextResponse.json({
      connected: true,
      status: "healthy",
      uptime: "99.99%",
      activeUsers: 1,
      updatedAt: new Date().toISOString(),
    });
  }, req);
}
