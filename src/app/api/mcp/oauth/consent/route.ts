import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { getAdminDb } from "@/firebase/admin";
import {
  createOpaqueToken,
  getMcpBaseUrl,
  getMcpResourceUrl,
  isMcpEnabled,
  isValidHttpsRedirectUri,
  parseMcpScopes,
  verifyFirebaseAdminToken,
  resolveChatGptClient,
} from "@/lib/mcp/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!(await isMcpEnabled())) return NextResponse.json({ success: false, message: "ChatGPT integration is disabled" }, { status: 404 });
  const url = new URL(req.url);
  const clientId = url.searchParams.get("client_id") || "";
  const client = await resolveChatGptClient(clientId);
  if (!client) return NextResponse.json({ success: false, message: "ChatGPT client metadata could not be verified" }, { status: 403 });
  return NextResponse.json({ success: true, clientName: client.clientName }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  if (rawBody.length > 16_384) return NextResponse.json({ success: false, message: "OAuth consent request is too large" }, { status: 413 });
  let parsed: unknown = null;
  try { parsed = JSON.parse(rawBody); } catch { /* validation below returns 400 */ }
  const body = parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed as Record<string, unknown> : null;
  if (!body || typeof body.client_id !== "string" || typeof body.redirect_uri !== "string" ||
      typeof body.code_challenge !== "string" || body.code_challenge_method !== "S256" ||
      typeof body.resource !== "string") {
    return NextResponse.json({ success: false, message: "Invalid OAuth consent request" }, { status: 400 });
  }
  if (!(await isMcpEnabled())) return NextResponse.json({ success: false, message: "ChatGPT integration is disabled" }, { status: 403 });

  const base = getMcpBaseUrl();
  const resource = getMcpResourceUrl();
  const clientId = body.client_id;
  const redirectUri = body.redirect_uri;
  const state = typeof body.state === "string" && body.state.length > 0 && body.state.length <= 1024 ? body.state : "";
  const scopes = parseMcpScopes(typeof body.scope === "string" ? body.scope : "");
  const challenge = body.code_challenge;

  if (!base || !resource || body.resource !== resource || !isValidHttpsRedirectUri(redirectUri) ||
      !/^[A-Za-z0-9_-]{43,128}$/.test(challenge) || !scopes || !state || clientId.length > 2048) {
    return NextResponse.json({ success: false, message: "OAuth request failed validation" }, { status: 400 });
  }

  const client = await resolveChatGptClient(clientId);
  if (!client || !client.redirectUris.includes(redirectUri)) {
    return NextResponse.json({ success: false, message: "ChatGPT client metadata or callback URL could not be verified" }, { status: 403 });
  }

  const callback = new URL(redirectUri);
  callback.searchParams.set("iss", base);
  if (state) callback.searchParams.set("state", state);

  if (body.approved !== true) {
    callback.searchParams.set("error", "access_denied");
    callback.searchParams.set("error_description", "The JEMBEE PLAY administrator denied access.");
    return NextResponse.json({ success: true, redirectUrl: callback.toString() }, { headers: { "Cache-Control": "no-store" } });
  }

  const authorization = req.headers.get("authorization") || "";
  if (!authorization.startsWith("Bearer ")) {
    return NextResponse.json({ success: false, message: "Please sign in with a JEMBEE PLAY administrator account" }, { status: 401 });
  }
  let uid: string;
  try {
    uid = await verifyFirebaseAdminToken(authorization.slice(7).trim());
  } catch (error) {
    const status = error instanceof Error && error.message === "FORBIDDEN" ? 403 : 401;
    return NextResponse.json({ success: false, message: status === 403 ? "Only JEMBEE PLAY admins can authorize ChatGPT" : "Your admin session has expired. Sign in again." }, { status });
  }

  const code = createOpaqueToken(32);
  const settingsSnap = await getAdminDb().doc("integrationSettings/chatgpt").get();
  const tokenEpoch = Number(settingsSnap.data()?.tokenEpoch || 0);
  await getAdminDb().collection("mcpOAuthCodes").doc(createHash("sha256").update(code).digest("hex")).create({
    uid,
    clientId,
    redirectUri,
    codeChallenge: challenge,
    scope: scopes,
    resource,
    tokenEpoch,
    expiresAtMs: Date.now() + 5 * 60 * 1000,
    createdAtMs: Date.now(),
  });

  callback.searchParams.set("code", code);
  return NextResponse.json({ success: true, redirectUrl: callback.toString() }, { headers: { "Cache-Control": "no-store" } });
}
