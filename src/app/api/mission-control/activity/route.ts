import { NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/api/adminAuth";

export async function GET(req: Request) {
  return withAdminAuth(async () => {
    return NextResponse.json({
      success: true,
      activities: [
        {
          id: "1",
          title: "Enterprise Scanner Completed",
          description: "All scanners finished successfully.",
          type: "success",
          createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        },
        {
          id: "2",
          title: "Auto Fix Applied",
          description: "Theme variables updated.",
          type: "info",
          createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        },
        {
          id: "3",
          title: "Firestore Scan",
          description: "28 collections verified.",
          type: "database",
          createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
        },
        {
          id: "4",
          title: "Security Scan",
          description: "No critical vulnerabilities detected.",
          type: "security",
          createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        },
      ],
    });
  }, req);
}
