import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Legacy endpoint: global/automatic Monetag scripts are intentionally disabled. */
export async function GET() {
  return NextResponse.json(
    { enabled: false, mode: "MANUAL_PLACEMENTS_ONLY" },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}
