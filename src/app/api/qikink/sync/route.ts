import { NextResponse } from 'next/server';

export async function GET() {
  const CLIENT_ID = process.env.QIKINK_CLIENT_ID!;
  const CLIENT_SECRET = process.env.QIKINK_CLIENT_SECRET!;
  const BASE_URL = process.env.QIKINK_BASE_URL!;

  try {
    // 🔑 Token
    const tokenRes = await fetch(`${BASE_URL}/api/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        ClientId: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok) {
      return NextResponse.json({
        error: "Token failed",
        details: tokenData,
      });
    }

    const accessToken = tokenData.Accesstoken;

    // 📦 PRODUCTS (important change)
    const res = await fetch(`${BASE_URL}/api/products`, {
      headers: {
        ClientId: CLIENT_ID,
        Accesstoken: accessToken,
      },
    });

    const data = await res.json();

    return NextResponse.json({
      success: true,
      data,
    });

  } catch (err: any) {
    return NextResponse.json({
      error: "Server error",
      message: err.message,
    });
  }
}
