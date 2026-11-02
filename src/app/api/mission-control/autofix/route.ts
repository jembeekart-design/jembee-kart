import { requireAdmin, isAdminIdentity } from "@/lib/server/requireAdmin";
import { NextResponse } from "next/server";
import { previewAstFix } from "@/mission-control/autofix/astAutoFix";
import { withAdminAuth } from "@/lib/api/adminAuth";

export async function POST(req: Request) {
  const adminIdentity = await requireAdmin(req);
  if (!isAdminIdentity(adminIdentity)) return adminIdentity;

  return withAdminAuth(async () => {
    try {
      const result = await previewAstFix();
      return NextResponse.json(result);
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        {
          success: false,
          message: "Auto Fix failed.",
        },
        { status: 500 }
      );
    }
  }, req);
}
