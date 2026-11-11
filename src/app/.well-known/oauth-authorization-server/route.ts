import { NextResponse } from "next/server";
import { getMcpBaseUrl } from "@/lib/mcp/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const issuer = getMcpBaseUrl();
  if (!issuer) {
    return NextResponse.json({ error: "MCP_SERVER_BASE_URL is not configured" }, { status: 503 });
  }
  return NextResponse.json({
    issuer,
    authorization_response_iss_parameter_supported: true,
    authorization_endpoint: `${issuer}/oauth/authorize`,
    token_endpoint: `${issuer}/oauth/token`,
    client_id_metadata_document_supported: true,
    revocation_endpoint: `${issuer}/oauth/revoke`,
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code", "refresh_token"],
    token_endpoint_auth_methods_supported: ["none"],
    revocation_endpoint_auth_methods_supported: ["none"],
    code_challenge_methods_supported: ["S256"],
    scopes_supported: ["videos:read", "uploads:read", "offline_access"],
  }, { headers: { "Cache-Control": "public, max-age=300" } });
}
