import { NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/api/adminAuth";

export async function GET(req: Request) {
  return withAdminAuth(async () => {
    const baseUrl = process.env.QIKINK_BASE_URL?.trim();
    const clientId = process.env.QIKINK_CLIENT_ID?.trim();
    const clientSecret = process.env.QIKINK_CLIENT_SECRET;

    if (!baseUrl || !clientId || !clientSecret) {
      return NextResponse.json(
        { success: false, configured: false, message: "Qikink credentials are not configured" },
        { status: 503 }
      );
    }

    try {
      const response = await fetch(`${baseUrl.replace(/\/$/, "")}/api/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ ClientId: clientId, client_secret: clientSecret }),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        return NextResponse.json(
          { success: false, configured: true, message: "Qikink connection test failed" },
          { status: 502 }
        );
      }

      const data = await response.json().catch(() => null);
      const authenticated = typeof data?.Accesstoken === "string" && data.Accesstoken.length > 0;
      return NextResponse.json(
        { success: authenticated, configured: true, message: authenticated ? "Qikink credentials accepted" : "Qikink authentication failed" },
        { status: authenticated ? 200 : 502, headers: { "Cache-Control": "no-store" } }
      );
    } catch {
      return NextResponse.json(
        { success: false, configured: true, message: "Qikink connection test failed" },
        { status: 502, headers: { "Cache-Control": "no-store" } }
      );
    }
  }, req);
}
