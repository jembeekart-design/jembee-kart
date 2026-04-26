import { NextResponse } from "next/server";

export async function POST() {
  try {
    // 🔥 Step 1: get token
    const tokenRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/qikink/token`);
    const tokenData = await tokenRes.json();

    const token = tokenData.Accesstoken;

    // 🔥 Step 2: create order
    const orderRes = await fetch("https://sandbox.qikink.com/api/order/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ClientId: process.env.QIKINK_CLIENT_ID!,
        Accesstoken: token,
      },
      body: JSON.stringify({
        order_number: "api_test_1",
        qikink_shipping: "1",
        gateway: "COD",
        total_order_value: "1",
        line_items: [
          {
            search_from_my_products: 0,
            quantity: "1",
            price: "1",
            sku: "MVnHs-Wh-S",
            designs: [
              {
                design_code: "iPhoneXR",
                placement_sku: "fr",
                design_link:
                  "https://sgp1.digitaloceanspaces.com/cdn.qikink.com/erp2/assets/designs/83/1696668376.jpg",
                mockup_link:
                  "https://sgp1.digitaloceanspaces.com/cdn.qikink.com/erp2/assets/designs/83/1696668376.jpg",
              },
            ],
          },
        ],
        shipping_address: {
          first_name: "Test",
          last_name: "User",
          address1: "Test Address",
          phone: "9999999999",
          email: "test@test.com",
          city: "Delhi",
          zip: "110001",
          province: "DL",
          country_code: "IN",
        },
      }),
    });

    const data = await orderRes.json();

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({
      error: "Order failed",
    });
  }
}
