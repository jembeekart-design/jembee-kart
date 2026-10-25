import { NextResponse } from "next/server";
import { getAdminDb } from "@/firebase/admin";
import { withAdminAuth } from "@/lib/api/adminAuth";
import { encryptSecret } from "@/lib/server/secretEncryption";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const SETTINGS_PATH = ["payment_settings", "cashfree"] as const;

export async function GET(req: Request) {
  return withAdminAuth(async () => {
    try {
      const snap = await getAdminDb().collection(SETTINGS_PATH[0]).doc(SETTINGS_PATH[1]).get();
      const data = snap.exists ? snap.data()! : {};
      return NextResponse.json({
        success: true,
        settings: {
          enabled: data.enabled === true,
          sandboxMode: data.sandboxMode !== false,
          appId: typeof data.appId === "string" ? data.appId : "",
          secretKey: "",
          webhookSecret: "",
          hasSecretKey: typeof data.secretKeyEncrypted === "string" && !!data.secretKeyEncrypted,
          hasWebhookSecret: typeof data.webhookSecretEncrypted === "string" && !!data.webhookSecretEncrypted,
          paymentGatewayName: "Cashfree",
          autoSettlement: data.autoSettlement === true,
          status: typeof data.status === "string" ? data.status : "NOT_CONFIGURED",
          updatedAt: data.updatedAt ?? null,
        },
      });
    } catch (error) {
      console.error("Cashfree settings read failed:", error instanceof Error ? error.message : "unknown");
      return NextResponse.json({ success: false, error: "Unable to load Cashfree settings" }, { status: 500 });
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
      const appId = typeof body.appId === "string" ? body.appId.trim() : "";
      const secretKey = typeof body.secretKey === "string" ? body.secretKey : "";
      const webhookSecret = typeof body.webhookSecret === "string" ? body.webhookSecret : "";
      if (appId.length > 200 || secretKey.length > 2000 || webhookSecret.length > 2000) {
        return NextResponse.json({ success: false, error: "Credential field is too long" }, { status: 400 });
      }
      const db = getAdminDb();
      const ref = db.collection(SETTINGS_PATH[0]).doc(SETTINGS_PATH[1]);
      const existing = await ref.get();
      const old = existing.exists ? existing.data()! : {};
      const patch: Record<string, unknown> = {
        appId,
        // Keep payments disabled until a separate verified Cashfree order/webhook flow exists.
        enabled: false,
        sandboxMode: body.sandboxMode !== false,
        autoSettlement: body.autoSettlement === true,
        status: "CONFIGURED_NOT_TESTED",
        updatedAt: new Date().toISOString(),
      };
      if (secretKey.trim()) patch.secretKeyEncrypted = encryptSecret(secretKey.trim());
      else if (old.secretKeyEncrypted) patch.secretKeyEncrypted = old.secretKeyEncrypted;
      if (webhookSecret.trim()) patch.webhookSecretEncrypted = encryptSecret(webhookSecret.trim());
      else if (old.webhookSecretEncrypted) patch.webhookSecretEncrypted = old.webhookSecretEncrypted;
      await ref.set(patch, { merge: true });
      return NextResponse.json({
        success: true,
        message: "Credentials saved encrypted. Live payment connection has not been tested.",
        status: "CONFIGURED_NOT_TESTED",
        enabled: false,
        hasSecretKey: !!patch.secretKeyEncrypted,
        hasWebhookSecret: !!patch.webhookSecretEncrypted,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown";
      console.error("Cashfree settings save failed:", message);
      const missingKey = message.includes("ENCRYPTION_KEY");
      return NextResponse.json({
        success: false,
        error: missingKey
          ? "Server setup required: configure APP_SECRETS_ENCRYPTION_KEY (or legacy CASHFREE_ENCRYPTION_KEY) before saving payment credentials."
          : "Unable to save Cashfree settings securely",
      }, { status: missingKey ? 503 : 500 });
    }
  }, req);
}
