import { NextResponse } from "next/server";
import { getAdminDb } from "@/firebase/admin";
import { withAdminAuth } from "@/lib/api/adminAuth";
import { encryptSecret } from "@/lib/server/secretEncryption";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const COLLECTION = "integration_settings";
const DOCUMENT = "qikink";

export async function GET(req: Request) {
  return withAdminAuth(async () => {
    try {
      const snap = await getAdminDb().collection(COLLECTION).doc(DOCUMENT).get();
      const data = snap.exists ? snap.data()! : {};
      return NextResponse.json({
        success: true,
        settings: {
          baseUrl: typeof data.baseUrl === "string" ? data.baseUrl : "https://api.qikink.com",
          clientId: typeof data.clientId === "string" ? data.clientId : "",
          hasClientSecret: typeof data.clientSecretEncrypted === "string" && !!data.clientSecretEncrypted,
          status: typeof data.status === "string" ? data.status : "NOT_CONFIGURED",
          updatedAt: data.updatedAt ?? null,
        },
      });
    } catch (error) {
      console.error("Qikink settings read failed:", error instanceof Error ? error.message : "unknown");
      return NextResponse.json({ success: false, error: "Unable to load Qikink settings" }, { status: 500 });
    }
  }, req);
}

export async function POST(req: Request) {
  return withAdminAuth(async () => {
    try {
      const body = await req.json().catch(() => null);
      if (!body || typeof body !== "object" || Array.isArray(body)) {
        return NextResponse.json({ success: false, error: "Invalid settings payload" }, { status: 400 });
      }
      const baseUrl = typeof body.baseUrl === "string" ? body.baseUrl.trim().replace(/\/+$/, "") : "";
      const clientId = typeof body.clientId === "string" ? body.clientId.trim() : "";
      const clientSecret = typeof body.clientSecret === "string" ? body.clientSecret.trim() : "";
      if (!/^https:\/\//i.test(baseUrl) || baseUrl.length > 300) {
        return NextResponse.json({ success: false, error: "Use a valid HTTPS Qikink API base URL" }, { status: 400 });
      }
      if (!clientId || clientId.length > 500 || clientSecret.length > 2000) {
        return NextResponse.json({ success: false, error: "Enter a valid Client ID and secret" }, { status: 400 });
      }
      const ref = getAdminDb().collection(COLLECTION).doc(DOCUMENT);
      const oldSnap = await ref.get();
      const old = oldSnap.exists ? oldSnap.data()! : {};
      const patch: Record<string, unknown> = {
        baseUrl, clientId,
        status: "CONFIGURED_NOT_TESTED",
        updatedAt: new Date().toISOString(),
      };
      if (clientSecret) patch.clientSecretEncrypted = encryptSecret(clientSecret);
      else if (old.clientSecretEncrypted) patch.clientSecretEncrypted = old.clientSecretEncrypted;
      if (!patch.clientSecretEncrypted) {
        return NextResponse.json({ success: false, error: "Enter the Qikink Client Secret before saving" }, { status: 400 });
      }
      await ref.set(patch, { merge: true });
      return NextResponse.json({ success: true, hasClientSecret: true, status: "CONFIGURED_NOT_TESTED", message: "Qikink credentials saved encrypted. Use Test Connection to verify them." });
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown";
      console.error("Qikink settings save failed:", message);
      const missingKey = message.includes("ENCRYPTION_KEY");
      return NextResponse.json({ success: false, error: missingKey ? "Server setup required: configure APP_SECRETS_ENCRYPTION_KEY (base64 32-byte key) in Vercel before saving credentials." : "Unable to save Qikink credentials securely" }, { status: missingKey ? 503 : 500 });
    }
  }, req);
}
