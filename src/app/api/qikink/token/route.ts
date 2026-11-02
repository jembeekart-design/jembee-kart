import { NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/api/adminAuth";

/**
 * Legacy diagnostic endpoint intentionally disabled.
 * Qikink access tokens must remain server-side and must never be returned to
 * an administrator's browser. The authenticated fulfillment route obtains
 * and consumes the provider token entirely on the server.
 */
export async function GET(req: Request) {
  return withAdminAuth(async () =>
    NextResponse.json(
      {
        success: false,
        code: "QIKINK_TOKEN_ENDPOINT_DISABLED",
        message: "Provider credentials are server-managed. Use the secure fulfillment workflow instead.",
      },
      { status: 410, headers: { "Cache-Control": "no-store" } },
    ), req);
}

export async function POST(req: Request) {
  return GET(req);
}
