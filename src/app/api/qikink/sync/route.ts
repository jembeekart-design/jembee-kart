import { NextResponse } from 'next/server';

export async function GET() {
  const CLIENT_ID = process.env.QIKINK_CLIENT_ID;
  const CLIENT_SECRET = process.env.QIKINK_CLIENT_SECRET;
  const BASE_URL = "https://api.qikink.com";

  if (!CLIENT_ID || !CLIENT_SECRET) {
    return NextResponse.json({
      success: false,
      error: "Missing ENV variables",
    }, { status: 500 });
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

    const tokenText = await tokenRes.text();
    let tokenData: any;

    try {
      tokenData = JSON.parse(tokenText);
    } catch {
      return NextResponse.json({
        success: false,
        error: "Invalid token response",
        raw: tokenText,
      });
    }

    console.log("🔑 Token:", tokenData);

    if (!tokenRes.ok || !tokenData.Accesstoken) {
      return NextResponse.json({
        success: false,
        error: "Token failed",
        details: tokenData,
      });
    }

    const accessToken = tokenData.Accesstoken;

    // 📦 PRODUCTS
    const productRes = await fetch(`${BASE_URL}/api/products`, {
      method: "GET",
      headers: {
        ClientId: CLIENT_ID,
        Accesstoken: accessToken,
        "Content-Type": "application/json",
      },
    });

    const productText = await productRes.text();
    let productData: any;

    try {
      productData = JSON.parse(productText);
    } catch {
      return NextResponse.json({
        success: false,
        error: "Invalid product response",
        raw: productText,
      });
    }

    console.log("📦 Products:", productData);

    if (!productRes.ok) {
      return NextResponse.json({
        success: false,
        error: "Products API failed",
        details: productData,
      });
    }

    return NextResponse.json({
      success: true,
      data: productData,
    });

  } catch (err: any) {
    console.error("❌ Server Error:", err);
    return NextResponse.json({
      success: false,
      error: err.message,
    }, { status: 500 });
  }
}
