import { NextResponse } from "next/server";

export async function GET() {
  try {
    const CLIENT_ID = process.env.QIKINK_CLIENT_ID!;
    const CLIENT_SECRET = process.env.QIKINK_CLIENT_SECRET!;

    // 🔥 STEP 1: TOKEN GENERATE
    const tokenResponse = await fetch(
      "https://sandbox.qikink.com/api/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          ClientId: CLIENT_ID,
          client_secret: CLIENT_SECRET,
        }),
      }
    );

    const tokenData = await tokenResponse.json();

    // ❌ Token fail check
    if (!tokenResponse.ok || !tokenData?.Accesstoken) {
      return NextResponse.json(
        {
          error: "Token generation failed",
          details: tokenData,
        },
        { status: 400 }
      );
    }

    const accessToken = tokenData.Accesstoken;

    // 🔥 STEP 2: FETCH ORDERS (ya products)
    const apiResponse = await fetch(
      "https://sandbox.qikink.com/api/order",
      {
        method: "GET",
        headers: {
          ClientId: CLIENT_ID,
          Accesstoken: accessToken,
        },
      }
    );

    const finalData = await apiResponse.json();

    return NextResponse.json({
      success: true,
      token_generated: true,
      count: Array.isArray(finalData) ? finalData.length : 0,
      data: finalData,
    });

  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Server connection failed",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
