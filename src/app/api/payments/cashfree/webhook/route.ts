import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/firebase/admin";
import { splitPaidVideoRevenue, resolvePaidVideoSharer } from "@/lib/server/paidVideoRevenueSplit.mjs";
import { confirmCashfreePayment, getCashfreeConfig, verifyCashfreeWebhookSignature } from "@/lib/payments/cashfree";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const contentLength = Number(req.headers.get("content-length") || 0);
    if (contentLength > 131072) return NextResponse.json({ success: false }, { status: 413 });
    const rawBody = await req.text();
    if (Buffer.byteLength(rawBody, "utf8") > 131072) return NextResponse.json({ success: false }, { status: 413 });

    const signature = req.headers.get("x-webhook-signature") || "";
    const timestamp = req.headers.get("x-webhook-timestamp") || "";
    const config = await getCashfreeConfig({ requireEnabled: false });
    if (!verifyCashfreeWebhookSignature(rawBody, timestamp, signature, config.webhookSecret)) {
      return NextResponse.json({ success: false }, { status: 401 });
    }

    let payload: Record<string, any>;
    try {
      const parsed: unknown = JSON.parse(rawBody);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("INVALID_PAYLOAD");
      payload = parsed as Record<string, any>;
    } catch {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    const providerOrderId = typeof payload.data?.order?.order_id === "string" ? payload.data.order.order_id : "";
    const payment = payload.data?.payment;
    const paymentId = payment?.cf_payment_id;
    if (!providerOrderId || !payment || (typeof paymentId !== "string" && typeof paymentId !== "number")) {
      // Validly signed non-payment or incomplete event: acknowledge to prevent endless retries.
      return NextResponse.json({ success: true, ignored: true });
    }

    // Cashfree's order_id is a provider identifier, not necessarily the
    // Firestore document ID. Resolve it through the persisted mapping first.
    // More than one match is ambiguous and must never credit an arbitrary order.
    const db = getAdminDb();
    const matchingOrders = await db.collection("orders")
      .where("cashfreeOrderId", "==", providerOrderId)
      .limit(2)
      .get();
    if (matchingOrders.size > 1) {
      console.error("Cashfree webhook provider order ID maps to multiple Jembee Shorts orders");
      return NextResponse.json({ success: false }, { status: 409 });
    }

    let internalOrderId = matchingOrders.docs[0]?.id || "";
    // Compatibility for older orders created before cashfreeOrderId was stored.
    if (!internalOrderId) {
      const legacyOrder = await db.collection("orders").doc(providerOrderId).get();
      if (legacyOrder.exists && legacyOrder.data()?.cashfreeOrderId === providerOrderId) {
        internalOrderId = legacyOrder.id;
      }
    }
    if (!internalOrderId) {
      // Shorts paid-video orders use a separate collection and settlement ledger.
      const shortsMatches = await db.collection("watchVideoPaymentOrders")
        .where("cashfreeOrderId", "==", providerOrderId).limit(2).get();
      if (shortsMatches.size > 1) return NextResponse.json({ success: false }, { status: 409 });
      const shortsDoc = shortsMatches.docs[0];
      if (!shortsDoc) return NextResponse.json({ success: false }, { status: 404 });
      const orderId = shortsDoc.id;
      const shortsOrderRef = shortsDoc.ref;
      const shortsOrder = shortsDoc.data();
      const paymentStatus = String(payment.payment_status || "").toUpperCase();
      if (paymentStatus !== "SUCCESS") return NextResponse.json({ success: true, ignored: true });
      const paymentId = String(payment.cf_payment_id ?? "").trim();
      const amount = Number(payment.payment_amount);
      const amountPaise = Math.round(amount * 100);
      const expectedPaise = Number.isSafeInteger(shortsOrder.amountPaise)
        ? Number(shortsOrder.amountPaise)
        : Math.round(Number(shortsOrder.amount) * 100);
      if (!paymentId || paymentId.length > 128 ||
          String(payment.payment_currency || "").toUpperCase() !== "INR" ||
          !Number.isSafeInteger(amountPaise) || Math.abs(amount * 100 - amountPaise) > 1e-7 ||
          expectedPaise <= 0 || amountPaise !== expectedPaise) {
        return NextResponse.json({ success: false }, { status: 409 });
      }

      const videoId = typeof shortsOrder.videoId === "string" ? shortsOrder.videoId : "";
      const buyerUid = typeof shortsOrder.userId === "string" ? shortsOrder.userId : "";
      const creatorUid = typeof shortsOrder.creatorId === "string" ? shortsOrder.creatorId : "";
      if (!videoId || !buyerUid || !creatorUid || buyerUid === creatorUid) {
        return NextResponse.json({ success: false }, { status: 409 });
      }
      const videoRef = db.collection("watchEarnVideos").doc(videoId);
      const purchaseRef = db.collection("watchVideoPurchases").doc(`${videoId}_${buyerUid}`);
      const paymentEventRef = db.collection("watchVideoPaymentEvents").doc(paymentId);
      const split = splitPaidVideoRevenue(expectedPaise);
      const sharerUid = resolvePaidVideoSharer(shortsOrder, buyerUid, creatorUid);
      await db.runTransaction(async (tx) => {
        const [freshOrder, videoSnap, purchaseSnap, eventSnap] = await Promise.all([
          tx.get(shortsOrderRef), tx.get(videoRef), tx.get(purchaseRef), tx.get(paymentEventRef),
        ]);
        const current = freshOrder.data() || {};
        const video = videoSnap.data() || {};
        if (!freshOrder.exists || current.cashfreeOrderId !== providerOrderId ||
            current.userId !== buyerUid || current.videoId !== videoId ||
            current.creatorId !== creatorUid || current.status === "cancelled") throw new Error("SHORTS_ORDER_MISMATCH");
        if (!videoSnap.exists || video.status !== "approved" || video.active !== true ||
            video.moderation !== "safe" || video.videoAccess !== "paid" ||
            video.paidVideoStatus !== "enabled" || video.paidCheckoutEnabled !== true ||
            video.creatorId !== creatorUid ||
            Math.round(Number(video.videoPrice) * 100) !== expectedPaise) throw new Error("SHORTS_VIDEO_NOT_ELIGIBLE");
        if (eventSnap.exists) {
          if (eventSnap.data()?.orderId !== orderId) throw new Error("SHORTS_PAYMENT_ID_REUSED");
          return;
        }
        if (current.status === "paid" && current.cfPaymentId !== paymentId) {
          tx.update(shortsOrderRef, { duplicatePaymentReviewRequired: true, duplicatePaymentId: paymentId, updatedAt: FieldValue.serverTimestamp() });
          return;
        }
        if (purchaseSnap.exists && purchaseSnap.data()?.status === "paid" &&
            purchaseSnap.data()?.accessRevoked !== true && purchaseSnap.data()?.orderId !== orderId) {
          throw new Error("SHORTS_PURCHASE_CONFLICT");
        }
        const ledger = db.collection("shortsSettlementLedger");
        const refs = [
          ledger.doc(`paidvideo_${orderId}_creator`),
          ledger.doc(`paidvideo_${orderId}_sharer`),
          ledger.doc(`paidvideo_${orderId}_platform`),
        ];
        const snapshots = await Promise.all(refs.map((ref) => tx.get(ref)));
        const common = {
          orderId, videoId, buyerUid, cfPaymentId: paymentId, currency: "INR",
          source: "cashfree_verified_paid_video", status: "pending_settlement",
          createdAt: FieldValue.serverTimestamp(),
        };
        tx.set(purchaseRef, {
          videoId, userId: buyerUid, orderId, amount: expectedPaise / 100, amountPaise: expectedPaise,
          currency: "INR", status: "paid", cfPaymentId: paymentId,
          purchasedAt: FieldValue.serverTimestamp(), accessRevoked: false,
        }, { merge: true });
        tx.update(shortsOrderRef, {
          status: "paid", cfPaymentId: paymentId, paidAt: FieldValue.serverTimestamp(),
          paymentVerifiedBy: "cashfree_signed_webhook",
        });
        tx.create(paymentEventRef, {
          orderId, videoId, userId: buyerUid, cfPaymentId: paymentId,
          amountPaise, currency: "INR", source: "cashfree_signed_webhook",
          createdAt: FieldValue.serverTimestamp(),
        });
        if (!snapshots[0].exists) tx.create(refs[0], { ...common, entryType: "creator_share", beneficiaryUid: creatorUid, amountPaise: split.creatorPaise });
        if (!snapshots[1].exists) tx.create(refs[1], { ...common, entryType: sharerUid ? "sharer_share" : "sharer_share_unallocated", beneficiaryUid: sharerUid, amountPaise: split.sharerPaise, attributionVerified: Boolean(sharerUid) });
        if (!snapshots[2].exists) tx.create(refs[2], { ...common, entryType: "platform_share", beneficiaryUid: "platform", amountPaise: split.platformPaise });
      });
      return NextResponse.json({ success: true, result: "shorts_paid_video_processed" });
    }

    const result = await confirmCashfreePayment(internalOrderId, providerOrderId, payment as Record<string, unknown>);
    if (result === "order_not_found") return NextResponse.json({ success: false }, { status: 404 });
    if (result === "order_mismatch" || result === "amount_mismatch" || result === "payment_id_reused") {
      console.error("Cashfree webhook rejected by order/amount reconciliation:", result);
      return NextResponse.json({ success: false }, { status: 409 });
    }
    if (result === "duplicate_payment_review" || result === "late_payment_after_cancel_review") {
      console.error("Cashfree payment requires manual review:", providerOrderId, result);
    }
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Cashfree webhook processing error:", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ success: false }, { status: 503 });
  }
}
