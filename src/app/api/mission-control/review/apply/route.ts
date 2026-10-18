import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/api/adminAuth";
import { applySelected } from "@/mission-control/review/applySelected";

export async function POST(request: NextRequest) {
  return withAdminAuth(async () => {
  try {
    const body = await request.json();
    const result = await applySelected(body.items ?? []);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to apply selected changes",
      },
      { status: 500 }
    );
  }
  }, request);
}
