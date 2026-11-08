import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";
import { cashfreeRequest, getCashfreeConfig } from "@/lib/payments/cashfree";
import { calculatePaidVideoRefundReversal } from "@/lib/server/paidVideoRefundReversal.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const reply = (error: string, status: number) =>
  NextResponse.json({ success: false, error }, { status, headers: { "Cache-Control": "no-store" } });

function paise(value: unknown): number | null {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  const result = Math.round(amount * 100);
  return Number.isSafeInteger(result) && Math.abs(amount * 100 - result) < 1e-7 ? result : null;
}

async function adminUid(req: Request): Promise<string> {
  const auth = req.headers.get("authorization") || "";
  if (!auth.startsWith("Bearer ")) throw new Error("UNAUTHORIZED");
  const decoded = await getAdminAuth().verifyIdToken(auth.slice(7).trim(), true);
  const db = getAdminDb();
  const user = await db.collection("users").doc(decoded.uid).get();
  let role = user.data()?.role;
  if (role !== "admin" && role !== "super_admin") {
    const fallback = await db.collection("users").where("uid", "==", decoded.uid).limit(1).get();
    role = fallback.docs[0]?.data()?.role;
  }
  if (role !== "admin" && role !== "super_admin") throw new Error("FORBIDDEN");
  return decoded.uid;
}

