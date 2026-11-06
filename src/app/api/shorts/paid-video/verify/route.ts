import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";
import { readBoundedJson } from "@/lib/server/readBoundedJson";
import { cashfreeRequest, getCashfreeConfig } from "@/lib/payments/cashfree";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Payment = {
  payment_status?: string;
  cf_payment_id?: number | string;
  payment_amount?: number | string;
  payment_currency?: string;
  order_id?: string;
};

function validInrAmount(value: unknown): number | null {
  const amount = Number(value);
  const paise = Math.round(amount * 100);
  if (!Number.isFinite(amount) || amount <= 0 || !Number.isSafeInteger(paise) || Math.abs(amount * 100 - paise) > 1e-7) return null;
  return paise;
}

async function verifyAndGrant(orderId: string, uid: string) {
  const db = getAdminDb();
  const orderRef = db.collection("watchVideoPaymentOrders").doc(orderId);
  const orderSnap = await orderRef.get();
  if (!orderSnap.exists || orderSnap.data()?.userId !== uid) throw new Error("ORDER_NOT_FOUND");
  const order = orderSnap.data()!;
  const videoId = typeof order.videoId === "string" ? order.videoId : "";
  const purchaseId = `${videoId}_${uid}`;
  if (!videoId || videoId.length > 200 || !/^[A-Za-z0-9_-]{3,50}$/.test(String(order.cashfreeOrderId || orderId))) throw new Error("ORDER_INVALID");
  if (order.status === "paid") {
    const existing = await db.collection("watchVideoPurchases").doc(purchaseId).get();
    return existing.exists && existing.data()?.status === "paid" && existing.data()?.accessRevoked !== true;
  }

  const expectedPaise = validInrAmount(order.amount);
  if (expectedPaise === null) throw new Error("ORDER_AMOUNT_INVALID");
  const config = await getCashfreeConfig();
  const providerOrderId = String(order.cashfreeOrderId || orderId);
  const payments = await cashfreeRequest<Payment[]>(config, `/orders/${encodeURIComponent(providerOrderId)}/payments`, { method: "GET" });
  if (!Array.isArray(payments)) throw new Error("CASHFREE_PAYMENT_RESPONSE_INVALID");
  const successful = payments.filter((payment) => {
    const paymentId = String(payment.cf_payment_id ?? "").trim();
    return payment.payment_status?.toUpperCase() === "SUCCESS" && payment.order_id === providerOrderId && payment.payment_currency?.toUpperCase() === "INR" && paymentId.length > 0 && validInrAmount(payment.payment_amount) === expectedPaise;
  });
  if (successful.length === 0) return false;
  if (successful.length > 1) throw new Error("MULTIPLE_SUCCESSFUL_PAYMENTS_REVIEW_REQUIRED");
  const payment = successful[0];
  const paymentId = String(payment.cf_payment_id);
  const purchaseRef = db.collection("watchVideoPurchases").doc(purchaseId);
  const paymentEventRef = db.collection("watchVideoPaymentEvents").doc(paymentId);

  await db.runTransaction(async (tx) => {
    const [freshOrder, purchase, paymentEvent] = await Promise.all([tx.get(orderRef), tx.get(purchaseRef), tx.get(paymentEventRef)]);
    if (!freshOrder.exists || freshOrder.data()?.userId !== uid || freshOrder.data()?.videoId !== videoId) throw new Error("ORDER_MISMATCH");
    if (paymentEvent.exists && paymentEvent.data()?.orderId !== orderId) throw new Error("PAYMENT_ID_REUSED");
    if (purchase.exists && purchase.data()?.status === "paid" && purchase.data()?.accessRevoked !== true) {
      if (purchase.data()?.orderId !== orderId) throw new Error("PURCHASE_ALREADY_EXISTS_REVIEW_REQUIRED");
      return;
    }
    tx.set(purchaseRef, {
      videoId, userId: uid, orderId, amount: Number(order.amount), currency: "INR",
      status: "paid", cfPaymentId: paymentId, purchasedAt: FieldValue.serverTimestamp(), accessRevoked: false,
    }, { merge: true });
    tx.update(orderRef, { status: "paid", cfPaymentId: paymentId, paidAt: FieldValue.serverTimestamp() });
    tx.create(paymentEventRef, { orderId, videoId, userId: uid, cfPaymentId: paymentId, amount: Number(payment.payment_amount), currency: "INR", createdAt: FieldValue.serverTimestamp() });
  });
  return true;
}

export async function POST(req: Request) {
  try {
    const header = req.headers.get("authorization");
    if (!header?.startsWith("Bearer ")) return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
    const decoded = await getAdminAuth().verifyIdToken(header.slice(7).trim(), true);
    const parsed = await readBoundedJson(req, 4 * 1024);
    if (!parsed.ok) return NextResponse.json({ success: false, error: parsed.message }, { status: parsed.status });
    const body = parsed.value as Record<string, unknown>;
    const orderId = typeof body?.orderId === "string" ? body.orderId.trim() : "";
    if (!/^[A-Za-z0-9_-]{3,50}$/.test(orderId)) return NextResponse.json({ success: false, error: "Invalid order" }, { status: 400 });
    const paid = await verifyAndGrant(orderId, decoded.uid);
    const orderSnap = await getAdminDb().collection("watchVideoPaymentOrders").doc(orderId).get();
    const verifiedOrder = orderSnap.data();
    return NextResponse.json({ success: true, paid, ...(paid && typeof verifiedOrder?.videoId === "string" ? { videoId: verifiedOrder.videoId } : {}) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const code = error instanceof Error ? error.message : "unknown";
    console.error("Paid video payment verification failed", code);
    const status = code === "ORDER_NOT_FOUND" ? 404 : code === "ORDER_INVALID" ? 400 : 500;
    return NextResponse.json({ success: false, error: status === 404 ? "Order not found" : "Payment verification unavailable; manual review may be required" }, { status, headers: { "Cache-Control": "no-store" } });
  }
}
