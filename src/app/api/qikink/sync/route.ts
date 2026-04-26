import { NextResponse } from 'next/server';

export async function GET() {
  const CLIENT_ID = process.env.QIKINK_CLIENT_ID!;
  const CLIENT_SECRET = process.env.QIKINK_CLIENT_SECRET!;
  const BASE_URL = "https://api.qikink.com";

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
    console.log("Token:", tokenData);

    if (!tokenRes.ok) {
      return NextResponse.json({
        success: false,
        error: "Token failed",
        details: tokenData,
      });
    }

    const accessToken = tokenData.Accesstoken;

    // 📦 PRODUCTS
    const productRes = await fetch(`${BASE_URL}/api/products`, {
      headers: {
        ClientId: CLIENT_ID,
        Accesstoken: accessToken,
      },
    });

    const productData = await productRes.json();
    console.log("Products:", productData);

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
    return NextResponse.json({
      success: false,
      error: err.message,
    });
  }
}
