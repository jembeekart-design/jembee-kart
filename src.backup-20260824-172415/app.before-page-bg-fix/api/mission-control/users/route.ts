import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    {
      id: "admin-1",
      name: "Administrator",
      email: "admin@jembeekart.com",
      role: "Super Admin",
      active: true,
      lastLogin: new Date().toISOString(),
    },
  ]);
}
