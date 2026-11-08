import { createDecipheriv, createHash, createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { getAdminDb } from "@/firebase/admin";

type CashfreeSettings = {
  appId?: unknown;
  secretKeyEncrypted?: unknown;
  webhookSecretEncrypted?: unknown;
  sandboxMode?: unknown;
  enabled?: unknown;
};

export type CashfreeConfig = {
  appId: string;
  secretKey: string;
  webhookSecret: string;
  sandboxMode: boolean;
  baseUrl: string;
};

export const CASHFREE_API_VERSION = "2026-01-01";

function decryptSecret(value: string): string {
  const encodedKey = process.env.CASHFREE_CREDENTIALS_ENCRYPTION_KEY;
  if (!encodedKey) throw new Error("CASHFREE_ENCRYPTION_KEY_MISSING");
  const key = Buffer.from(encodedKey, "base64");
  if (key.length !== 32) throw new Error("CASHFREE_ENCRYPTION_KEY_INVALID");

  const [ivText, tagText, encryptedText, extra] = value.split(".");
  if (!ivText || !tagText || !encryptedText || extra !== undefined) throw new Error("CASHFREE_CREDENTIAL_CIPHERTEXT_INVALID");
  const iv = Buffer.from(ivText, "base64");
  const tag = Buffer.from(tagText, "base64");
  const encrypted = Buffer.from(encryptedText, "base64");
  if (iv.length !== 12 || tag.length !== 16 || encrypted.length === 0) throw new Error("CASHFREE_CREDENTIAL_CIPHERTEXT_INVALID");

  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}

export async function getCashfreeConfig(options: { requireEnabled?: boolean } = {}): Promise<CashfreeConfig> {
  const snap = await getAdminDb().collection("admin_settings").doc("cashfree").get();
  if (!snap.exists) throw new Error("CASHFREE_NOT_CONFIGURED");
  const settings = snap.data() as CashfreeSettings;
  const enabledByEnvironment = process.env.CASHFREE_PAYMENTS_ENABLED === "true";
  const enabledByAdmin = settings.enabled === true;
  if (options.requireEnabled !== false && (!enabledByEnvironment || !enabledByAdmin)) {
    throw new Error("CASHFREE_DISABLED");
  }

  const appId = typeof settings.appId === "string" ? settings.appId.trim() : "";
  const secretCiphertext = typeof settings.secretKeyEncrypted === "string" ? settings.secretKeyEncrypted : "";
  const webhookCiphertext = typeof settings.webhookSecretEncrypted === "string" ? settings.webhookSecretEncrypted : "";
  if (!appId || !secretCiphertext || !webhookCiphertext) throw new Error("CASHFREE_CREDENTIALS_INCOMPLETE");

  const sandboxMode = settings.sandboxMode !== false;
  return {
    appId,
    secretKey: decryptSecret(secretCiphertext),
    webhookSecret: decryptSecret(webhookCiphertext),
    sandboxMode,
    baseUrl: sandboxMode ? "https://sandbox.cashfree.com/pg" : "https://api.cashfree.com/pg",
  };
}

export function deterministicUuid(seed: string): string {
  const hex = createHash("sha256").update(seed).digest("hex").slice(0, 32).split("");
  hex[12] = "4";
  hex[16] = ((parseInt(hex[16], 16) & 0x3) | 0x8).toString(16);
  const value = hex.join("");
  return `${value.slice(0, 8)}-${value.slice(8, 12)}-${value.slice(12, 16)}-${value.slice(16, 20)}-${value.slice(20)}`;
}

export async function cashfreeRequest<T>(
  config: CashfreeConfig,
  path: string,
  options: { method?: "GET" | "POST"; body?: unknown; idempotencyKey?: string } = {},
): Promise<T> {
  if (!path.startsWith("/") || path.includes("..")) throw new Error("CASHFREE_INVALID_PATH");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-api-version": CASHFREE_API_VERSION,
    "x-client-id": config.appId,
    "x-client-secret": config.secretKey,
    "x-request-id": randomUUID(),
  };
  if (options.idempotencyKey) headers["x-idempotency-key"] = options.idempotencyKey;

  const response = await fetch(`${config.baseUrl}${path}`, {
    method: options.method || "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  const raw = await response.text();
  let payload: unknown = null;
  try { payload = raw ? JSON.parse(raw) : null; } catch { /* provider error body is not trusted */ }
  if (!response.ok || !payload || typeof payload !== "object") {
    throw new Error(`CASHFREE_API_HTTP_${response.status}`);
  }
  return payload as T;
}

export function verifyCashfreeWebhookSignature(rawBody: string, timestamp: string, signature: string, secret: string): boolean {
  if (!timestamp || !signature || signature.length > 512) return false;
  const expected = createHmac("sha256", secret).update(timestamp, "utf8").update(rawBody, "utf8").digest("base64");
  const expectedBytes = Buffer.from(expected, "utf8");
  const receivedBytes = Buffer.from(signature, "utf8");
  return expectedBytes.length === receivedBytes.length && timingSafeEqual(expectedBytes, receivedBytes);
}

export function getPublicAppUrl(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  const vercel = process.env.VERCEL_URL?.trim();
  const candidate = configured || (vercel ? `https://${vercel}` : "http://localhost:3000");
  const parsed = new URL(candidate);
  if (parsed.protocol !== "https:" && parsed.hostname !== "localhost" && parsed.hostname !== "127.0.0.1") {
    throw new Error("CASHFREE_APP_URL_MUST_USE_HTTPS");
  }
  return parsed.origin;
}

