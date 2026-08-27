import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    success: true,
    message: "API retry started.",
    startedAt: new Date().toISOString(),
  });
}
