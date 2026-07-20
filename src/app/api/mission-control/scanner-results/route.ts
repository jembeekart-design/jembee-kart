import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    {
      id: "security",
      name: "Security Scanner",
      status: "healthy",
      duration: "1.4s",
      lastRun: new Date().toISOString(),
    },
    {
      id: "firestore",
      name: "Firestore Scanner",
      status: "healthy",
      duration: "0.8s",
      lastRun: new Date().toISOString(),
    },
    {
      id: "governance",
      name: "Governance Scanner",
      status: "healthy",
      duration: "2.3s",
      lastRun: new Date().toISOString(),
    },
  ]);
}
