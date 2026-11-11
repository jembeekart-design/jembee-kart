import { NextResponse } from "next/server";
import { getMcpBaseUrl, getMcpResourceUrl, isMcpEnabled, parseMcpScopes, resolveChatGptClient } from "@/lib/mcp/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function errorPage(message: string, status = 400) {
  return new NextResponse(`<!doctype html><html><head><meta charset="utf-8"><title>JEMBEE PLAY connection</title></head><body style="font-family:Arial,sans-serif;max-width:680px;margin:48px auto;padding:24px"><h1>ChatGPT connection could not start</h1><p>${message}</p><p>Return to JEMBEE PLAY Admin and try again.</p></body></html>`, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "Referrer-Policy": "no-referrer", "X-Content-Type-Options": "nosniff" },
  });
}

export async function GET(req: Request) {
  if (!(await isMcpEnabled())) return errorPage("ChatGPT integration is disabled by the JEMBEE PLAY administrator.", 403);
  const base = getMcpBaseUrl();
  const resource = getMcpResourceUrl();
  if (!base || !resource) return errorPage("MCP_SERVER_BASE_URL is not configured.", 503);

  const incoming = new URL(req.url);
  const p = incoming.searchParams;
  const clientId = p.get("client_id") || "";
  const redirectUri = p.get("redirect_uri") || "";
  const state = p.get("state") || "";
  const challenge = p.get("code_challenge") || "";
  const method = p.get("code_challenge_method") || "";
  const scope = parseMcpScopes(p.get("scope"));

  if (p.get("response_type") !== "code" || !clientId || clientId.length > 2048 || !/^[A-Za-z0-9_-]{43,128}$/.test(challenge) || method !== "S256" ||
      !scope || (!state || state.length > 1024) || p.get("resource") !== resource) {
    return errorPage("The OAuth request is incomplete or uses unsupported permissions. ChatGPT must use authorization code with PKCE S256 and the published resource URL.");
  }

  const client = await resolveChatGptClient(clientId);
  if (!client || !client.redirectUris.includes(redirectUri)) {
    return errorPage("ChatGPT client metadata or callback URL could not be verified.", 403);
  }

  const consent = new URL("/connect/chatgpt", base);
  consent.searchParams.set("client_id", clientId);
  consent.searchParams.set("client_name", client.clientName);
  consent.searchParams.set("redirect_uri", redirectUri);
  consent.searchParams.set("response_type", "code");
  consent.searchParams.set("code_challenge", challenge);
  consent.searchParams.set("code_challenge_method", "S256");
  consent.searchParams.set("scope", scope.join(" "));
  consent.searchParams.set("resource", resource);
  if (state) consent.searchParams.set("state", state);
  return NextResponse.redirect(consent, 302);
}
