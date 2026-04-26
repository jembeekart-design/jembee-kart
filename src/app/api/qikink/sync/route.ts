import { NextResponse } from "next/server";

export async function GET() {
  const CLIENT_ID = process.env.QIKINK_CLIENT_ID!;
  const CLIENT_SECRET = process.env.QIKINK_CLIENT_SECRET!;
  const BASE_URL = process.env.QIKINK_BASE_URL!;

  console.log("BASE_URL:", BASE_URL);

  try {
    // 🔑 TOKEN
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
    console.log("TOKEN:", tokenData);

    if (!tokenData.Accesstoken) {
      return NextResponse.json({
        success: false,
        message: "Token failed",
        tokenData,
      });
    }

    const accessToken = tokenData.Accesstoken;

    // 📦 PRODUCTS
    const res = await fetch(`${BASE_URL}/api/products`, {
      headers: {
        ClientId: CLIENT_ID,
        Accesstoken: accessToken,
      },
    });

    const data = await res.json();
    console.log("Qikink Data:", data);

    return NextResponse.json({
      success: true,
      data,
    });

  } catch (err: any) {
    return NextResponse.json({
      success: false,
      message: err.message,
    });
  }
}
