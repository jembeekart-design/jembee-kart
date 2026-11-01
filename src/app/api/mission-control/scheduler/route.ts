import { NextResponse } from "next/server";
import { requireAdmin, isAdminIdentity } from "@/lib/server/requireAdmin";

export async function GET(req: Request) {
  const adminIdentity = await requireAdmin(req);
  if (!isAdminIdentity(adminIdentity)) return adminIdentity;
  return NextResponse.json({ success: false, demo: true, code: "NOT_CONNECTED", message: "Scheduler status is not connected to a persistent job provider." }, { status: 501 });
}
