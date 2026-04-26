import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("https://sandbox.qikink.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        ClientId: process.env.QIKINK_CLIENT_ID!,
        client_secret: process.env.QIKINK_CLIENT_SECRET!,
      }),
    });

    const data = await res.json();

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({
      error: "Token fetch failed",
    });
  }
}
