import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";
import { cashfreeRequest, confirmCashfreePayment, getCashfreeConfig } from "@/lib/payments/cashfree";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CashfreePayment = Record<string, unknown>;

function fail(message: string, status: number) {
  return NextResponse.json({ success: false, message }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function GET(req: NextRequest) {
  try {
    const authorization = req.headers.get("authorization") || "";
    if (!authorization.startsWith("Bearer ")) return fail("Authentication required", 401);
    let uid: string;
    try { uid = (await getAdminAuth().verifyIdToken(authorization.slice(7).trim(), true)).uid; }
    catch { return fail("Session is invalid. Please sign in again.", 401); }

    const orderId = req.nextUrl.searchParams.get("orderId")?.trim() || "";
    if (!orderId || orderId.length > 200 || !/^[A-Za-z0-9_-]+$/.test(orderId)) return fail("Invalid order ID", 400);
    const db = getAdminDb();
    const orderRef = db.collection("orders").doc(orderId);
    const orderSnap = await orderRef.get();
    if (!orderSnap.exists || orderSnap.data()?.userId !== uid) return fail("Order not found", 404);
    const order = orderSnap.data() || {};
    if (order.paymentMethod !== "cashfree") return fail("This is not a Cashfree order", 409);
    if (order.paymentStatus === "paid") return NextResponse.json({ success: true, paymentStatus: "paid", status: order.status }, { headers: { "Cache-Control": "no-store" } });

    const config = await getCashfreeConfig({ requireEnabled: false });
    const providerOrderId = typeof order.cashfreeOrderId === "string" ? order.cashfreeOrderId : "";
    if (!providerOrderId) return fail("Cashfree order is not initialized", 409);
    const payments = await cashfreeRequest<CashfreePayment[]>(config, `/orders/${encodeURIComponent(providerOrderId)}/payments`);
    if (!Array.isArray(payments)) return fail("Unable to verify payment with Cashfree", 502);
    const successfulPayments = payments.filter((item) => String(item.payment_status || "").toUpperCase() === "SUCCESS");
    if (successfulPayments.length === 0) {
      return NextResponse.json({ success: true, paymentStatus: "pending", status: order.status }, { headers: { "Cache-Control": "no-store" } });
    }

    let manualReviewRequired = false;
    let finalStatus = "placed";
    for (const successful of successfulPayments) {
      const result = await confirmCashfreePayment(orderId, providerOrderId, successful);
      if (result === "amount_mismatch" || result === "order_mismatch") return fail("Payment details did not match this order. Support review is required.", 409);
      if (result === "order_not_found") return fail("Order not found", 404);
      if (result === "duplicate_payment_review" || result === "late_payment_after_cancel_review") manualReviewRequired = true;
      if (result === "late_payment_after_cancel_review") finalStatus = "cancelled";
    }
    return NextResponse.json({ success: true, paymentStatus: "paid", manualReviewRequired, status: finalStatus }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    if (code.startsWith("CASHFREE_")) return fail("Payment verification is temporarily unavailable", 503);
    console.error("Cashfree payment verification error:", code || "unknown");
    return fail("Unable to verify payment", 502);
  }
}
