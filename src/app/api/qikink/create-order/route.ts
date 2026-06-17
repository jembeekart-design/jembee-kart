import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      orderNumber,
      sku,
      quantity,
      amount,
      customerName,
      customerPhone,
      email,
      address,
      city,
      state,
      pincode,
    } = body;

    // 1. Get Access Token
    const tokenRes = await fetch(
      `${process.env.QIKINK_BASE_URL}/api/token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ClientId: process.env.QIKINK_CLIENT_ID!,
          ClientSecret: process.env.QIKINK_CLIENT_SECRET!,
        },
      }
    );

    const tokenData = await tokenRes.json();

    if (!tokenData.Accesstoken) {
      return NextResponse.json(
        {
          success: false,
          error: "Unable to generate Qikink token",
          response: tokenData,
        },
        { status: 500 }
      );
    }

    const accessToken = tokenData.Accesstoken;

    // 2. Create Order
    const qikinkRes = await fetch(
      `${process.env.QIKINK_BASE_URL}/api/order/create`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ClientId: process.env.QIKINK_CLIENT_ID!,
          Accesstoken: accessToken,
        },
        body: JSON.stringify({
          order_number: orderNumber,

          qikink_shipping: "1",

          gateway: "COD",

          total_order_value: String(amount),

          line_items: [
            {
              search_from_my_products: 1,
              quantity: String(quantity),
              price: String(amount),
              sku: sku,
            },
          ],

          shipping_address: {
            first_name: customerName,
            last_name: "",
            address1: address,
            phone: customerPhone,
            email: email || "",
            city: city,
            zip: pincode,
            province: state,
            country_code: "IN",
          },
        }),
      }
    );

    const qikinkData = await qikinkRes.json();

    return NextResponse.json({
      success: true,
      qikink: qikinkData,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
