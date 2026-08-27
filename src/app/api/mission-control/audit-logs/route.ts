import { NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/api/adminAuth";

export async function GET(req: Request) {
  return withAdminAuth(async () => {
    return NextResponse.json([
      {
        id: "1",
        action: "Mission Control Scan",
        user: "System",
        status: "success",
        createdAt: new Date().toISOString(),
      },
      {
        id: "2",
        action: "Deployment",
        user: "Admin",
        status: "success",
        createdAt: new Date().toISOString(),
      },
    ]);
  }, req);
}
