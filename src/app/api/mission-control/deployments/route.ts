import { NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/api/adminAuth";

export async function GET(req: Request) {
  return withAdminAuth(async () => {
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
  }, req);
}
