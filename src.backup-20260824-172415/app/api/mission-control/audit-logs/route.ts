import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    {
      id: "1",
      action: "Mission Control Scan",
      user: "System",
      status: "success",
      createdAt: new Date().toISOString(),
    },
    {
      id: "2",
      action: "Deployment",
      user: "Admin",
      status: "success",
      createdAt: new Date().toISOString(),
    },
  ]);
}
