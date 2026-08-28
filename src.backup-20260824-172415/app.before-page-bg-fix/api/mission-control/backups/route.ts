import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    {
      id: "backup-1",
      name: "Daily Backup",
      size: "145 MB",
      status: "completed",
      createdAt: new Date().toISOString(),
    },
  ]);
}
