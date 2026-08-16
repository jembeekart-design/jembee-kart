import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Qikink Create Order API Working",
    timestamp: new Date().toISOString(),
  });
}

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
      paymentMethod,
    } = body;

    if (!sku) {
      return NextResponse.json(
        {
          success: false,
          error: "SKU is required",
        },
        { status: 400 }
      );
    }

    /* =====================================
       GET QIKINK TOKEN
    ===================================== */

    const tokenResponse = await fetch(
      `${process.env.QIKINK_BASE_URL}/api/token`,
      {
        method: "POST",
        headers: {
          ClientId: process.env.QIKINK_CLIENT_ID || "",
          ClientSecret:
            process.env.QIKINK_CLIENT_SECRET || "",
        },
      }
    );

    const tokenData = await tokenResponse.json();

    if (!tokenData.Accesstoken) {
      return NextResponse.json(
        {
          success: false,
          error: "Unable to generate token",
          qikinkResponse: tokenData,
        },
        { status: 500 }
      );
    }

    const accessToken = tokenData.Accesstoken;

    /* =====================================
       CREATE QIKINK ORDER
    ===================================== */

    const qikinkOrderPayload = {
      order_number:
        orderNumber ||
        `JK-${Date.now()}`,

      qikink_shipping: "1",

      gateway:
        paymentMethod === "cod"
          ? "COD"
          : "Prepaid",

      total_order_value: String(
        amount || 0
      ),

      line_items: [
        {
          search_from_my_products: 1,
          quantity: String(
            quantity || 1
          ),
          price: String(
            amount || 0
          ),
          sku: sku,
        },
      ],

      shipping_address: {
        first_name:
          customerName || "",

        last_name: "",

        address1:
          address || "",

        phone:
          customerPhone || "",

        email:
          email || "",

        city:
          city || "",

        zip:
          pincode || "",

        province:
          state || "",

        country_code: "IN",
      },
    };

    const createOrderResponse =
      await fetch(
        `${process.env.QIKINK_BASE_URL}/api/order/create`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",

            ClientId:
              process.env
                .QIKINK_CLIENT_ID || "",

            Accesstoken:
              accessToken,
          },

          body: JSON.stringify(
            qikinkOrderPayload
          ),
        }
      );

    const qikinkResult =
      await createOrderResponse.json();

    return NextResponse.json({
      success: true,
      payload:
        qikinkOrderPayload,
      qikink:
        qikinkResult,
    });
  } catch (error: any) {
    console.error(
      "QIKINK ORDER ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error.message ||
          "Unknown Error",
      },
      { status: 500 }
    );
  }
}
