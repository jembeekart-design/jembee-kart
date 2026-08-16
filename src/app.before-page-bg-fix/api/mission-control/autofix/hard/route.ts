import { NextRequest, NextResponse } from "next/server";
import { hardAutoFix } from "@/mission-control/autofix/hardAutoFix";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

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
}
