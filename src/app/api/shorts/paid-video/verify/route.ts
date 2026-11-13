import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";
import { readBoundedJson } from "@/lib/server/readBoundedJson";
import { cashfreeRequest, getCashfreeConfig } from "@/lib/payments/cashfree";
import { resolvePaidVideoSharer, splitPaidVideoRevenue } from "@/lib/server/paidVideoRevenueSplit.mjs";
import { isPaidOrderDuplicatePayment } from "@/lib/server/paidVideoDuplicatePaymentGuard.mjs";

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
  if (order.paymentProvider !== "cashfree" || order.status === "cancelled" || order.status === "expired") {
    throw new Error("ORDER_INVALID");
  }
  const videoId = typeof order.videoId === "string" ? order.videoId : "";
  if (!videoId || videoId.length > 200 || !/^[A-Za-z0-9_-]{3,50}$/.test(String(order.cashfreeOrderId || orderId))) throw new Error("ORDER_INVALID");

  // Never grant or preserve a purchase entitlement unless the exact video is
  // approved, safe, active, and explicitly enabled for paid checkout.
  const videoRef = db.collection("watchEarnVideos").doc(videoId);
  const videoSnap = await videoRef.get();
  const video = videoSnap.data();
  if (
    !videoSnap.exists ||
    video?.status !== "approved" ||
    video?.active !== true ||
    video?.moderation !== "safe" ||
    video?.videoAccess !== "paid" ||
    video?.paidVideoStatus !== "enabled" ||
    video?.paidCheckoutEnabled !== true ||
    typeof video?.creatorId !== "string" || video.creatorId.trim().length === 0 ||
    typeof order.creatorId !== "string" || order.creatorId !== video.creatorId
  ) {
    throw new Error("VIDEO_NOT_ELIGIBLE_FOR_PAID_PURCHASE");
  }
  const expectedVideoPaise = validInrAmount(video.videoPrice);
  const orderVideoPaise = validInrAmount(order.amount);
  if (expectedVideoPaise === null || orderVideoPaise === null || expectedVideoPaise !== orderVideoPaise) {
    throw new Error("ORDER_VIDEO_AMOUNT_MISMATCH");
  }
  const purchaseId = `${videoId}_${uid}`;
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
  const totalPaise = expectedPaise;
  const split = splitPaidVideoRevenue(totalPaise);
  const sharerUid = resolvePaidVideoSharer(order, uid, String(video.creatorId));
  const ledgerCollection = db.collection("shortsSettlementLedger");
  const ledgerRefs = [
    ledgerCollection.doc(`paidvideo_${orderId}_creator`),
    ledgerCollection.doc(`paidvideo_${orderId}_sharer`),
    ledgerCollection.doc(`paidvideo_${orderId}_platform`),
  ];

  const transactionResult = await db.runTransaction(async (tx) => {
    const [freshOrder, freshVideo, purchase, paymentEvent, creatorLedger, sharerLedger, platformLedger] = await Promise.all([tx.get(orderRef), tx.get(videoRef), tx.get(purchaseRef), tx.get(paymentEventRef), tx.get(ledgerRefs[0]), tx.get(ledgerRefs[1]), tx.get(ledgerRefs[2])]);
    const freshOrderData = freshOrder.data();
    const freshVideoData = freshVideo.data();
    if (!freshOrder.exists || freshOrderData?.userId !== uid || freshOrderData?.videoId !== videoId) throw new Error("ORDER_MISMATCH");
    if (!freshVideo.exists || freshVideoData?.status !== "approved" || freshVideoData?.active !== true || freshVideoData?.moderation !== "safe" || freshVideoData?.videoAccess !== "paid" || freshVideoData?.paidVideoStatus !== "enabled" || freshVideoData?.paidCheckoutEnabled !== true || typeof freshVideoData?.creatorId !== "string" || freshVideoData.creatorId.trim().length === 0 || typeof freshOrderData?.creatorId !== "string" || freshVideoData.creatorId !== freshOrderData.creatorId) throw new Error("VIDEO_NOT_ELIGIBLE_FOR_PAID_PURCHASE");
    if (validInrAmount(freshVideoData?.videoPrice) !== validInrAmount(freshOrderData?.amount)) throw new Error("ORDER_VIDEO_AMOUNT_MISMATCH");
    if (paymentEvent.exists && paymentEvent.data()?.orderId !== orderId) throw new Error("PAYMENT_ID_REUSED");
    // Match the webhook's duplicate-success protection. Commit only the review
    // marker, then return a non-success result outside the transaction so the
    // marker is not rolled back by a thrown exception.
    if (isPaidOrderDuplicatePayment(freshOrderData?.status, freshOrderData?.cfPaymentId, paymentId)) {
      tx.update(orderRef, {
        duplicatePaymentReviewRequired: true,
        duplicatePaymentId: paymentId,
        updatedAt: FieldValue.serverTimestamp(),
      });
      return { status: "duplicate_payment_review" as const };
    }
    if (purchase.exists && purchase.data()?.status === "paid" && purchase.data()?.accessRevoked !== true && purchase.data()?.orderId !== orderId) {
      throw new Error("PURCHASE_ALREADY_EXISTS_REVIEW_REQUIRED");
    }
    if (!purchase.exists || purchase.data()?.status !== "paid" || purchase.data()?.accessRevoked === true) tx.set(purchaseRef, {
      videoId, userId: uid, orderId, amount: Number(order.amount), currency: "INR",
      status: "paid", cfPaymentId: paymentId, purchasedAt: FieldValue.serverTimestamp(), accessRevoked: false,
    }, { merge: true });
    if (freshOrderData?.status !== "paid") tx.update(orderRef, { status: "paid", cfPaymentId: paymentId, paidAt: FieldValue.serverTimestamp() });
    if (!paymentEvent.exists) tx.create(paymentEventRef, { orderId, videoId, userId: uid, cfPaymentId: paymentId, amount: Number(payment.payment_amount), currency: "INR", createdAt: FieldValue.serverTimestamp() });

    // Accrue a traceable revenue split only after provider payment verification.
    // These entries do not credit wallets or trigger payouts.
    const now = FieldValue.serverTimestamp();
    const common = { orderId, videoId, buyerUid: uid, cfPaymentId: paymentId, currency: "INR", source: "cashfree_verified_paid_video", status: "pending_settlement", createdAt: now };
    if (!creatorLedger.exists) tx.create(ledgerRefs[0], { ...common, entryType: "creator_share", beneficiaryUid: String(freshVideoData?.creatorId), amountPaise: split.creatorPaise });
    if (!sharerLedger.exists) tx.create(ledgerRefs[1], { ...common, entryType: sharerUid ? "sharer_share" : "sharer_share_unallocated", beneficiaryUid: sharerUid, amountPaise: split.sharerPaise, attributionVerified: Boolean(sharerUid) });
    if (!platformLedger.exists) tx.create(ledgerRefs[2], { ...common, entryType: "platform_share", beneficiaryUid: "platform", amountPaise: split.platformPaise });
    return { status: "verified" as const };
  });
  if (transactionResult.status === "duplicate_payment_review") {
    throw new Error("DUPLICATE_PAYMENT_REVIEW_REQUIRED");
  }
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
    const status = code === "ORDER_NOT_FOUND" ? 404 : code === "ORDER_INVALID" ? 400 :
      code === "VIDEO_NOT_ELIGIBLE_FOR_PAID_PURCHASE" || code === "ORDER_VIDEO_AMOUNT_MISMATCH" ||
      code === "DUPLICATE_PAYMENT_REVIEW_REQUIRED" ? 409 : 500;
    const message = code === "DUPLICATE_PAYMENT_REVIEW_REQUIRED"
      ? "A different successful payment was detected; manual review is required"
      : status === 404 ? "Order not found"
      : status === 409 ? "This video is not eligible for purchase"
      : "Payment verification unavailable; manual review may be required";
    return NextResponse.json({ success: false, error: message }, { status, headers: { "Cache-Control": "no-store" } });
  }
}
