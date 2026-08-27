import { NextResponse } from "next/server";
import { reviewManager } from "@/mission-control/review/reviewManager";

export async function GET() {
  try {
    const report = await reviewManager.getReport();

    return NextResponse.json({
      success: true,
      ...report,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to generate review report.",
      },
      { status: 500 }
    );
  }
}
