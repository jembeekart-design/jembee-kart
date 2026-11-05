import { NextResponse } from "next/server";
import { requireAdmin, isAdminIdentity } from "@/lib/server/requireAdmin";

export async function GET(req: Request) {
  const identity = await requireAdmin(req);
  if (!isAdminIdentity(identity)) return identity;
  return NextResponse.json({ success: false, demo: true, code: "NOT_CONNECTED", message: "Mission Control notifications are not connected to a persistent notification source." }, { status: 501 });
}
