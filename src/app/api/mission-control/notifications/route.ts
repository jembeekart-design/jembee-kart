import { NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/api/adminAuth";

export async function GET(req: Request) {
  return withAdminAuth(async () => {
    return NextResponse.json([
      {
        id: "1",
        title: "Build Completed",
        message: "Production build completed successfully.",
        type: "success",
        read: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: "2",
        title: "Scanner Finished",
        message: "All governance scanners passed.",
        type: "info",
        read: true,
        createdAt: new Date().toISOString(),
      },
    ]);
  }, req);
}
