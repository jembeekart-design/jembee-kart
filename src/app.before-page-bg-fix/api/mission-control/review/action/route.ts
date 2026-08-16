import { NextRequest, NextResponse } from "next/server";
import { reviewManager } from "@/mission-control/review/reviewManager";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { action, item } = body;

    if (action === "approve") {
      return NextResponse.json({
        success: true,
        item: reviewManager.approve(item),
      });
    }

    if (action === "reject") {
      return NextResponse.json({
        success: true,
        item: reviewManager.reject(item),
      });
    }

    return NextResponse.json(
      {
        success: false,
        message: "Invalid action.",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Review action failed.",
      },
      { status: 500 }
    );
  }
}
