import { NextResponse } from "next/server";
import { getAdminDb } from "@/firebase/admin";
import { getMcpBaseUrl, getMcpEndpointUrl, getMcpSettings, verifyAdminRequest } from "@/lib/mcp/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await verifyAdminRequest(req);
    const settings = await getMcpSettings();
    const baseUrl = getMcpBaseUrl();
    return NextResponse.json({
      success: true,
      serverConfigured: Boolean(baseUrl),
      issuer: baseUrl,
      endpoint: getMcpEndpointUrl(),
      enabled: settings.enabled,
      accessMode: "read-only",
      scopes: ["videos:read", "uploads:read"],
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const status = error instanceof Error && error.message === "FORBIDDEN" ? 403 : error instanceof Error && error.message === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json({ success: false, message: status === 403 ? "Admin access required" : status === 401 ? "Unauthorized" : "Unable to load integration settings" }, { status });
  }
}

export async function POST(req: Request) {
  try {
    const uid = await verifyAdminRequest(req);
    const body = await req.json().catch(() => null) as { enabled?: unknown } | null;
    if (!body || typeof body.enabled !== "boolean") {
      return NextResponse.json({ success: false, message: "enabled must be a boolean" }, { status: 400 });
    }
    const baseUrl = getMcpBaseUrl();
    if (body.enabled && !baseUrl) {
      return NextResponse.json({
        success: false,
        message: "MCP_SERVER_BASE_URL must be configured as the canonical HTTPS site origin before enabling ChatGPT integration.",
      }, { status: 409 });
    }

    const db = getAdminDb();
    const ref = db.doc("integrationSettings/chatgpt");
    await db.runTransaction(async (tx) => {
      const current = await tx.get(ref);
      const currentData = current.data();
      const previouslyEnabled = currentData?.enabled === true;
      const previousEpoch = Number(currentData?.tokenEpoch || 0);
      const changed = previouslyEnabled !== body.enabled;
      tx.set(ref, {
        enabled: body.enabled,
        accessMode: "read-only",
        tokenEpoch: changed ? previousEpoch + 1 : previousEpoch,
        updatedAt: new Date(),
        updatedBy: uid,
      }, { merge: true });
    });

    return NextResponse.json({ success: true, enabled: body.enabled, endpoint: getMcpEndpointUrl() }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const status = error instanceof Error && error.message === "FORBIDDEN" ? 403 : error instanceof Error && error.message === "UNAUTHORIZED" ? 401 : 500;
    return NextResponse.json({ success: false, message: status === 403 ? "Admin access required" : status === 401 ? "Unauthorized" : "Unable to update ChatGPT integration" }, { status });
  }
}
