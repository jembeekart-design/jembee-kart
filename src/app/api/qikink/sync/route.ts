import { NextResponse } from "next/server";

export async function GET() {
  const CLIENT_ID = process.env.QIKINK_CLIENT_ID;
  const CLIENT_SECRET = process.env.QIKINK_CLIENT_SECRET;
  const BASE_URL = "https://api.qikink.com";

  if (!CLIENT_ID || !CLIENT_SECRET) {
    return NextResponse.json({
      success: false,
      error: "Missing ENV variables",
    });
  }

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

    if (!tokenData?.Accesstoken) {
      return NextResponse.json({
        success: false,
        error: "Token failed",
        details: tokenData,
      });
    }

    const accessToken = tokenData.Accesstoken;

    // ✅ ✅ CORRECT API HERE
    const productRes = await fetch(`${BASE_URL}/api/products/list`, {
      method: "GET",
      headers: {
        ClientId: CLIENT_ID,
        Accesstoken: accessToken,
      },
    });

    const productData = await productRes.json();

    console.log("🔥 FINAL PRODUCT DATA:", productData);

    if (!productRes.ok) {
      return NextResponse.json({
        success: false,
        error: "Product API failed",
        details: productData,
      });
    }

    return NextResponse.json({
      success: true,
      data: productData,
    });

  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message,
    });
  }
}
