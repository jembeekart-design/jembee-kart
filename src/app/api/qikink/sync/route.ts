import { NextResponse } from "next/server";

export async function GET() {
  const CLIENT_ID = process.env.QIKINK_CLIENT_ID!;
  const CLIENT_SECRET = process.env.QIKINK_CLIENT_SECRET!;
  const BASE_URL = process.env.QIKINK_BASE_URL!;

  // 🔍 Debug logs
  console.log("BASE_URL:", BASE_URL);
  console.log("CLIENT_ID:", CLIENT_ID);

  try {
    // 🔑 STEP 1: TOKEN GENERATE
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

    console.log("TOKEN RESPONSE:", tokenData);

    if (!tokenRes.ok || !tokenData.Accesstoken) {
      return NextResponse.json({
        success: false,
        message: "Token generation failed",
        tokenData,
      });
    }

    const accessToken = tokenData.Accesstoken;

    console.log("ACCESS TOKEN:", accessToken);

    // 📦 STEP 2: PRODUCTS FETCH
    const productRes = await fetch(`${BASE_URL}/api/products`, {
      method: "GET",
      headers: {
        ClientId: CLIENT_ID,
        Accesstoken: accessToken,
      },
    });

    const productData = await productRes.json();

    console.log("Qikink Data:", productData);

    if (!productRes.ok) {
      return NextResponse.json({
        success: false,
        message: "Product fetch failed",
        productData,
      });
    }

    return NextResponse.json({
      success: true,
      data: productData,
    });

  } catch (error: any) {
    console.log("ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
