import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    success: true,
    message: "Scheduler job started.",
    startedAt: new Date().toISOString(),
  });
}
