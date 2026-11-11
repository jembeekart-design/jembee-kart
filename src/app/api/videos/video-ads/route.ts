import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Legacy timed floating campaigns are disabled. External ads are served only
 * through Admin-enabled Monetag Direct Link cards at allowlisted page slots.
 */
export async function GET() {
  return NextResponse.json(
    { enabled: false, rules: { enabled: false, firstAdAfterVideos: 0, repeatEveryVideos: 0, autoDismissSeconds: 0 }, ads: [] },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}
