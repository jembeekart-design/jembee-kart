import { NextResponse } from "next/server";
import { createOpaqueToken, getMcpResourceUrl, getMcpSettings, hashOpaqueToken, oauthClientDocId, isAdminUid, noStoreHeaders, verifyPkceS256 } from "@/lib/mcp/security";
import { getAdminDb } from "@/firebase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ACCESS_TTL_MS = 60 * 60 * 1000;
const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function fail(error: string, description: string, status = 400) {
  return NextResponse.json({ error, error_description: description }, { status, headers: noStoreHeaders() });
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  if (rawBody.length > 16_384) return fail("invalid_request", "The OAuth request is too large.");
  const form = new URLSearchParams(rawBody);
  const grantType = form.get("grant_type") || "";
  const clientId = form.get("client_id") || "";
  const resource = form.get("resource") || "";
  const expectedResource = getMcpResourceUrl();
  if (!expectedResource || resource !== expectedResource) return fail("invalid_target", "The resource parameter must match the registered JEMBEE PLAY MCP endpoint.");
  if (!clientId || clientId.length > 2048) return fail("invalid_client", "A registered public client_id is required.", 401);

  const db = getAdminDb();
  const clientSnap = await db.collection("mcpOAuthClients").doc(oauthClientDocId(clientId)).get();
  const clientData = clientSnap.data();
  if (!clientSnap.exists || !clientData) return fail("invalid_client", "The OAuth client is not registered.", 401);
  const registeredGrants = Array.isArray(clientData.grantTypes) ? clientData.grantTypes : [];
  if (!registeredGrants.includes(grantType)) return fail("unauthorized_client", "This grant type was not registered for this OAuth client.", 401);
  const settings = await getMcpSettings();
  if (!settings.enabled) return fail("temporarily_unavailable", "ChatGPT integration is disabled.", 503);

  const accessToken = createOpaqueToken(32);
  const refreshToken = createOpaqueToken(48);
  const now = Date.now();

  if (grantType === "authorization_code") {
    const familyId = createOpaqueToken(18);
    const code = form.get("code") || "";
    const redirectUri = form.get("redirect_uri") || "";
    const verifier = form.get("code_verifier") || "";
    if (!code || !redirectUri || !verifier) return fail("invalid_request", "code, redirect_uri and code_verifier are required.");
    const codeRef = db.collection("mcpOAuthCodes").doc(hashOpaqueToken(code));
    try {
      await db.runTransaction(async (tx) => {
        const snapshot = await tx.get(codeRef);
        const data = snapshot.data();
        if (!snapshot.exists || !data || Number(data.expiresAtMs) <= now) throw new Error("INVALID_GRANT");
        if (data.clientId !== clientId || data.redirectUri !== redirectUri || data.resource !== resource ||
            Number(data.tokenEpoch) !== settings.tokenEpoch || !verifyPkceS256(verifier, String(data.codeChallenge || ""))) {
          throw new Error("INVALID_GRANT");
        }
        tx.delete(codeRef);
        const tokenRecord = {
          uid: data.uid,
          clientId,
          familyId,
          scopes: data.scope,
          resource,
          tokenEpoch: settings.tokenEpoch,
          expiresAtMs: now + ACCESS_TTL_MS,
          createdAtMs: now,
        };
        tx.create(db.collection("mcpOAuthAccessTokens").doc(hashOpaqueToken(accessToken)), tokenRecord);
        tx.create(db.collection("mcpOAuthRefreshTokens").doc(hashOpaqueToken(refreshToken)), {
          ...tokenRecord,
          expiresAtMs: now + REFRESH_TTL_MS,
        });
      });
    } catch {
      return fail("invalid_grant", "The authorization code is invalid, expired, already used, or failed PKCE verification.");
    }
  } else if (grantType === "refresh_token") {
    const suppliedRefreshToken = form.get("refresh_token") || "";
    if (!suppliedRefreshToken) return fail("invalid_request", "refresh_token is required.");
    const refreshRef = db.collection("mcpOAuthRefreshTokens").doc(hashOpaqueToken(suppliedRefreshToken));
    const existing = await refreshRef.get();
    const data = existing.data();
    if (!existing.exists || !data || data.clientId !== clientId || data.resource !== resource || Number(data.expiresAtMs) <= now) {
      return fail("invalid_grant", "The refresh token is invalid or expired.");
    }
    if (Number(data.tokenEpoch) !== settings.tokenEpoch || !(await isAdminUid(String(data.uid || "")))) {
      await refreshRef.delete().catch(() => undefined);
      return fail("invalid_grant", "The administrator authorization is no longer valid.");
    }
    try {
      await db.runTransaction(async (tx) => {
        const latest = await tx.get(refreshRef);
        const latestData = latest.data();
        if (!latest.exists || !latestData || Number(latestData.expiresAtMs) <= Date.now() || latestData.clientId !== clientId) {
          throw new Error("INVALID_GRANT");
        }
        tx.delete(refreshRef);
        const tokenRecord = {
          uid: latestData.uid,
          clientId,
          familyId: latestData.familyId,
          scopes: latestData.scopes,
          resource,
          tokenEpoch: settings.tokenEpoch,
          createdAtMs: Date.now(),
        };
        tx.create(db.collection("mcpOAuthAccessTokens").doc(hashOpaqueToken(accessToken)), {
          ...tokenRecord,
          expiresAtMs: Date.now() + ACCESS_TTL_MS,
        });
        tx.create(db.collection("mcpOAuthRefreshTokens").doc(hashOpaqueToken(refreshToken)), {
          ...tokenRecord,
          expiresAtMs: Date.now() + REFRESH_TTL_MS,
        });
      });
    } catch {
      return fail("invalid_grant", "The refresh token has already been used or is no longer valid.");
    }
  } else {
    return fail("unsupported_grant_type", "Only authorization_code and refresh_token grants are supported.");
  }

  const accessDoc = await db.collection("mcpOAuthAccessTokens").doc(hashOpaqueToken(accessToken)).get();
  const scopes = Array.isArray(accessDoc.data()?.scopes) ? accessDoc.data()?.scopes.join(" ") : "";
  return NextResponse.json({
    access_token: accessToken,
    token_type: "Bearer",
    expires_in: Math.floor(ACCESS_TTL_MS / 1000),
    refresh_token: refreshToken,
    scope: scopes,
    resource,
  }, { headers: noStoreHeaders() });
}
