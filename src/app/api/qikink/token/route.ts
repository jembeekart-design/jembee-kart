import { NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/api/adminAuth";
import { getQikinkConfig } from "@/lib/server/qikinkSettings";

export async function GET(req: Request) {
  return withAdminAuth(async () => {
    try {
      const config = await getQikinkConfig();
      if (!config) return NextResponse.json({ success: false, message: "Qikink is not configured" }, { status: 503 });
      const response = await fetch(`${config.baseUrl}/api/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ ClientId: config.clientId, client_secret: config.clientSecret }),
        cache: "no-store",
      });
      if (!response.ok) {
        return NextResponse.json({ success: false, message: "Qikink authentication failed" }, { status: 502 });
      }
      const data = await response.json();
      if (typeof data?.Accesstoken !== "string" || !data.Accesstoken) {
        return NextResponse.json({ success: false, message: "Qikink authentication failed" }, { status: 502 });
      }
      // Never return the upstream access token to the browser.
      return NextResponse.json({ success: true, connected: true });
    } catch {
      return NextResponse.json({ success: false, message: "Qikink connection test failed" }, { status: 502 });
    }
  }, req);
}
