import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";
import { calculateTeacherReferralCommission } from "@/lib/server/teacherReferralCommission.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const reply = (error: string, status: number) => NextResponse.json({ success: false, error }, { status, headers: { "Cache-Control": "no-store" } });

async function requireAdmin(req: Request): Promise<string> {
  const header = req.headers.get("authorization") || "";
  if (!header.startsWith("Bearer ")) throw new Error("UNAUTHORIZED");
  const decoded = await getAdminAuth().verifyIdToken(header.slice(7).trim(), true);
  const users = getAdminDb().collection("users");
  let user = (await users.doc(decoded.uid).get()).data();
  if (user?.role !== "admin" && user?.role !== "super_admin") {
    const fallback = await users.where("uid", "==", decoded.uid).limit(1).get();
    user = fallback.docs[0]?.data();
  }
  if (user?.role !== "admin" && user?.role !== "super_admin") throw new Error("FORBIDDEN");
  return decoded.uid;
}

export async function POST(req: NextRequest) {
  try {
    const adminUid = await requireAdmin(req);
    const raw = await req.text();
    if (Buffer.byteLength(raw, "utf8") > 4096) return reply("Request too large", 413);
    let body: Record<string, unknown>;
    try { const parsed: unknown = JSON.parse(raw); if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error(); body = parsed as Record<string, unknown>; }
    catch { return reply("Invalid request", 400); }
    const orderId = typeof body.orderId === "string" ? body.orderId.trim() : "";
    if (!/^[A-Za-z0-9_-]{3,50}$/.test(orderId)) return reply("Invalid order ID", 400);

    const db = getAdminDb();
    const orderRef = db.collection("watchVideoPaymentOrders").doc(orderId);
    const netProfitRef = db.collection("shortsSettlementLedger").doc(`paidvideo_${orderId}_admin_net_profit`);
    const commissionRef = db.collection("shortsSettlementLedger").doc(`paidvideo_${orderId}_teacher_referral`);
    const result = await db.runTransaction(async (tx) => {
      const orderSnap = await tx.get(orderRef);
      if (!orderSnap.exists) throw new Error("ORDER_NOT_FOUND");
      const order = orderSnap.data() || {};
      if (order.status !== "paid" || typeof order.userId !== "string" || typeof order.videoId !== "string" || typeof order.creatorId !== "string" || typeof order.cfPaymentId !== "string") throw new Error("ORDER_NOT_VERIFIED_PAID_VIDEO");

      const ledgerQuery = db.collection("shortsSettlementLedger").where("orderId", "==", orderId);
      const expensesQuery = db.collection("shortsVerifiedExpenses").where("orderId", "==", orderId);
      const [ledgerSnap, expensesSnap, existingNet, existingCommission] = await Promise.all([tx.get(ledgerQuery), tx.get(expensesQuery), tx.get(netProfitRef), tx.get(commissionRef)]);
      if (existingNet.exists !== existingCommission.exists) throw new Error("PARTIAL_RECONCILIATION_REQUIRES_MANUAL_REVIEW");

      let platformNetBeforeCosts = 0;
      for (const doc of ledgerSnap.docs) {
        const entry = doc.data();
        if (["platform_share", "platform_share_reversal"].includes(String(entry.entryType))) {
          if (!Number.isSafeInteger(entry.amountPaise)) throw new Error("INVALID_PLATFORM_LEDGER_ENTRY");
          platformNetBeforeCosts += entry.amountPaise;
        }
      }
      if (!Number.isSafeInteger(platformNetBeforeCosts) || platformNetBeforeCosts < 0) throw new Error("PLATFORM_REVENUE_REQUIRES_MANUAL_REVIEW");
      let verifiedCosts = 0;
      for (const doc of expensesSnap.docs) {
        const expense = doc.data();
        if (expense.status !== "verified" || expense.currency !== "INR" || !Number.isSafeInteger(expense.amountPaise) || expense.amountPaise < 0 || typeof expense.evidenceRef !== "string" || !expense.evidenceRef.trim()) throw new Error("UNVERIFIED_EXPENSE_REQUIRES_MANUAL_REVIEW");
        verifiedCosts += expense.amountPaise;
      }
      if (!Number.isSafeInteger(verifiedCosts) || verifiedCosts > platformNetBeforeCosts) throw new Error("COSTS_EXCEED_PLATFORM_REVENUE");
      const adminNetProfitPaise = platformNetBeforeCosts - verifiedCosts;

      const teacherUid = typeof order.teacherUid === "string" ? order.teacherUid : "";
      if (teacherUid && teacherUid !== order.creatorId) throw new Error("TEACHER_ATTRIBUTION_ORDER_MISMATCH");
      let commissionPaise = 0;
      let referralReason = "NO_VERIFIED_TEACHER_REFERRAL";
      if (teacherUid) {
        const referralRef = db.collection("teacherReferralAttributions").doc(teacherUid);
        const referralSnap = await tx.get(referralRef);
        const referral = referralSnap.data() || {};
        const sharerUid = typeof referral.referrerUid === "string" ? referral.referrerUid : "";
        const calculated = calculateTeacherReferralCommission({
          adminNetProfitPaise,
          referralVerified: referral.status === "verified" && referral.teacherUid === teacherUid && referral.referrerUid === sharerUid && Boolean(sharerUid),
          teacherUid,
          sharerUid: sharerUid || "unassigned",
          creatorUid: order.creatorId,
          buyerUid: order.userId,
          sourceOrderId: orderId,
        });
        commissionPaise = calculated.commissionPaise;
        referralReason = calculated.reason;
        const previousCommissionPaise = existingCommission.exists && Number.isSafeInteger(existingCommission.data()?.amountPaise)
          ? Number(existingCommission.data()?.amountPaise) : 0;
        const commissionDeltaPaise = commissionPaise - previousCommissionPaise;
        if (!existingCommission.exists) {
          tx.create(commissionRef, {
            orderId, videoId: order.videoId, cfPaymentId: order.cfPaymentId,
            entryType: "teacher_referral_commission", beneficiaryUid: teacherUid === sharerUid ? null : sharerUid,
            teacherUid, amountPaise: commissionPaise, currency: "INR",
            source: "verified_refund_adjusted_admin_net_profit", status: commissionPaise > 0 ? "pending_settlement" : "not_eligible",
            basisAmountPaise: adminNetProfitPaise, referralVerified: commissionPaise > 0,
            createdAt: FieldValue.serverTimestamp(), createdByAdminUid: adminUid,
          });
        } else {
          const cumulativeRefundPaise = Number.isSafeInteger(order.shortsRefundedPaise) ? Number(order.shortsRefundedPaise) : 0;
          if (commissionDeltaPaise !== 0) {
            const adjustmentRef = db.collection("shortsSettlementLedger").doc(
              `paidvideo_${orderId}_teacher_referral_adjust_${cumulativeRefundPaise}_${commissionPaise}`
            );
            const adjustmentSnap = await tx.get(adjustmentRef);
            if (!adjustmentSnap.exists) tx.create(adjustmentRef, {
              orderId, videoId: order.videoId, cfPaymentId: order.cfPaymentId,
              entryType: "teacher_referral_commission_adjustment",
              beneficiaryUid: commissionPaise > 0 && typeof referralSnap.data()?.referrerUid === "string" ? referralSnap.data()!.referrerUid : null,
              teacherUid: teacherUid || null, amountPaise: commissionDeltaPaise, currency: "INR",
              source: "refund_adjusted_admin_net_profit_reconciliation",
              status: "pending_settlement_adjustment", basisAmountPaise: adminNetProfitPaise,
              cumulativeRefundPaise, createdAt: FieldValue.serverTimestamp(), createdByAdminUid: adminUid,
            });
          }
          tx.update(commissionRef, {
            amountPaise: commissionPaise, basisAmountPaise: adminNetProfitPaise,
            status: commissionPaise > 0 ? "pending_settlement" : "not_eligible",
            lastReconciledAt: FieldValue.serverTimestamp(), lastReconciledByAdminUid: adminUid,
          });
        }
      }
      const netProfitData = {
        orderId, videoId: order.videoId, cfPaymentId: order.cfPaymentId,
        entryType: "admin_net_profit", beneficiaryUid: "platform_admin",
        amountPaise: adminNetProfitPaise, grossPlatformSharePaise: platformNetBeforeCosts,
        verifiedCostsPaise: verifiedCosts, currency: "INR",
        source: "platform_share_less_verified_costs_and_refunds",
        status: "reconciled", lastReconciledAt: FieldValue.serverTimestamp(), lastReconciledByAdminUid: adminUid,
      };
      if (!existingNet.exists) tx.create(netProfitRef, { ...netProfitData, createdAt: FieldValue.serverTimestamp(), createdByAdminUid: adminUid });
      else tx.update(netProfitRef, netProfitData);
      if (!existingCommission.exists && commissionPaise === 0) tx.create(commissionRef, {
        orderId, videoId: order.videoId, cfPaymentId: order.cfPaymentId,
        entryType: "teacher_referral_commission", beneficiaryUid: null,
        teacherUid: teacherUid || null, amountPaise: 0, currency: "INR",
        source: "verified_refund_adjusted_admin_net_profit", status: "not_eligible",
        reason: referralReason, basisAmountPaise: adminNetProfitPaise,
        createdAt: FieldValue.serverTimestamp(), createdByAdminUid: adminUid,
      });
      return { alreadyReconciled: false, adminNetProfitPaise, verifiedCostsPaise: verifiedCosts, platformNetBeforeCostsPaise: platformNetBeforeCosts, commissionPaise, referralReason };
    });
    return NextResponse.json({ success: true, ...result }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN";
    const status = code === "UNAUTHORIZED" ? 401 : code === "FORBIDDEN" ? 403 : code === "ORDER_NOT_FOUND" ? 404 : code === "ORDER_NOT_VERIFIED_PAID_VIDEO" ? 409 : 422;
    console.error("Teacher referral settlement reconciliation failed", code);
    return reply(status === 401 ? "Authentication required" : status === 403 ? "Admin access required" : status === 404 ? "Order not found" : "Settlement could not be reconciled; manual review required", status);
  }
}
