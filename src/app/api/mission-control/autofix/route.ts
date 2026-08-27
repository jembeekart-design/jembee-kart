import { NextResponse } from "next/server";
import { previewAstFix } from "@/mission-control/autofix/astAutoFix";
import { withAdminAuth } from "@/lib/api/adminAuth";

export async function POST(req: Request) {
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
