import { NextRequest, NextResponse } from "next/server";
import { hardAutoFix } from "@/mission-control/autofix/hardAutoFix";
import { withAdminAuth } from "@/lib/api/adminAuth";
import { readBoundedJson } from "@/lib/server/readBoundedJson";

export async function POST(request: NextRequest) {
  return withAdminAuth(async (req: NextRequest) => {
    const parsed = await readBoundedJson(req, 64 * 1024);
    if (!parsed.ok) {
      return NextResponse.json({ success: false, message: parsed.message }, { status: parsed.status });
    }
    if (!parsed.value || typeof parsed.value !== "object" || Array.isArray(parsed.value)) {
      return NextResponse.json({ success: false, message: "Request body must be an object." }, { status: 400 });
    }
    const items = (parsed.value as { items?: unknown }).items;
    if (!Array.isArray(items) || items.length > 100 || items.some((item) => !item || typeof item !== "object" || Array.isArray(item) || typeof (item as { id?: unknown }).id !== "string")) {
      return NextResponse.json({ success: false, message: "Items must be an array of at most 100 review items." }, { status: 400 });
    }
    try {
      return NextResponse.json(await hardAutoFix(items as Parameters<typeof hardAutoFix>[0]));
    } catch (error) {
      console.error("Mission-control hard auto-fix failed:", error);
      return NextResponse.json({ success: false, message: "Hard Auto Fix failed." }, { status: 500 });
    }
  }, request);
}
