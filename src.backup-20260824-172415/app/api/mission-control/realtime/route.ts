import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    connected: true,
    status: "healthy",
    uptime: "99.99%",
    activeUsers: 1,
    updatedAt: new Date().toISOString(),
  });
}
