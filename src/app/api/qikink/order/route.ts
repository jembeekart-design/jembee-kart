import { NextResponse } from "next/server";

export async function POST() {
  try {
    // 🔐 ENV variables
    const CLIENT_ID = process.env.QIKINK_CLIENT_ID!;
    const CLIENT_SECRET = process.env.QIKINK_CLIENT_SECRET!;

    // 🔥 Step 1: Get Token
    const tokenRes = await fetch("https://sandbox.qikink.com/api/token", {
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

    if (!tokenData.Accesstoken) {
      return NextResponse.json({
        error: "Token failed",
        tokenData,
      });
    }

    // 🔥 Step 2: Create Order
    const orderRes = await fetch(
      "https://sandbox.qikink.com/api/order/create",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ClientId: CLIENT_ID,
          Accesstoken: tokenData.Accesstoken,
        },

        body: JSON.stringify({
          order_number: "ORD" + Date.now().toString().slice(-8),

          qikink_shipping: "1",
          gateway: "COD",
          total_order_value: "500",

          line_items: [
            {
              search_from_my_products: 0,
              quantity: "1",
              price: "500",
              sku: "UHd-Wh-M",

              designs: [
                {
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
            first_name: "Alim",
            last_name: "Ansari",
            address1: "Delhi test address",
            phone: "9876543210",
            email: "test@gmail.com",
            city: "Delhi",
            zip: "110001",
            province: "DL",
            country_code: "IN",
          },
        }),
      }
    );

    const orderData = await orderRes.json();

    return NextResponse.json(orderData);
  } catch (err) {
    return NextResponse.json({
      error: "Server error",
      details: err,
    });
  }
}
