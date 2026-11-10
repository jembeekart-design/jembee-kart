import { NextResponse } from "next/server";
import { verifyMonetagAdmin } from "@/lib/server/monetagAdminAuth";
import { readBoundedJson } from "@/lib/server/readBoundedJson";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await verifyMonetagAdmin(req);
    return NextResponse.json(
      { success: true, enabled: false, mode: "MANUAL_PLACEMENTS_ONLY" },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    const status = code === "UNAUTHORIZED" ? 401 : code === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json(
      { success: false, message: status === 401 ? "कृपया Admin में लॉगिन करें।" : status === 403 ? "केवल Admin यह सेटिंग देख सकता है।" : "Monetag setting उपलब्ध नहीं है।" },
      { status }
    );
  }
}

export async function PUT(req: Request) {
  try {
    await verifyMonetagAdmin(req);
    const parsed = await readBoundedJson(req, 4096);
    if (!parsed.ok) return NextResponse.json({ success: false, message: parsed.message }, { status: parsed.status });
    const value = parsed.value;
    if (!value || typeof value !== "object" || Array.isArray(value) || typeof (value as { enabled?: unknown }).enabled !== "boolean") {
      return NextResponse.json({ success: false, message: "enabled must be true or false." }, { status: 400 });
    }
    if ((value as { enabled: boolean }).enabled) {
      return NextResponse.json(
        { success: false, enabled: false, message: "Global Monetag auto placements are disabled. Use an Admin-selected Direct Link placement instead." },
        { status: 409, headers: { "Cache-Control": "no-store" } }
      );
    }
    return NextResponse.json(
      { success: true, enabled: false, mode: "MANUAL_PLACEMENTS_ONLY" },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    const status = code === "UNAUTHORIZED" ? 401 : code === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json(
      { success: false, message: status === 401 ? "कृपया Admin में लॉगिन करें।" : status === 403 ? "केवल Admin यह सेटिंग बदल सकता है।" : "Monetag setting सेव नहीं हुई।" },
      { status }
    );
  }
}
