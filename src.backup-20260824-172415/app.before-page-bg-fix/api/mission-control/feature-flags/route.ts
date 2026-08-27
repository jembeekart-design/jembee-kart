import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    {
      id: "watchEarn",
      name: "Watch & Earn",
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
}
