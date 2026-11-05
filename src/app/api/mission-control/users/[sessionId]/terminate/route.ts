import { requireAdmin, isAdminIdentity } from "@/lib/server/requireAdmin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const adminIdentity = await requireAdmin(req);
  if (!isAdminIdentity(adminIdentity)) return adminIdentity;

  return NextResponse.json({
    success: false,
    code: "NOT_IMPLEMENTED",
    message: "This Mission Control action is not connected to a real provider/state change and is disabled.",
  }, { status: 501 });
}
