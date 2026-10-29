import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/api/adminAuth";
import { readBoundedJson } from "@/lib/server/readBoundedJson";
import { reviewManager } from "@/mission-control/review/reviewManager";

export async function POST(request: NextRequest) {
  return withAdminAuth(async (req: NextRequest) => {
    const parsed = await readBoundedJson(req, 16 * 1024);
    if (!parsed.ok) {
      return NextResponse.json({ success: false, message: parsed.message }, { status: parsed.status });
    }
    if (!parsed.value || typeof parsed.value !== "object" || Array.isArray(parsed.value)) {
      return NextResponse.json({ success: false, message: "Request body must be an object." }, { status: 400 });
    }

    const body = parsed.value as { action?: unknown; item?: unknown };
    const action = body.action;
    const item = body.item;
    if (action !== "approve" && action !== "reject") {
      return NextResponse.json({ success: false, message: "Invalid action." }, { status: 400 });
    }
    if (!item || typeof item !== "object" || Array.isArray(item) || typeof (item as { id?: unknown }).id !== "string" || !(item as { id: string }).id.trim() || (item as { id: string }).id.length > 200) {
      return NextResponse.json({ success: false, message: "Invalid review item." }, { status: 400 });
    }

    const reviewItem = item as Parameters<typeof reviewManager.approve>[0];
    return NextResponse.json({
      success: true,
      item: action === "approve" ? reviewManager.approve(reviewItem) : reviewManager.reject(reviewItem),
    });
  }, request);
}
