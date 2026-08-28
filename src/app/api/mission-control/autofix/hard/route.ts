import { NextRequest, NextResponse } from "next/server";
import { hardAutoFix } from "@/mission-control/autofix/hardAutoFix";
import { withAdminAuth } from "@/lib/api/adminAuth";

export async function POST(req: NextRequest) {
  return withAdminAuth(async (req: NextRequest) => {
    try {
      const body = await req.json();

      const result = await hardAutoFix(body.items ?? []);

      return NextResponse.json(result);
    } catch (error) {
      console.error(error);

      return NextResponse.json(
        {
          success: false,
          message: "Hard Auto Fix failed.",
        },
        { status: 500 }
      );
    }
  }, req);
}
