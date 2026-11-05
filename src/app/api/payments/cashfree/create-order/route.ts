import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";
import { cashfreeRequest, deterministicUuid, getCashfreeConfig, getPublicAppUrl } from "@/lib/payments/cashfree";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CreateOrderResponse = { order_id?: string; order_amount?: number; order_currency?: string; payment_session_id?: string; order_expiry_time?: string; order_status?: string };

function fail(message: string, status: number) {
  return NextResponse.json({ success: false, message }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: NextRequest) {
  try {
    const authorization = req.headers.get("authorization") || "";
    if (!authorization.startsWith("Bearer ")) return fail("Authentication required", 401);
    let uid: string;
    try { uid = (await getAdminAuth().verifyIdToken(authorization.slice(7).trim(), true)).uid; }
    catch { return fail("Session is invalid. Please sign in again.", 401); }

    const contentLength = Number(req.headers.get("content-length") || 0);
    if (contentLength > 4096) return fail("Request body too large", 413);
    const raw = await req.text();
    if (Buffer.byteLength(raw, "utf8") > 4096) return fail("Request body too large", 413);
    let body: Record<string, unknown>;
    try {
      const parsed: unknown = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("INVALID_BODY");
      body = parsed as Record<string, unknown>;
    } catch { return fail("Invalid JSON request", 400); }

    const orderId = typeof body.orderId === "string" ? body.orderId.trim() : "";
    if (!orderId || orderId.length > 200 || !/^[A-Za-z0-9_-]+$/.test(orderId)) return fail("Invalid order ID", 400);

    const db = getAdminDb();
    const orderRef = db.collection("orders").doc(orderId);
    const orderSnap = await orderRef.get();
    if (!orderSnap.exists) return fail("Order not found", 404);
    const order = orderSnap.data() || {};
    if (order.userId !== uid) return fail("Order not found", 404);
    if (order.paymentMethod !== "cashfree") return fail("This order is not an online payment order", 409);
    if (order.paymentStatus === "paid") return fail("This order is already paid", 409);
    if (order.status !== "payment_pending") return fail("This order is not awaiting payment", 409);

    const config = await getCashfreeConfig();
    const existingSession = typeof order.cashfreePaymentSessionId === "string" ? order.cashfreePaymentSessionId : "";
    const existingExpiry = typeof order.cashfreeOrderExpiryTime === "string" ? Date.parse(order.cashfreeOrderExpiryTime) : 0;
    if (existingSession && existingExpiry > Date.now() + 60_000) {
      return NextResponse.json({ success: true, paymentSessionId: existingSession, sandboxMode: config.sandboxMode }, { headers: { "Cache-Control": "no-store" } });
    }

    const amount = Number(order.finalAmount);
    const rawPhone = typeof order.customerPhone === "string" ? order.customerPhone : "";
    const phoneDigits = rawPhone.replace(/\D/g, "");
    const phone = phoneDigits.length === 12 && phoneDigits.startsWith("91") ? phoneDigits.slice(2) : phoneDigits.length === 11 && phoneDigits.startsWith("0") ? phoneDigits.slice(1) : phoneDigits;
    if (!Number.isFinite(amount) || amount < 1 || amount > 10000000 || !/^\d{10}$/.test(phone)) {
      return fail("Order amount or customer phone is invalid for online payment", 409);
    }
    const appUrl = getPublicAppUrl();
    const profileSnap = await db.collection("users").doc(uid).get();
    const profile = profileSnap.data() || {};
    const email = typeof profile.email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email) ? profile.email : undefined;
    const providerOrderId = typeof order.cashfreeOrderId === "string" ? order.cashfreeOrderId : orderId;
    const idempotencyKey = deterministicUuid(`jembeekart-cashfree-order:${orderId}`);
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

    const providerResult = await cashfreeRequest<CreateOrderResponse>(config, "/orders", {
      method: "POST",
      idempotencyKey,
      body: {
        order_id: providerOrderId,
        order_amount: Math.round(amount * 100) / 100,
        order_currency: "INR",
        customer_details: {
          customer_id: uid.slice(0, 50),
          customer_name: typeof order.customerName === "string" ? order.customerName.slice(0, 100) : "JembeeKart Customer",
          customer_phone: phone,
          ...(email ? { customer_email: email } : {}),
        },
        order_meta: {
          return_url: `${appUrl}/payment-success?orderId=${encodeURIComponent(orderId)}`,
          notify_url: `${appUrl}/api/payments/cashfree/webhook`,
        },
        order_expiry_time: expiresAt,
        order_note: `JembeeKart ${String(order.orderNumber || orderId).slice(0, 150)}`,
      },
    });

    if (
      providerResult.order_id !== providerOrderId ||
      typeof providerResult.payment_session_id !== "string" || !providerResult.payment_session_id ||
      Math.round(Number(providerResult.order_amount) * 100) !== Math.round(amount * 100) ||
      String(providerResult.order_currency || "").toUpperCase() !== "INR"
    ) {
      throw new Error("CASHFREE_INVALID_CREATE_ORDER_RESPONSE");
    }

    await db.runTransaction(async (tx) => {
      const latest = await tx.get(orderRef);
      if (!latest.exists) throw new Error("ORDER_NOT_FOUND");
      const current = latest.data() || {};
      if (current.userId !== uid || current.paymentMethod !== "cashfree") throw new Error("ORDER_NOT_OWNED");
      if (current.paymentStatus === "paid") throw new Error("ORDER_ALREADY_PAID");
      if (current.status !== "payment_pending") throw new Error("ORDER_NOT_PAYABLE");
      const currentAmount = Number(current.finalAmount);
      if (!Number.isFinite(currentAmount) || Math.round(currentAmount * 100) !== Math.round(amount * 100)) {
        throw new Error("ORDER_AMOUNT_CHANGED");
      }
      if (current.cashfreeOrderId && current.cashfreeOrderId !== providerOrderId) {
        throw new Error("ORDER_PROVIDER_ID_CHANGED");
      }
      tx.update(orderRef, {
        cashfreeOrderId: providerOrderId,
        cashfreePaymentSessionId: providerResult.payment_session_id,
        cashfreeOrderExpiryTime: providerResult.order_expiry_time || expiresAt,
        paymentInitiationStatus: "created",
        paymentInitiatedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    });

    return NextResponse.json({ success: true, paymentSessionId: providerResult.payment_session_id, sandboxMode: config.sandboxMode }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    if (code === "ORDER_ALREADY_PAID") return fail("This order is already paid", 409);
    if (code === "ORDER_NOT_FOUND") return fail("Order not found", 404);
    if (code === "ORDER_NOT_OWNED") return fail("Order not found", 404);
    if (code === "ORDER_NOT_PAYABLE") return fail("This order is no longer awaiting payment", 409);
    if (code === "ORDER_AMOUNT_CHANGED" || code === "ORDER_PROVIDER_ID_CHANGED") return fail("Order details changed while payment was starting. Please refresh your orders and try again.", 409);
    if (code.startsWith("CASHFREE_")) return fail("Cashfree payment is not available. Please use Cash on Delivery or try again later.", 503);
    console.error("Cashfree create-order error:", code || "unknown");
    return fail("Unable to start online payment", 502);
  }
}
