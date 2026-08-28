import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch(
      `${process.env.QIKINK_BASE_URL}/api/token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          ClientId: process.env.QIKINK_CLIENT_ID || "",
          client_secret:
            process.env.QIKINK_CLIENT_SECRET || "",
        }),
      }
    );

    const data = await response.json();

    return NextResponse.json(data);

  } catch (error) {

    return NextResponse.json(
      {
        success: false,
        message: "Qikink token failed",
      },
      { status: 500 }
    );
  }
}
