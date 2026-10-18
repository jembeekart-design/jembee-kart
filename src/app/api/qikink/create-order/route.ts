import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";

/**
 * Create a Qikink order only for an authenticated customer and a server-priced product.
 * Prepaid orders are intentionally blocked until a server-verified Cashfree payment
 * record can be linked to this order. Never trust price/amount supplied by the browser.
 */
export async function GET() {
  return NextResponse.json({ success: true, message: "Qikink Create Order API Working" });
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await getAdminAuth().verifyIdToken(authHeader.slice(7).trim());
    const body = await req.json();
    const {
      orderNumber, sku, quantity, customerName, customerPhone, email,
      address, city, state, pincode, paymentMethod,
    } = body ?? {};

    if (typeof sku !== "string" || !sku.trim()) {
      return NextResponse.json({ success: false, error: "SKU is required" }, { status: 400 });
    }
    const qty = Number(quantity ?? 1);
    if (!Number.isInteger(qty) || qty < 1 || qty > 20) {
      return NextResponse.json({ success: false, error: "Quantity must be between 1 and 20" }, { status: 400 });
    }
    if (paymentMethod !== "cod") {
      return NextResponse.json({
        success: false,
        error: "Prepaid Qikink orders are disabled until server-side Cashfree payment verification is configured.",
      }, { status: 409 });
    }
    if (![customerName, customerPhone, address, city, state, pincode].every((v) => typeof v === "string" && v.trim())) {
      return NextResponse.json({ success: false, error: "Complete shipping details are required" }, { status: 400 });
    }

    const db = getAdminDb();
    const products = await db.collection("products").where("sku", "==", sku.trim()).limit(2).get();
    if (products.empty) {
      return NextResponse.json({ success: false, error: "Product SKU not found" }, { status: 404 });
    }
    if (products.size !== 1) {
      return NextResponse.json({ success: false, error: "Product SKU is ambiguous" }, { status: 409 });
    }
    const product = products.docs[0].data();
    if (product.visible === false) {
      return NextResponse.json({ success: false, error: "Product is not available" }, { status: 409 });
    }
    const stock = Number(product.stock);
    if (Number.isFinite(stock) && stock < qty) {
      return NextResponse.json({ success: false, error: "Insufficient stock" }, { status: 409 });
    }
    const price = Number(product.discountPrice) > 0 ? Number(product.discountPrice) : Number(product.price);
    if (!Number.isFinite(price) || price <= 0) {
      return NextResponse.json({ success: false, error: "Product price is not configured" }, { status: 409 });
    }
    const total = Math.round(price * qty * 100) / 100;

    const baseUrl = process.env.QIKINK_BASE_URL;
    const clientId = process.env.QIKINK_CLIENT_ID;
    const clientSecret = process.env.QIKINK_CLIENT_SECRET;
    if (!baseUrl || !clientId || !clientSecret) {
      return NextResponse.json({ success: false, error: "Qikink is not configured" }, { status: 503 });
    }

    const tokenResponse = await fetch(`${baseUrl}/api/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ ClientId: clientId, client_secret: clientSecret }),
      cache: "no-store",
    });
    if (!tokenResponse.ok) {
      return NextResponse.json({ success: false, error: "Qikink authentication failed" }, { status: 502 });
    }
    const tokenData = await tokenResponse.json();
    if (typeof tokenData?.Accesstoken !== "string" || !tokenData.Accesstoken) {
      return NextResponse.json({ success: false, error: "Qikink authentication failed" }, { status: 502 });
    }

    const safeOrderNumber = typeof orderNumber === "string" && /^[A-Za-z0-9_-]{1,80}$/.test(orderNumber)
      ? orderNumber : `JK-${decoded.uid.slice(0, 8)}-${Date.now()}`;
    const payload = {
      order_number: safeOrderNumber,
      qikink_shipping: "1",
      gateway: "COD",
      total_order_value: String(total),
      line_items: [{ search_from_my_products: 1, quantity: String(qty), price: String(price), sku: sku.trim() }],
      shipping_address: {
        first_name: customerName.trim(), last_name: "", address1: address.trim(),
        phone: customerPhone.trim(), email: typeof email === "string" ? email.trim() : "",
        city: city.trim(), zip: pincode.trim(), province: state.trim(), country_code: "IN",
      },
    };
    const response = await fetch(`${baseUrl}/api/order/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ClientId: clientId, Accesstoken: tokenData.Accesstoken },
      body: JSON.stringify(payload), cache: "no-store",
    });
    const result = await response.json().catch(() => null);
    if (!response.ok) {
      return NextResponse.json({ success: false, error: "Qikink rejected the order" }, { status: 502 });
    }
    return NextResponse.json({ success: true, orderNumber: safeOrderNumber, total, qikink: result });
  } catch (error) {
    console.error("QIKINK ORDER ERROR", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ success: false, error: "Unable to create Qikink order" }, { status: 500 });
  }
}
