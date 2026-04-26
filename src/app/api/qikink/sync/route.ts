import { NextResponse } from "next/server";

export async function GET() {
  const CLIENT_ID = process.env.QIKINK_CLIENT_ID;
  const CLIENT_SECRET = process.env.QIKINK_CLIENT_SECRET;
  const BASE_URL = "https://api.qikink.com";

  console.log("🚀 START QIKINK SYNC");

  // ✅ ENV CHECK
  if (!CLIENT_ID || !CLIENT_SECRET) {
    console.log("❌ ENV MISSING");
    return NextResponse.json({
      success: false,
      step: "ENV",
      error: "Missing ENV variables",
    });
  }

  try {
    // =========================
    // 🔑 STEP 1: TOKEN
    // =========================
    console.log("🔑 TOKEN REQUEST");

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
    console.log("🔑 TOKEN RESPONSE:", tokenData);

    if (!tokenRes.ok || !tokenData?.Accesstoken) {
      return NextResponse.json({
        success: false,
        step: "TOKEN_FAILED",
        error: "Token generation failed",
        details: tokenData,
      });
    }

    const accessToken = tokenData.Accesstoken;

    // =========================
    // 📦 STEP 2: PRODUCTS (FIXED)
    // =========================
    console.log("📦 FETCH PRODUCTS");

    const productRes = await fetch(`${BASE_URL}/api/product`, {
      method: "GET",
      headers: {
        ClientId: CLIENT_ID,
        Accesstoken: accessToken,
      },
    });

    const productData = await productRes.json();
    console.log("📦 PRODUCT RESPONSE:", productData);

    if (!productRes.ok) {
      return NextResponse.json({
        success: false,
        step: "PRODUCT_FAILED",
        error: "Product API failed",
        details: productData,
      });
    }

    // =========================
    // 🧠 STEP 3: SAFE EXTRACTION
    // =========================
    const items =
      productData.products ||
      productData.data ||
      productData.items ||
      [];

    console.log("📦 TOTAL ITEMS:", items.length);

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({
        success: true,
        step: "EMPTY",
        message: "No products found in Qikink",
        raw: productData,
      });
    }

    // =========================
    // ✅ FINAL RESPONSE
    // =========================
    return NextResponse.json({
      success: true,
      step: "SUCCESS",
      totalProducts: items.length,
      sample: items.slice(0, 2),
      data: items,
    });

  } catch (err: any) {
    console.error("❌ SERVER ERROR:", err);

    return NextResponse.json({
      success: false,
      step: "CRASH",
      error: err.message,
    });
  }
}
