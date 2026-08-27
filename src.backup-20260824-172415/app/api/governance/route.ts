import { NextResponse } from "next/server";
import { governanceEngine } from "@/jembee-governance";

export async function GET() {
  try {
    console.log("API HIT", new Date().toISOString()); // 👈 Ye line add karo
    const report = await governanceEngine.run();

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
