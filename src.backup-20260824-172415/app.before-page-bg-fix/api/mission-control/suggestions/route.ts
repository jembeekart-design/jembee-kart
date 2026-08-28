import { NextResponse } from "next/server";
import { generateSuggestions } from "@/mission-control/suggestions/suggestionEngine";

export async function GET() {
  try {
    const report = generateSuggestions();

    return NextResponse.json(report);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to generate suggestions.",
      },
      { status: 500 }
    );
  }
}
