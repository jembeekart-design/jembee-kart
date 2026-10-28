import { NextResponse } from "next/server";
import { createCipheriv, randomBytes } from "node:crypto";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";

export const runtime = "nodejs";

async function verifyAdmin(req: Request): Promise<string> {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) throw new Error("UNAUTHORIZED");
  const token = header.slice(7).trim();
  if (!token) throw new Error("UNAUTHORIZED");
  const decoded = await getAdminAuth().verifyIdToken(token);
  const db = getAdminDb();
  const direct = await db.collection("users").doc(decoded.uid).get();
  let data = direct.exists ? direct.data() : undefined;
  if (data?.role !== "admin" && data?.role !== "super_admin") {
    const fallback = await db.collection("users").where("uid", "==", decoded.uid).limit(1).get();
    data = fallback.docs[0]?.data();
  }
  if (data?.role !== "admin" && data?.role !== "super_admin") throw new Error("FORBIDDEN");
  return decoded.uid;
}

function encryptSecret(value: string): string {
  const encodedKey = process.env.CASHFREE_CREDENTIALS_ENCRYPTION_KEY;
  if (!encodedKey) throw new Error("ENCRYPTION_KEY_NOT_CONFIGURED");
  const key = Buffer.from(encodedKey, "base64");
  if (key.length !== 32) throw new Error("ENCRYPTION_KEY_INVALID");
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return [iv.toString("base64"), cipher.getAuthTag().toString("base64"), encrypted.toString("base64")].join(".");
}

function authError(error: unknown) {
  const code = error instanceof Error ? error.message : "";
  const status = code === "UNAUTHORIZED" ? 401 : code === "FORBIDDEN" ? 403 : 500;
  if (status === 500) console.error("Cashfree settings API error:", code || "unknown");
  const message = status === 401 ? "Authentication required" : status === 403 ? "Admin access required" : "Cashfree settings could not be processed";
  return NextResponse.json({ success: false, message }, { status });
}

export async function GET(req: Request) {
  try {
    await verifyAdmin(req);
    const snap = await getAdminDb().collection("admin_settings").doc("cashfree").get();
    const data = snap.exists ? snap.data()! : {};
    return NextResponse.json({
      success: true,
      settings: {
        enabled: data.enabled === true,
        sandboxMode: data.sandboxMode !== false,
        appId: typeof data.appId === "string" ? data.appId : "",
        hasSecretKey: Boolean(data.secretKeyEncrypted),
        hasWebhookSecret: Boolean(data.webhookSecretEncrypted),
        paymentGatewayName: "Cashfree",
        autoSettlement: data.autoSettlement === true,
      },
    });
  } catch (error) { return authError(error); }
}

export async function PUT(req: Request) {
  try {
    const uid = await verifyAdmin(req);
    const body = await req.json();
    const appId = typeof body.appId === "string" ? body.appId.trim() : "";
    const secretKey = typeof body.secretKey === "string" ? body.secretKey : "";
    const webhookSecret = typeof body.webhookSecret === "string" ? body.webhookSecret : "";
    if (appId.length > 300 || secretKey.length > 2000 || webhookSecret.length > 2000) {
      return NextResponse.json({ success: false, message: "Invalid credential length" }, { status: 400 });
    }
    const update: Record<string, unknown> = {
      enabled: body.enabled === true,
      sandboxMode: body.sandboxMode !== false,
      appId,
      paymentGatewayName: "Cashfree",
      autoSettlement: body.autoSettlement === true,
      updatedAt: new Date(),
      updatedBy: uid,
    };
    if (secretKey.trim()) update.secretKeyEncrypted = encryptSecret(secretKey);
    if (webhookSecret.trim()) update.webhookSecretEncrypted = encryptSecret(webhookSecret);
    await getAdminDb().collection("admin_settings").doc("cashfree").set(update, { merge: true });
    return NextResponse.json({ success: true, message: "Settings saved. Secret values are never returned." });
  } catch (error) { return authError(error); }
}
