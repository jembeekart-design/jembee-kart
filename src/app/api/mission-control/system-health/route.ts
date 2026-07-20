import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "healthy",

    cpu: 12,

    memory: 43,

    storage: 28,

    network: "online",

    uptime: "99.99%",

    updatedAt: new Date().toISOString(),
  });
}
