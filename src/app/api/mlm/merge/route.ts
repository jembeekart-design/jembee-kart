import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { success: false, message: "This legacy upload endpoint is disabled. Use the authenticated creator upload and moderation workflow." },
    { status: 410 }
  );
}
