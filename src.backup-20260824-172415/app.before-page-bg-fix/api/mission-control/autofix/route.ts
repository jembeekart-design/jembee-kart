import { NextResponse } from "next/server";
import { previewAstFix } from "@/mission-control/autofix/astAutoFix";

export async function POST() {
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
}
