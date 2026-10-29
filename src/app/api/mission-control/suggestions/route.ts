import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/api/adminAuth";
import { generateSuggestions } from "@/mission-control/suggestions/suggestionEngine";

export async function GET(request: NextRequest) {
  return withAdminAuth(async () => {
    try {
      return NextResponse.json(generateSuggestions());
    } catch (error) {
      console.error("Mission-control suggestion generation failed:", error);
      return NextResponse.json({ success: false, message: "Failed to generate suggestions." }, { status: 500 });
    }
  }, request);
}
