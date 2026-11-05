import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { success: false, code: "TRUSTED_AD_EVENT_PROOF_REQUIRED", message: "Ad billing events are temporarily paused until trusted impression/click verification is enabled." },
    { status: 503, headers: { "Cache-Control": "no-store" } }
  );
}
