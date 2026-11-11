import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";

export const MCP_SCOPES = ["videos:read", "uploads:read", "offline_access"] as const;
export type McpScope = (typeof MCP_SCOPES)[number];

export const MCP_RESOURCE_PATH = "/api/mcp";
export const MCP_SETTINGS_PATH = "integrationSettings/chatgpt";
export const MCP_PROTOCOL_VERSIONS = [
  "2026-07-28",
  "2025-11-25",
  "2025-06-18",
  "2025-03-26",
  "2024-11-05",
] as const;

export type McpSettings = { enabled: boolean; tokenEpoch: number };

export function getMcpBaseUrl(): string | null {
  const raw = process.env.MCP_SERVER_BASE_URL?.trim();
  if (!raw) return null;

  try {
    const url = new URL(raw);
    const isLocal = process.env.NODE_ENV !== "production" &&
      (url.hostname === "localhost" || url.hostname === "127.0.0.1");
    if (
      (url.protocol !== "https:" && !(isLocal && url.protocol === "http:")) ||
      url.username || url.password || url.pathname !== "/" || url.search || url.hash
    ) return null;
    return url.origin;
  } catch {
    return null;
  }
}

export function getMcpIssuer(): string | null {
  return getMcpBaseUrl();
}

export function getMcpResourceUrl(): string | null {
  // Use the canonical HTTPS origin as the OAuth resource identifier.
  // The actual Streamable HTTP transport lives at /api/mcp.
  return getMcpBaseUrl();
}

export function getMcpEndpointUrl(): string | null {
  const base = getMcpBaseUrl();
  return base ? `${base}${MCP_RESOURCE_PATH}` : null;
}

