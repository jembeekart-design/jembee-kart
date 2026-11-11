import { NextResponse } from "next/server";
import { getMcpBaseUrl, getMcpResourceUrl } from "@/lib/mcp/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const issuer = getMcpBaseUrl();
  const resource = getMcpResourceUrl();
  if (!issuer || !resource) {
    return NextResponse.json({ error: "MCP_SERVER_BASE_URL is not configured" }, { status: 503 });
  }
  return NextResponse.json({
    resource,
    authorization_servers: [issuer],
    scopes_supported: ["videos:read", "uploads:read", "offline_access"],
    bearer_methods_supported: ["header"],
  }, { headers: { "Cache-Control": "public, max-age=300" } });
}