export async function POST(req: NextRequest) {
  try {
    const actorUid = await adminUid(req);
    const raw = await req.text();
    if (Buffer.byteLength(raw, "utf8") > 4096) return reply("Request too large", 413);
    let body: Record<string, unknown>;
    try {
      const value: unknown = JSON.parse(raw);
      if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error();
      body = value as Record<string, unknown>;
    } catch { return reply("Invalid request", 400); }
    const orderId = typeof body.orderId === "string" ? body.orderId.trim() : "";
    if (!/^[A-Za-z0-9_-]{3,50}$/.test(orderId)) return reply("Invalid order ID", 400);

    const db = getAdminDb();
    const orderRef = db.collection("watchVideoPaymentOrders").doc(orderId);
    const orderSnap = await orderRef.get();
    if (!orderSnap.exists) return reply("Paid-video order not found", 404);
    const order = orderSnap.data() || {};
    const providerOrderId = typeof order.cashfreeOrderId === "string" ? order.cashfreeOrderId : "";
    const originalPaise = paise(order.amount);
    if (order.status !== "paid" || !providerOrderId || !/^[A-Za-z0-9_-]{3,50}$/.test(providerOrderId) ||
        originalPaise === null || typeof order.cfPaymentId !== "string" || !order.cfPaymentId ||
        typeof order.videoId !== "string" || typeof order.userId !== "string") {
      return reply("Order is not a verified paid-video purchase", 409);
    }

    const config = await getCashfreeConfig({ requireEnabled: false });
    const refunds = await cashfreeRequest<Record<string, unknown>[]>(config, `/orders/${encodeURIComponent(providerOrderId)}/refunds`);
    if (!Array.isArray(refunds) || refunds.length > 500) return reply("Cashfree refund history unavailable; manual review required", 502);
    let confirmedPaise = 0;
    for (const refund of refunds) {
      const status = String(refund.refund_status || "").toUpperCase();
      if (!["SUCCESS", "PENDING", "PENDING_APPROVAL", "ONHOLD", "CANCELLED", "REJECTED"].includes(status)) {
        return reply("Unknown Cashfree refund status; manual review required", 409);
      }
      if (status !== "SUCCESS") continue;
      if (typeof refund.refund_id !== "string" || !/^[A-Za-z0-9_-]{3,50}$/.test(refund.refund_id)) {
        return reply("Malformed successful refund; manual review required", 409);
      }
      const amount = paise(refund.refund_amount);
      if (amount === null) return reply("Malformed successful refund amount; manual review required", 409);
      confirmedPaise += amount;
      if (!Number.isSafeInteger(confirmedPaise) || confirmedPaise > originalPaise) {
        return reply("Cashfree refunds exceed original payment; manual review required", 409);
      }
    }

    const purchaseRef = db.collection("watchVideoPurchases").doc(`${order.videoId}_${order.userId}`);
    const result = await db.runTransaction(async (tx) => {
      const [freshOrder, purchase] = await Promise.all([tx.get(orderRef), tx.get(purchaseRef)]);
      const current = freshOrder.data() || {};
      if (!freshOrder.exists || current.status !== "paid" || current.cfPaymentId !== order.cfPaymentId ||
          paise(current.amount) !== originalPaise) throw new Error("ORDER_CHANGED");
      const previous = Number.isSafeInteger(current.shortsRefundedPaise) ? Number(current.shortsRefundedPaise) : 0;
      if (confirmedPaise < previous) throw new Error("PROVIDER_TOTAL_REGRESSED");
      if (confirmedPaise === previous) return { changed: false, cumulativeRefundPaise: previous };
      const delta = calculatePaidVideoRefundReversal({
        originalPaise, previouslyRefundedPaise: previous,
        newlyConfirmedRefundPaise: confirmedPaise - previous,
      });
      const ledger = db.collection("shortsSettlementLedger");
      const suffix = String(confirmedPaise);
      const refs = [
        ledger.doc(`paidvideo_refund_${orderId}_${suffix}_creator`),
        ledger.doc(`paidvideo_refund_${orderId}_${suffix}_sharer`),
        ledger.doc(`paidvideo_refund_${orderId}_${suffix}_platform`),
      ];
      const existing = await Promise.all(refs.map((ref) => tx.get(ref)));
      const common = {
        orderId, videoId: current.videoId, buyerUid: current.userId,
        cfPaymentId: current.cfPaymentId, currency: "INR",
        source: "cashfree_confirmed_paid_video_refund",
        status: "pending_settlement_reversal",
        cumulativeRefundPaise: confirmedPaise,
        createdAt: FieldValue.serverTimestamp(), createdByAdminUid: actorUid,
      };
      const amounts = [delta.creatorPaise, delta.sharerPaise, delta.platformPaise];
      const types = ["creator_share_reversal", "sharer_share_reversal", "platform_share_reversal"];
      const beneficiaries = [
        typeof current.creatorId === "string" ? current.creatorId : null,
        current.sharerAttributionVerified === true && typeof current.sharerId === "string" ? current.sharerId : null,
        "platform",
      ];
      for (let i = 0; i < refs.length; i++) {
        if (!existing[i].exists) tx.create(refs[i], {
          ...common, entryType: types[i], beneficiaryUid: beneficiaries[i],
          amountPaise: -amounts[i], attributionVerified: i !== 1 || Boolean(beneficiaries[i]),
        });
      }
      tx.update(orderRef, {
        shortsRefundedPaise: confirmedPaise,
        shortsRefundReconciledAt: FieldValue.serverTimestamp(),
      });
      if (purchase.exists) {
        tx.update(purchaseRef, confirmedPaise === originalPaise ? {
          accessRevoked: true, status: "refunded",
          accessRevokedAt: FieldValue.serverTimestamp(), refundTotalPaise: confirmedPaise,
        } : { refundTotalPaise: confirmedPaise, partiallyRefunded: true });
      }
      return { changed: true, cumulativeRefundPaise: confirmedPaise, delta };
    });
    return NextResponse.json({ success: true, ...result }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN";
    const status = code === "UNAUTHORIZED" ? 401 : code === "FORBIDDEN" ? 403 :
      code === "ORDER_CHANGED" || code === "PROVIDER_TOTAL_REGRESSED" ? 409 : 500;
    console.error("Paid-video refund reconciliation failed", code);
    return reply(status === 401 ? "Authentication required" : status === 403 ? "Admin access required" :
      "Refund reconciliation failed; manual review may be required", status);
  }
}