export function hashOpaqueToken(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

export function createOpaqueToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

export function safeEqual(left: string, right: string): boolean {
  const a = Buffer.from(left, "utf8");
  const b = Buffer.from(right, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

export function verifyPkceS256(verifier: string, challenge: string): boolean {
  if (!/^[A-Za-z0-9._~-]{43,128}$/.test(verifier)) return false;
  const expected = createHash("sha256").update(verifier, "ascii").digest("base64url");
  return safeEqual(expected, challenge);
}

export function parseMcpScopes(raw: string | null | undefined): McpScope[] | null {
  const requested = (raw || "videos:read uploads:read offline_access")
    .split(/\s+/)
    .map((scope) => scope.trim())
    .filter(Boolean);
  if (requested.length === 0 || requested.length > MCP_SCOPES.length) return null;
  if (requested.some((scope) => !MCP_SCOPES.includes(scope as McpScope))) return null;
  return [...new Set(requested)] as McpScope[];
}

export function isValidHttpsRedirectUri(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password && !url.hash;
  } catch {
    return false;
  }
}

export function oauthClientDocId(clientId: string): string {
  return hashOpaqueToken(clientId);
}

export type VerifiedChatGptClient = {
  clientId: string;
  clientName: string;
  redirectUris: string[];
  grantTypes: string[];
  tokenEndpointAuthMethod: "none";
};

function isChatGptCallbackUri(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.origin === "https://chatgpt.com" &&
      !url.username && !url.password && !url.search && !url.hash &&
      (/^\/connector\/oauth\/[^/]+$/.test(url.pathname) || url.pathname === "/connector_platform_oauth_redirect");
  } catch {
    return false;
  }
}

/**
 * Validate ChatGPT's HTTPS Client ID Metadata Document (CIMD).
 * The only permitted metadata host is chatgpt.com and redirects must be
 * ChatGPT's documented connector callback paths. Redirects are never followed.
 */
export async function resolveChatGptClient(clientId: string): Promise<VerifiedChatGptClient | null> {
  if (!clientId || clientId.length > 2048) return null;
  let clientUrl: URL;
  try {
    clientUrl = new URL(clientId);
  } catch {
    return null;
  }
  if (clientUrl.protocol !== "https:" || clientUrl.origin !== "https://chatgpt.com" ||
      !clientUrl.pathname.startsWith("/oauth/") || !clientUrl.pathname.endsWith("/client.json") ||
      clientUrl.search || clientUrl.hash || clientUrl.username || clientUrl.password) return null;

  const db = getAdminDb();
  const clientRef = db.collection("mcpOAuthClients").doc(oauthClientDocId(clientId));
  const cached = await clientRef.get();
  const cachedData = cached.data();
  if (cached.exists && Number(cachedData?.cacheExpiresAtMs) > Date.now() &&
      Array.isArray(cachedData?.redirectUris) && typeof cachedData?.clientName === "string") {
    return {
      clientId,
      clientName: cachedData.clientName,
      redirectUris: cachedData.redirectUris,
      grantTypes: ["authorization_code", "refresh_token"],
      tokenEndpointAuthMethod: "none",
    };
  }

  let response: Response;
  try {
    response = await fetch(clientUrl, {
      method: "GET",
      redirect: "error",
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    return null;
  }
  if (!response.ok) return null;
  const contentLength = Number(response.headers.get("content-length") || 0);
  if (contentLength > 16000) return null;
  const raw = await response.text();
  if (raw.length > 16000) return null;
  let metadata: Record<string, unknown>;
  try {
    metadata = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return null;
  }
  const methods = metadata.token_endpoint_auth_methods_supported;
  const redirectUris = metadata.redirect_uris;
  const grantTypes = metadata.grant_types;
  const responseTypes = metadata.response_types;
  if (metadata.client_id !== clientId || !Array.isArray(methods) || !methods.includes("none") ||
      !Array.isArray(grantTypes) || !grantTypes.includes("authorization_code") || !grantTypes.includes("refresh_token") ||
      !Array.isArray(responseTypes) || !responseTypes.includes("code") ||
      !Array.isArray(redirectUris) || redirectUris.length < 1 || redirectUris.length > 8 ||
      redirectUris.some((uri) => typeof uri !== "string" || !isChatGptCallbackUri(uri))) return null;

  const clientName = typeof metadata.client_name === "string" ? metadata.client_name.slice(0, 120) : "ChatGPT";
  const resolved = {
    clientId,
    clientName,
    redirectUris: redirectUris as string[],
    grantTypes: ["authorization_code", "refresh_token"],
    tokenEndpointAuthMethod: "none" as const,
  };
  await clientRef.set({
    ...resolved,
    cacheExpiresAtMs: Date.now() + 5 * 60 * 1000,
    metadataVerifiedAtMs: Date.now(),
  }, { merge: true });
  return resolved;
}

export async function getMcpSettings(): Promise<McpSettings> {
  const snapshot = await getAdminDb().doc(MCP_SETTINGS_PATH).get();
  const data = snapshot.data();
  return {
    enabled: data?.enabled === true,
    tokenEpoch: Number.isSafeInteger(data?.tokenEpoch) && Number(data?.tokenEpoch) >= 0
      ? Number(data?.tokenEpoch)
      : 0,
  };
}

export async function isMcpEnabled(): Promise<boolean> {
  const settings = await getMcpSettings();
  return settings.enabled;
}

export async function isAdminUid(uid: string): Promise<boolean> {
  if (!uid || uid.length > 128) return false;
  const users = getAdminDb().collection("users");
  const direct = await users.doc(uid).get();
  let data = direct.exists ? direct.data() : undefined;
  if (data?.role !== "admin" && data?.role !== "super_admin") {
    const fallback = await users.where("uid", "==", uid).limit(1).get();
    data = fallback.docs[0]?.data();
  }
  return data?.role === "admin" || data?.role === "super_admin";
}

export async function verifyFirebaseAdminToken(token: string): Promise<string> {
  if (!token || token.length > 10000) throw new Error("UNAUTHORIZED");
  let decoded;
  try {
    decoded = await getAdminAuth().verifyIdToken(token, true);
  } catch {
    throw new Error("UNAUTHORIZED");
  }
  if (!(await isAdminUid(decoded.uid))) throw new Error("FORBIDDEN");
  return decoded.uid;
}

export async function verifyAdminRequest(req: Request): Promise<string> {
  const header = req.headers.get("authorization") || "";
  if (!header.startsWith("Bearer ")) throw new Error("UNAUTHORIZED");
  return verifyFirebaseAdminToken(header.slice(7).trim());
}

export type McpAccessIdentity = {
  uid: string;
  clientId: string;
  scopes: McpScope[];
  familyId: string;
  tokenEpoch: number;
};

export async function verifyMcpAccessToken(token: string): Promise<McpAccessIdentity | null> {
  if (!token || token.length > 512) return null;
  const db = getAdminDb();
  const snapshot = await db.collection("mcpOAuthAccessTokens").doc(hashOpaqueToken(token)).get();
  if (!snapshot.exists) return null;
  const data = snapshot.data();
  const expiresAtMs = Number(data?.expiresAtMs);
  if (!data || !Number.isFinite(expiresAtMs) || expiresAtMs <= Date.now()) return null;
  if (data.resource !== getMcpResourceUrl()) return null;
  if (typeof data.uid !== "string" || typeof data.clientId !== "string") return null;
  const settings = await getMcpSettings();
  if (!settings.enabled || Number(data.tokenEpoch) !== settings.tokenEpoch) return null;
  if (!(await isAdminUid(data.uid))) return null;
  const scopes = Array.isArray(data.scopes)
    ? data.scopes.filter((scope): scope is McpScope => MCP_SCOPES.includes(scope as McpScope))
    : [];
  if (!scopes.length) return null;
  return {
    uid: data.uid,
    clientId: data.clientId,
    scopes,
    familyId: typeof data.familyId === "string" ? data.familyId : "",
    tokenEpoch: settings.tokenEpoch,
  };
}

export function oauthError(error: string, description: string, status = 400) {
  return Response.json(
    { error, error_description: description },
    { status, headers: { "Cache-Control": "no-store", Pragma: "no-cache" } }
  );
}

export function noStoreHeaders(): HeadersInit {
  return { "Cache-Control": "no-store", Pragma: "no-cache", "X-Content-Type-Options": "nosniff" };
}
