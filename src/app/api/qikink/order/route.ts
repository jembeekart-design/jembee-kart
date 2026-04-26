export async function POST() {
  try {
    // 🔐 Token API
    const tokenRes = await fetch("https://sandbox.qikink.com/api/token", {
      method: "POST",
      body: new URLSearchParams({
        ClientId: process.env.QIKINK_CLIENT_ID!,
        client_secret: process.env.QIKINK_CLIENT_SECRET!,
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenData?.Accesstoken) {
      return Response.json({
        error: "Token failed",
        tokenData,
      });
    }

    // 📦 Order API
    const orderRes = await fetch(
      "https://sandbox.qikink.com/api/order/create",
      {
        method: "POST",
        headers: {
          ClientId: process.env.QIKINK_CLIENT_ID!,
          Accesstoken: tokenData.Accesstoken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          order_number: "test_" + Date.now(),
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

    return Response.json(orderData);

  } catch (err) {
    return Response.json({
      error: "Server error",
      err,
    });
  }
}
