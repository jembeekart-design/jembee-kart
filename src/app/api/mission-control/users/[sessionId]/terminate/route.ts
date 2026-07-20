import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    success: true,
    message: "Admin session terminated.",
    terminatedAt: new Date().toISOString(),
  });
}
