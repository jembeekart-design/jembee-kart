import { NextResponse } from 'next/server';

export async function GET() {
  // 🔐 ENV variables (Vercel me set hone chahiye)
  const CLIENT_ID = process.env.QIKINK_CLIENT_ID!;
  const CLIENT_SECRET = process.env.QIKINK_CLIENT_SECRET!;

  // 🔥 LIVE API (sandbox nahi)
  const BASE_URL = "https://api.qikink.com";

  try {
    console.log("BASE_URL:", BASE_URL);

    // =========================
    // 🔑 STEP 1: TOKEN GENERATE
    // =========================
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

    console.log("Token Response:", tokenData);

    if (!tokenRes.ok) {
      return NextResponse.json({
        success: false,
        error: "Token generation failed",
        tokenData,
      });
    }

    const accessToken = tokenData.Accesstoken;

    // =========================
    // 📦 STEP 2: PRODUCTS FETCH
    // =========================
    const productRes = await fetch(`${BASE_URL}/api/products`, {
      method: "GET",
      headers: {
        ClientId: CLIENT_ID,
        Accesstoken: accessToken,
      },
    });

    const productData = await productRes.json();

    console.log("Qikink Products Data:", productData);

    if (!productRes.ok) {
      return NextResponse.json({
        success: false,
        error: "Product fetch failed",
        productData,
      });
    }

    // =========================
    // 🔍 SAFE DATA EXTRACTION
    // =========================
    const items =
      productData.products ||
      productData.data ||
      productData.items ||
      [];

    // अगर empty है
    if (items.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No products found",
        data: [],
        raw: productData,
      });
    }

    // =========================
    // ✅ FINAL RESPONSE
    // =========================
    return NextResponse.json({
      success: true,
      message: "Products fetched successfully",
      count: items.length,
      data: items,
    });

  } catch (error: any) {
    console.error("Server Error:", error);

    return NextResponse.json({
      success: false,
      error: "Server connection failed",
      message: error.message,
    }, { status: 500 });
  }
}
