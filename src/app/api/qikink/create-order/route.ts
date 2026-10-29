import { readBoundedJson } from "@/lib/server/readBoundedJson";
import { randomUUID } from "node:crypto";
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
    const parsedBody = await readBoundedJson(req, 16384);
    if (!parsedBody.ok) {
      return NextResponse.json({ success: false, message: parsedBody.message }, { status: parsedBody.status });
    }
    if (!parsedBody.value || typeof parsedBody.value !== "object" || Array.isArray(parsedBody.value)) {
      return NextResponse.json({ success: false, message: "Request body must be a JSON object" }, { status: 400 });
    }
    const body = parsedBody.value as Record<string, unknown>;
    const {
      sku, quantity, customerName, customerPhone, email,
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
    if (typeof customerName !== "string" || !customerName.trim() || typeof customerPhone !== "string" || !customerPhone.trim() || typeof address !== "string" || !address.trim() || typeof city !== "string" || !city.trim() || typeof state !== "string" || !state.trim() || typeof pincode !== "string" || !pincode.trim()) {
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
    // Missing, malformed, fractional, or negative stock must never mean "unlimited".
    // This is only a preflight check; see AUDIT_STATUS.md for the remaining cross-system
    // reservation/idempotency requirement before this endpoint is used in production.
    const stock = product.stock;
    if (typeof stock !== "number" || !Number.isSafeInteger(stock) || stock < 0) {
      return NextResponse.json({ success: false, error: "Product inventory is not configured" }, { status: 409 });
    }
    if (stock < qty) {
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
      signal: AbortSignal.timeout(10_000),
    });
    if (!tokenResponse.ok) {
      return NextResponse.json({ success: false, error: "Qikink authentication failed" }, { status: 502 });
    }
    const tokenData = await tokenResponse.json();
    if (typeof tokenData?.Accesstoken !== "string" || !tokenData.Accesstoken) {
      return NextResponse.json({ success: false, error: "Qikink authentication failed" }, { status: 502 });
    }

    // Never accept the provider-facing order reference from the browser: it must be
    // server-generated to prevent collisions and cross-user reference spoofing.
    const safeOrderNumber = `JK-${decoded.uid.slice(0, 8)}-${randomUUID().replace(/-/g, "").slice(0, 20)}`;
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
      signal: AbortSignal.timeout(15_000),
    });
    // Consume but do not relay the provider payload; it may contain internal diagnostics
    // or customer/provider metadata not intended for the browser.
    await response.text().catch(() => "");
    if (!response.ok) {
      return NextResponse.json({ success: false, error: "Qikink rejected the order" }, { status: 502 });
    }
    return NextResponse.json({ success: true, orderNumber: safeOrderNumber, total }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("QIKINK ORDER ERROR", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ success: false, error: "Unable to create Qikink order" }, { status: 500 });
  }
}
