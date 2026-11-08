import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/firebase/admin";
import { splitPaidVideoRevenue, resolvePaidVideoSharer } from "@/lib/server/paidVideoRevenueSplit.mjs";
import { getCashfreeConfig, verifyCashfreeWebhookSignature } from "@/lib/payments/cashfree";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const declared = Number(req.headers.get("content-length") || 0);
    if (declared > 131072) return NextResponse.json({ success: false }, { status: 413 });
    const rawBody = await req.text();
    if (Buffer.byteLength(rawBody, "utf8") > 131072) return NextResponse.json({ success: false }, { status: 413 });
    const config = await getCashfreeConfig({ requireEnabled: false });
    const signature = req.headers.get("x-webhook-signature") || "";
    const timestamp = req.headers.get("x-webhook-timestamp") || "";
    if (!verifyCashfreeWebhookSignature(rawBody, timestamp, signature, config.webhookSecret)) return NextResponse.json({ success: false }, { status: 401 });
    let payload: Record<string, any>;
    try { const parsed: unknown = JSON.parse(rawBody); if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("INVALID_PAYLOAD"); payload = parsed as Record<string, any>; }
    catch { return NextResponse.json({ success: false }, { status: 400 }); }
    const providerOrderId = typeof payload.data?.order?.order_id === "string" ? payload.data.order.order_id : "";
    const payment = payload.data?.payment;
    const rawPaymentId = payment?.cf_payment_id;
    if (!providerOrderId || !payment || (typeof rawPaymentId !== "string" && typeof rawPaymentId !== "number")) return NextResponse.json({ success: true, ignored: true });
    if (String(payment.payment_status || "").toUpperCase() !== "SUCCESS") return NextResponse.json({ success: true, ignored: true });
    const db = getAdminDb();
    const matches = await db.collection("watchVideoPaymentOrders").where("cashfreeOrderId", "==", providerOrderId).limit(2).get();
    if (matches.size !== 1) return NextResponse.json({ success: false, reason: matches.empty ? "order_not_found" : "ambiguous_order" }, { status: matches.empty ? 404 : 409 });
    const orderDoc = matches.docs[0];
    const orderId = orderDoc.id;
    const order = orderDoc.data();
    const paymentId = String(rawPaymentId).trim();
    const amount = Number(payment.payment_amount);
    const amountPaise = Math.round(amount * 100);
    const expectedPaise = Number.isSafeInteger(order.amountPaise) ? Number(order.amountPaise) : Math.round(Number(order.amount) * 100);
    if (!paymentId || paymentId.length > 128 || String(payment.payment_currency || "").toUpperCase() !== "INR" || !Number.isSafeInteger(amountPaise) || Math.abs(amount * 100 - amountPaise) > 1e-7 || expectedPaise <= 0 || amountPaise !== expectedPaise || payment.order_id !== providerOrderId) return NextResponse.json({ success: false, reason: "payment_reconciliation_failed" }, { status: 409 });
    const videoId = typeof order.videoId === "string" ? order.videoId : "";
    const buyerUid = typeof order.userId === "string" ? order.userId : "";
    const creatorUid = typeof order.creatorId === "string" ? order.creatorId : "";
    if (!videoId || !buyerUid || !creatorUid || buyerUid === creatorUid) return NextResponse.json({ success: false }, { status: 409 });
    const videoRef = db.collection("watchEarnVideos").doc(videoId);
    const purchaseRef = db.collection("watchVideoPurchases").doc(`${videoId}_${buyerUid}`);
    const eventRef = db.collection("watchVideoPaymentEvents").doc(paymentId);
    const split = splitPaidVideoRevenue(expectedPaise);
    const sharerUid = resolvePaidVideoSharer(order, buyerUid, creatorUid);
    await db.runTransaction(async (tx) => {
      const [freshOrder, videoSnap, purchaseSnap, eventSnap] = await Promise.all([tx.get(orderDoc.ref), tx.get(videoRef), tx.get(purchaseRef), tx.get(eventRef)]);
      const current = freshOrder.data() || {}; const video = videoSnap.data() || {};
      if (!freshOrder.exists || current.cashfreeOrderId !== providerOrderId || current.userId !== buyerUid || current.videoId !== videoId || current.creatorId !== creatorUid || ["cancelled", "expired"].includes(String(current.status))) throw new Error("SHORTS_ORDER_MISMATCH");
      if (!videoSnap.exists || video.status !== "approved" || video.active !== true || video.moderation !== "safe" || video.videoAccess !== "paid" || video.paidVideoStatus !== "enabled" || video.paidCheckoutEnabled !== true || video.creatorId !== creatorUid || Math.round(Number(video.videoPrice) * 100) !== expectedPaise) throw new Error("SHORTS_VIDEO_NOT_ELIGIBLE");
      if (eventSnap.exists) { if (eventSnap.data()?.orderId !== orderId) throw new Error("SHORTS_PAYMENT_ID_REUSED"); return; }
      if (current.status === "paid" && current.cfPaymentId !== paymentId) { tx.update(orderDoc.ref, { duplicatePaymentReviewRequired: true, duplicatePaymentId: paymentId, updatedAt: FieldValue.serverTimestamp() }); return; }
      if (purchaseSnap.exists && purchaseSnap.data()?.status === "paid" && purchaseSnap.data()?.accessRevoked !== true && purchaseSnap.data()?.orderId !== orderId) throw new Error("SHORTS_PURCHASE_CONFLICT");
      const ledger = db.collection("shortsSettlementLedger");
      const refs = [ledger.doc(`paidvideo_${orderId}_creator`), ledger.doc(`paidvideo_${orderId}_sharer`), ledger.doc(`paidvideo_${orderId}_platform`)];
      const snaps = await Promise.all(refs.map((ref) => tx.get(ref)));
      const common = { orderId, videoId, buyerUid, cfPaymentId: paymentId, currency: "INR", source: "cashfree_signed_webhook", status: "pending_settlement", createdAt: FieldValue.serverTimestamp() };
      tx.set(purchaseRef, { videoId, userId: buyerUid, orderId, amount: expectedPaise / 100, amountPaise: expectedPaise, currency: "INR", status: "paid", cfPaymentId: paymentId, purchasedAt: FieldValue.serverTimestamp(), accessRevoked: false }, { merge: true });
      tx.update(orderDoc.ref, { status: "paid", cfPaymentId: paymentId, paidAt: FieldValue.serverTimestamp(), paymentVerifiedBy: "cashfree_signed_webhook" });
      tx.create(eventRef, { orderId, videoId, userId: buyerUid, cfPaymentId: paymentId, amountPaise, currency: "INR", source: "cashfree_signed_webhook", createdAt: FieldValue.serverTimestamp() });
      if (!snaps[0].exists) tx.create(refs[0], { ...common, entryType: "creator_share", beneficiaryUid: creatorUid, amountPaise: split.creatorPaise });
      if (!snaps[1].exists) tx.create(refs[1], { ...common, entryType: sharerUid ? "sharer_share" : "sharer_share_unallocated", beneficiaryUid: sharerUid, amountPaise: split.sharerPaise, attributionVerified: Boolean(sharerUid) });
      if (!snaps[2].exists) tx.create(refs[2], { ...common, entryType: "platform_share", beneficiaryUid: "platform", amountPaise: split.platformPaise });
    });
    return NextResponse.json({ success: true, result: "shorts_paid_video_processed" }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const code = error instanceof Error ? error.message : "unknown";
    console.error("Shorts Cashfree webhook processing failed:", code);
    const status = code === "SHORTS_ORDER_MISMATCH" || code === "SHORTS_VIDEO_NOT_ELIGIBLE" || code === "SHORTS_PURCHASE_CONFLICT" || code === "SHORTS_PAYMENT_ID_REUSED" ? 409 : 503;
    return NextResponse.json({ success: false }, { status });
  }
}
