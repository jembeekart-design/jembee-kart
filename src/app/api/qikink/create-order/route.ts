import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ success: false, message: "Method is not available" }, { status: 405, headers: { Allow: "POST" } });
}

export async function POST(req: NextRequest) {
  let claimedOrderRef: any = null;
  let qikinkClaimed = false;
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    const decoded = await getAdminAuth().verifyIdToken(authHeader.slice(7).trim(), true);
    const contentLength = Number(req.headers.get("content-length") || 0);
    if (Number.isFinite(contentLength) && contentLength > 4096) {
      return NextResponse.json({ success: false, error: "Request body too large" }, { status: 413, headers: { "Cache-Control": "no-store" } });
    }
    const rawBody = await req.text();
    if (Buffer.byteLength(rawBody, "utf8") > 4096) {
      return NextResponse.json({ success: false, error: "Request body too large" }, { status: 413, headers: { "Cache-Control": "no-store" } });
    }
    let body: Record<string, unknown>;
    try {
      const parsed: unknown = JSON.parse(rawBody);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("INVALID_BODY");
      body = parsed as Record<string, unknown>;
    } catch {
      return NextResponse.json({ success: false, error: "Invalid JSON request" }, { status: 400, headers: { "Cache-Control": "no-store" } });
    }
    const orderId = typeof body.orderId === "string" ? body.orderId.trim() : "";
    if (!orderId || orderId.length > 200 || !/^[A-Za-z0-9_-]+$/.test(orderId)) return NextResponse.json({ success: false, error: "A valid Jembee Shorts orderId is required" }, { status: 400, headers: { "Cache-Control": "no-store" } });

    const db = getAdminDb();
    const orderRef = db.collection("orders").doc(orderId);
    claimedOrderRef = orderRef;
    const orderSnap = await orderRef.get();
    if (!orderSnap.exists) return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    const order = orderSnap.data() || {};
    if (order.userId !== decoded.uid) return NextResponse.json({ success: false, error: "Order does not belong to this account" }, { status: 403 });
    if (order.status !== "placed" || order.paymentMethod !== "cod") return NextResponse.json({ success: false, error: "Only placed COD orders can be sent to Qikink" }, { status: 409 });
    if (order.qikinkStatus === "submitted") return NextResponse.json({ success: true, duplicate: true, orderNumber: order.orderNumber, qikinkOrderId: order.qikinkOrderId || null });
    if (order.qikinkStatus === "needs_reconciliation" || order.qikinkStatus === "creating") return NextResponse.json({ success: false, error: "This order requires provider reconciliation before another attempt" }, { status: 409 });

    const productId = typeof order.productId === "string" ? order.productId : "";
    if (!productId) return NextResponse.json({ success: false, error: "Order product reference is missing" }, { status: 409 });
    const productSnap = await db.collection("products").doc(productId).get();
    if (!productSnap.exists) return NextResponse.json({ success: false, error: "Ordered product no longer exists" }, { status: 409 });
    const product = productSnap.data() || {};
    const sku = typeof product.sku === "string" ? product.sku.trim() : "";
    const quantity = Number(order.quantity);
    const unitPrice = Number(order.productDiscountPrice ?? order.productPrice);
    const total = Number(order.finalAmount);
    const address = order.shippingAddress || {};
    const customerName = typeof address.fullName === "string" ? address.fullName.trim() : "";
    const customerPhone = typeof address.mobile === "string" ? address.mobile.trim() : "";
    const addressLine = typeof address.address === "string" ? address.address.trim() : "";
    const city = typeof address.city === "string" ? address.city.trim() : "";
    const state = typeof address.state === "string" ? address.state.trim() : "";
    const pincode = typeof address.pincode === "string" ? address.pincode.trim() : "";
    if (!sku || !Number.isInteger(quantity) || quantity < 1 || quantity > 20 || !Number.isFinite(unitPrice) || unitPrice <= 0 || !Number.isFinite(total) || total <= 0 || ![customerName, customerPhone, addressLine, city, state, pincode].every(Boolean)) {
      return NextResponse.json({ success: false, error: "Saved order details are incomplete or invalid" }, { status: 409 });
    }

    const claimed = await db.runTransaction(async (tx) => {
      const current = await tx.get(orderRef);
      const data = current.data() || {};
      if (!current.exists || data.userId !== decoded.uid || data.status !== "placed" || data.paymentMethod !== "cod") return false;
      if (data.qikinkStatus === "submitted" || data.qikinkStatus === "creating" || data.qikinkStatus === "needs_reconciliation") return false;
      tx.update(orderRef, { qikinkStatus: "creating", qikinkStartedAt: FieldValue.serverTimestamp() });
      return true;
    });
    if (!claimed) return NextResponse.json({ success: false, error: "Qikink fulfillment is already being processed or completed" }, { status: 409 });
    qikinkClaimed = true;

    const baseUrl = process.env.QIKINK_BASE_URL;
    const clientId = process.env.QIKINK_CLIENT_ID;
    const clientSecret = process.env.QIKINK_CLIENT_SECRET;
    if (!baseUrl || !clientId || !clientSecret) {
      await orderRef.update({ qikinkStatus: "failed", qikinkError: "not_configured", qikinkUpdatedAt: FieldValue.serverTimestamp() });
      return NextResponse.json({ success: false, error: "Qikink is not configured" }, { status: 503 });
    }
    const tokenResponse = await fetch(`${baseUrl}/api/token`, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ ClientId: clientId, client_secret: clientSecret }), cache: "no-store", signal: AbortSignal.timeout(15000) });
    if (!tokenResponse.ok) throw new Error("QIKINK_AUTH_FAILED");
    const tokenData = await tokenResponse.json();
    if (typeof tokenData?.Accesstoken !== "string" || !tokenData.Accesstoken) throw new Error("QIKINK_AUTH_FAILED");

    const payload = {
      order_number: String(order.orderNumber), qikink_shipping: "1", gateway: "COD", total_order_value: total.toFixed(2),
      line_items: [{ search_from_my_products: 1, quantity: String(quantity), price: unitPrice.toFixed(2), sku }],
      shipping_address: { first_name: customerName, last_name: "", address1: addressLine, phone: customerPhone, email: "", city, zip: pincode, province: state, country_code: "IN" },
    };
    const response = await fetch(`${baseUrl}/api/order/create`, { method: "POST", headers: { "Content-Type": "application/json", ClientId: clientId, Accesstoken: tokenData.Accesstoken }, body: JSON.stringify(payload), cache: "no-store", signal: AbortSignal.timeout(20000) });
    const result = await response.json().catch(() => null);
    if (!response.ok || !result || typeof result !== "object" || Array.isArray(result)) throw new Error("QIKINK_ORDER_CREATE_FAILED");
    const rawProviderOrderId = result.order_id ?? result.id;
    const providerOrderId = typeof rawProviderOrderId === "string" || typeof rawProviderOrderId === "number"
      ? String(rawProviderOrderId).trim().slice(0, 120)
      : "";
    if (!providerOrderId) throw new Error("QIKINK_ORDER_ID_MISSING");
    // Persist only the provider identifier. Do not copy an untrusted/raw provider
    // response (which may contain customer or operational fields) into the order.
    await orderRef.update({ qikinkStatus: "submitted", qikinkOrderId: providerOrderId, qikinkSubmittedAt: FieldValue.serverTimestamp(), qikinkUpdatedAt: FieldValue.serverTimestamp() });
    return NextResponse.json({ success: true, orderNumber: order.orderNumber, qikinkOrderId: providerOrderId }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("QIKINK ORDER ERROR", error instanceof Error ? error.message : "unknown");
    // A network/provider error can happen after Qikink accepted the request. Keep the
    // order locked for manual reconciliation rather than risking a duplicate shipment.
    if (claimedOrderRef && qikinkClaimed) {
      await claimedOrderRef.update({ qikinkStatus: "needs_reconciliation", qikinkUpdatedAt: FieldValue.serverTimestamp() }).catch(() => undefined);
    }
    return NextResponse.json({ success: false, code: "QIKINK_RECONCILIATION_REQUIRED", error: "Unable to confirm Qikink order status. The order is locked for reconciliation; do not retry automatically." }, { status: 502 });
  }
}
