import { NextResponse } from "next/server";
import { getCashfreeConfig } from "@/lib/payments/cashfree";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const config = await getCashfreeConfig();
    return NextResponse.json({ enabled: true, sandboxMode: config.sandboxMode }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ enabled: false, sandboxMode: true }, { headers: { "Cache-Control": "no-store" } });
  }
}
