import { NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/api/adminAuth";

export async function GET(req: Request) {
  return withAdminAuth(async () => {
    const baseUrl = process.env.QIKINK_BASE_URL;
    const clientId = process.env.QIKINK_CLIENT_ID;
    const clientSecret = process.env.QIKINK_CLIENT_SECRET;
    if (!baseUrl || !clientId || !clientSecret) {
      return NextResponse.json({ success: false, message: "Qikink is not configured" }, { status: 503 });
    }
    try {
      const response = await fetch(`${baseUrl}/api/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ ClientId: clientId, client_secret: clientSecret }),
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
