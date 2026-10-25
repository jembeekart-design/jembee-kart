import { getAdminDb } from "@/firebase/admin";
import { decryptSecret } from "@/lib/server/secretEncryption";

export type QikinkConfig = { baseUrl: string; clientId: string; clientSecret: string };

/** Admin-configured encrypted credentials take priority; env vars remain a migration fallback. */
export async function getQikinkConfig(): Promise<QikinkConfig | null> {
  const snap = await getAdminDb().collection("integration_settings").doc("qikink").get();
  if (snap.exists) {
    const data = snap.data()!;
    if (typeof data.clientId === "string" && data.clientId && typeof data.clientSecretEncrypted === "string" && data.clientSecretEncrypted) {
      return {
        baseUrl: typeof data.baseUrl === "string" && data.baseUrl ? data.baseUrl.replace(/\/+$/, "") : "https://api.qikink.com",
        clientId: data.clientId,
        clientSecret: decryptSecret(data.clientSecretEncrypted),
      };
    }
  }
  const baseUrl = process.env.QIKINK_BASE_URL;
  const clientId = process.env.QIKINK_CLIENT_ID;
  const clientSecret = process.env.QIKINK_CLIENT_SECRET;
  return baseUrl && clientId && clientSecret ? { baseUrl: baseUrl.replace(/\/+$/, ""), clientId, clientSecret } : null;
}
