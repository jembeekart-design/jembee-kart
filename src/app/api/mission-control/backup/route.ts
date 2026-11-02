import { requireAdmin, isAdminIdentity } from "@/lib/server/requireAdmin";
import { NextResponse } from "next/server";
import { createBackup } from "@/mission-control/backup/backupEngine";
import { withAdminAuth } from "@/lib/api/adminAuth";

export async function POST(req: Request) {
  const adminIdentity = await requireAdmin(req);
  if (!isAdminIdentity(adminIdentity)) return adminIdentity;

  return withAdminAuth(async () => {
    try {
      const result = createBackup();

      return NextResponse.json(result);
    } catch (error) {
      console.error(error);

      return NextResponse.json(
        {
          success: false,
          message: "Backup failed.",
        },
        { status: 500 }
      );
    }
  }, req);
}
