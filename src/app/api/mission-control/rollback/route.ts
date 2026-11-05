import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, isAdminIdentity } from "@/lib/server/requireAdmin";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const identity = await requireAdmin(req);
  if (!isAdminIdentity(identity)) return identity;
  if (identity.role !== "super_admin") {
    return NextResponse.json({ success: false, message: "Super-admin access required" }, { status: 403 });
  }
  // Restore is intentionally disabled until backups are addressed by a server-owned
  // backup ID, signed manifest, staging directory, and atomic recovery workflow.
  return NextResponse.json({ success: false, message: "Rollback is temporarily disabled pending secure backup-ID restore implementation." }, { status: 501 });
}
