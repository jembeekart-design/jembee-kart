import { requireAdmin, isAdminIdentity } from "@/lib/server/requireAdmin";
import { NextRequest, NextResponse } from "next/server";
import { reviewManager } from "@/mission-control/review/reviewManager";

export async function POST(request: NextRequest) {
  const adminIdentity = await requireAdmin(request);
  if (!isAdminIdentity(adminIdentity)) return adminIdentity;

  return NextResponse.json({
    success: false,
    code: "NOT_IMPLEMENTED",
    message: "Mission Control review actions are not backed by persistent storage and are disabled.",
  }, { status: 501 });
}
