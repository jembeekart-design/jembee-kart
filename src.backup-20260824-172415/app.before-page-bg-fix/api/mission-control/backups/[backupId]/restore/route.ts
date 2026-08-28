import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    success: true,
    message: "Backup restored successfully.",
    restoredAt: new Date().toISOString(),
  });
}
