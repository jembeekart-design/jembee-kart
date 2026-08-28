import { NextResponse } from "next/server";

export async function PATCH() {
  return NextResponse.json({
    success: true,
    message: "Feature flag updated successfully.",
    updatedAt: new Date().toISOString(),
  });
}
