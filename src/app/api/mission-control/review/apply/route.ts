import { NextRequest, NextResponse } from "next/server";
import { applySelected } from "@/mission-control/review/applySelected";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = await applySelected(body.items ?? []);

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Apply Selected failed.",
      },
      { status: 500 }
    );
  }
}
