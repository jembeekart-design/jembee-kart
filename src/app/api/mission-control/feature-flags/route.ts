import { NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/api/adminAuth";

export async function GET(req: Request) {
  return withAdminAuth(async () => {
    return NextResponse.json([
      {
        id: "watchEarn",
        name: "Jembee Shorts",
        enabled: true,
      },
      {
        id: "referralSystem",
        name: "Referral System",
        enabled: true,
      },
      {
        id: "creatorEconomy",
        name: "Creator Economy",
        enabled: false,
      },
    ]);
  }, req);
}
