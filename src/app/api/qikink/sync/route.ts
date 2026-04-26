import { NextResponse } from 'next/server';

export async function GET() {
  const CLIENT_ID = process.env.QIKINK_CLIENT_ID;
  const CLIENT_SECRET = process.env.QIKINK_CLIENT_SECRET;
  const BASE_URL = "https://api.qikink.com";

  console.log("🚀 START QIKINK SYNC");

  // ✅ ENV CHECK
  console.log("🔍 ENV CHECK:");
  console.log("CLIENT_ID:", CLIENT_ID ? "✅ OK" : "❌ MISSING");
  console.log("CLIENT_SECRET:", CLIENT_SECRET ? "✅ OK" : "❌ MISSING");

  if (!CLIENT_ID || !CLIENT_SECRET) {
    return NextResponse.json({
      success: false,
      step: "ENV",
      error: "Missing ENV variables",
    }, { status: 500 });
  }

  try {
    // =========================
    // 🔑 STEP 1: TOKEN
    // =========================
    console.log("🔑 STEP 1: TOKEN REQUEST");

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
    console.log("🔑 RAW TOKEN RESPONSE:", tokenText);

    let tokenData: any;
    try {
      tokenData = JSON.parse(tokenText);
    } catch {
      return NextResponse.json({
        success: false,
        step: "TOKEN_PARSE",
        error: "Invalid JSON in token response",
        raw: tokenText,
      });
    }

    console.log("🔑 TOKEN STATUS:", tokenRes.status);
    console.log("🔑 TOKEN DATA:", tokenData);

    if (!tokenRes.ok || !tokenData.Accesstoken) {
      return NextResponse.json({
        success: false,
        step: "TOKEN_FAILED",
        error: "Token generation failed",
        details: tokenData,
      });
    }

    const accessToken = tokenData.Accesstoken;
    console.log("✅ TOKEN SUCCESS:", accessToken);

    // =========================
    // 📦 STEP 2: CATALOG
    // =========================
    console.log("📦 STEP 2: FETCH CATALOG");

    const productRes = await fetch(`${BASE_URL}/api/catalog`, {
      method: "GET",
      headers: {
        ClientId: CLIENT_ID,
        Accesstoken: accessToken,
      },
    });

    const productText = await productRes.text();
    console.log("📦 RAW PRODUCT RESPONSE:", productText);

    let productData: any;
    try {
      productData = JSON.parse(productText);
    } catch {
      return NextResponse.json({
        success: false,
        step: "PRODUCT_PARSE",
        error: "Invalid JSON in product response",
        raw: productText,
      });
    }

    console.log("📦 PRODUCT STATUS:", productRes.status);
    console.log("📦 PRODUCT DATA:", productData);

    if (!productRes.ok) {
      return NextResponse.json({
        success: false,
        step: "PRODUCT_FAILED",
        error: "Catalog API failed",
        details: productData,
      });
    }

    // =========================
    // 🧠 STEP 3: DATA EXTRACTION
    // =========================
    const items =
      productData.products ||
      productData.data ||
      productData.items ||
      [];

    console.log("📦 EXTRACTED ITEMS:", items.length);

    if (items.length === 0) {
      return NextResponse.json({
        success: true,
        step: "EMPTY_DATA",
        warning: "No products found in catalog",
        rawStructure: productData,
      });
    }

    // =========================
    // ✅ FINAL RESPONSE
    // =========================
    return NextResponse.json({
      success: true,
      step: "SUCCESS",
      totalProducts: items.length,
      sample: items.slice(0, 2), // sample data show
      data: items,
    });

  } catch (err: any) {
    console.error("❌ FINAL ERROR:", err);

    return NextResponse.json({
      success: false,
      step: "CRASH",
      error: err.message,
    }, { status: 500 });
  }
}
