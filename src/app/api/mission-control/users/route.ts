import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/api/adminAuth";

export async function GET(request: NextRequest) {
  return withAdminAuth(async () => NextResponse.json([
    {
      id: "admin-1",
      name: "Administrator",
      email: "admin@jembeekart.com",
      role: "Super Admin",
      active: true,
      lastLogin: new Date().toISOString(),
    },
  ]), request);
}
