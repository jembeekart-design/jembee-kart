import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    {
      id: "deploy-1",
      status: "ready",
      branch: "main",
      commit: "latest",
      environment: "production",
      deployedAt: new Date().toISOString(),
    },
  ]);
}
