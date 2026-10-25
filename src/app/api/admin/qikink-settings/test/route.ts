import { NextResponse } from "next/server";
import { getAdminDb } from "@/firebase/admin";
import { withAdminAuth } from "@/lib/api/adminAuth";
import { getQikinkConfig } from "@/lib/server/qikinkSettings";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function POST(req: Request) {
  return withAdminAuth(async () => {
    try {
      const config = await getQikinkConfig();
      if (!config) return NextResponse.json({ success: false, error: "Qikink credentials are not configured" }, { status: 409 });
      const response = await fetch(`${config.baseUrl}/api/token`, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ ClientId: config.clientId, client_secret: config.clientSecret }), cache: "no-store" });
      const data = await response.json().catch(() => null);
      const connected = response.ok && typeof data?.Accesstoken === "string" && !!data.Accesstoken;
      await getAdminDb().collection("integration_settings").doc("qikink").set({ status: connected ? "CONNECTED" : "TEST_FAILED", lastTestAt: new Date().toISOString(), lastTestResult: connected ? "success" : "failed" }, { merge: true });
      if (!connected) return NextResponse.json({ success: false, error: "Qikink authentication failed. Check Client ID, Client Secret and API base URL." }, { status: 502 });
      return NextResponse.json({ success: true, status: "CONNECTED", message: "Qikink authentication succeeded. No token was returned to the browser." });
    } catch (error) {
      console.error("Qikink connection test failed:", error instanceof Error ? error.message : "unknown");
      return NextResponse.json({ success: false, error: "Qikink connection test failed. Verify server encryption configuration and credentials." }, { status: 500 });
    }
  }, req);
}
