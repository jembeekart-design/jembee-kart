import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { createHash } from "node:crypto";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";
import { cashfreeRequest, deterministicUuid, getCashfreeConfig } from "@/lib/payments/cashfree";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function verifyAdmin(req: Request): Promise<string> {
  const authorization = req.headers.get("authorization") || "";
  if (!authorization.startsWith("Bearer ")) throw new Error("UNAUTHORIZED");
  let decoded: { uid: string };
  try { decoded = await getAdminAuth().verifyIdToken(authorization.slice(7).trim(), true); }
  catch { throw new Error("UNAUTHORIZED"); }
  const db = getAdminDb();
  const direct = await db.collection("users").doc(decoded.uid).get();
  let role = direct.data()?.role;
  if (role !== "admin" && role !== "super_admin") {
    const fallback = await db.collection("users").where("uid", "==", decoded.uid).limit(1).get();
    role = fallback.docs[0]?.data()?.role;
  }
  if (role !== "admin" && role !== "super_admin") throw new Error("FORBIDDEN");
  return decoded.uid;
}

function fail(message: string, status: number) {
  return NextResponse.json({ success: false, message }, { status, headers: { "Cache-Control": "no-store" } });
}

function normalizeRefundStatus(providerStatus: string): { requestStatus: string; executionStatus: string } {
  const status = providerStatus.toUpperCase();
  if (status === "SUCCESS") return { requestStatus: "refunded", executionStatus: "success" };
  if (["PENDING", "PENDING_APPROVAL", "ONHOLD"].includes(status)) return { requestStatus: "refund_submitted", executionStatus: "submitted" };
  if (["CANCELLED", "REJECTED"].includes(status)) return { requestStatus: "refund_failed", executionStatus: "failed" };
  return { requestStatus: "refund_submitted", executionStatus: "submitted" };
}

export async function POST(req: NextRequest) {
  try {
    const adminId = await verifyAdmin(req);
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

    const requestId = typeof body.requestId === "string" ? body.requestId.trim() : "";
    const action = body.action;
    if (!requestId || requestId.length > 700 || requestId.includes("/") || (action !== "process" && action !== "refresh")) {
      return fail("Invalid refund processing request", 400);
    }

    const db = getAdminDb();
    const refundRef = db.collection("refund_requests").doc(requestId);
    const refundSnap = await refundRef.get();
    if (!refundSnap.exists) return fail("Refund request not found", 404);
    const refund = refundSnap.data() || {};
    const orderId = typeof refund.orderId === "string" ? refund.orderId : "";
    if (!orderId || orderId.length > 200 || !/^[A-Za-z0-9_-]+$/.test(orderId)) return fail("This refund request has no valid linked order", 409);
    const orderRef = db.collection("orders").doc(orderId);
    const orderSnap = await orderRef.get();
    if (!orderSnap.exists) return fail("Linked order not found", 404);
    const order = orderSnap.data() || {};
    if (order.paymentMethod !== "cashfree" || order.paymentStatus !== "paid" || typeof order.cashfreeOrderId !== "string" || typeof order.cashfreePaymentId !== "string") {
      return fail("Only verified Cashfree-paid orders can be refunded automatically. COD/manual refunds require a separate verified payout process.", 409);
    }
    const amount = Number(refund.amount);
    const paidAmount = Number(order.finalAmount);
    const amountPaise = Math.round(amount * 100);
    const paidAmountPaise = Math.round(paidAmount * 100);
    // INR provider amounts are paise-precision values. Reject fractional-paise
    // records instead of silently rounding a different amount to Cashfree.
    if (
      !Number.isFinite(amount) || amount <= 0 || !Number.isSafeInteger(amountPaise) ||
      Math.abs(amount * 100 - amountPaise) > 1e-7 ||
      !Number.isFinite(paidAmount) || paidAmount <= 0 || !Number.isSafeInteger(paidAmountPaise) ||
      Math.abs(paidAmount * 100 - paidAmountPaise) > 1e-7 || amountPaise > paidAmountPaise
    ) return fail("Refund amount or verified paid amount is invalid; amounts must use paise precision", 409);

    const config = await getCashfreeConfig({ requireEnabled: false });
    const refundId = typeof refund.refundId === "string" ? refund.refundId : `JKR${createHash("sha256").update(requestId).digest("hex").slice(0, 30)}`;
    let existingProviderRefund: Record<string, unknown> | null = null;
    if (action === "process") {
      const existingRefunds = await cashfreeRequest<Record<string, unknown>[]>(config, `/orders/${encodeURIComponent(order.cashfreeOrderId)}/refunds`);
      if (!Array.isArray(existingRefunds)) return fail("Unable to reconcile existing Cashfree refunds", 502);
      existingProviderRefund = existingRefunds.find((item) => item.refund_id === refundId) || null;
      const previouslyCommitted = existingRefunds.reduce((sum, item) => {
        if (item.refund_id === refundId) return sum;
        const status = String(item.refund_status || "").toUpperCase();
        if (["CANCELLED", "REJECTED"].includes(status)) return sum;
        const existingAmount = Number(item.refund_amount);
        return sum + (Number.isFinite(existingAmount) && existingAmount > 0 ? existingAmount : 0);
      }, 0);
      if (Math.round(previouslyCommitted * 100) + amountPaise > paidAmountPaise) {
        return fail("This refund would exceed the remaining refundable amount for the order", 409);
      }
    }
    if (!/^[A-Za-z0-9]{3,40}$/.test(refundId)) return fail("Stored refund reference is invalid", 409);

    if (action === "process") {
      const reservation = await db.runTransaction(async (tx) => {
        const [currentRefundSnap, currentOrderSnap] = await Promise.all([tx.get(refundRef), tx.get(orderRef)]);
        if (!currentRefundSnap.exists || !currentOrderSnap.exists) return "missing" as const;
        const currentRefund = currentRefundSnap.data() || {};
        const currentOrder = currentOrderSnap.data() || {};
        const status = String(currentRefund.status || "").toLowerCase();
        const execution = String(currentRefund.refundExecutionStatus || "").toLowerCase();
        if (!["approved_pending_refund", "refund_retry_required", "refund_processing"].includes(status)) return "not_approved" as const;
        if (execution === "submitted" || execution === "success") return "already_submitted" as const;
        // Revalidate all money/provider identifiers inside the reservation
        // transaction: the initial snapshots were read before the provider call.
        const currentAmount = Number(currentRefund.amount);
        const currentAmountPaise = Math.round(currentAmount * 100);
        const currentPaid = Number(currentOrder.finalAmount);
        const currentPaidPaise = Math.round(currentPaid * 100);
        if (
          !Number.isFinite(currentAmount) || !Number.isSafeInteger(currentAmountPaise) ||
          Math.abs(currentAmount * 100 - currentAmountPaise) > 1e-7 || currentAmountPaise !== amountPaise ||
          !Number.isFinite(currentPaid) || !Number.isSafeInteger(currentPaidPaise) ||
          Math.abs(currentPaid * 100 - currentPaidPaise) > 1e-7 || currentPaidPaise !== paidAmountPaise
        ) return "amount_changed" as const;
        if (currentOrder.paymentMethod !== "cashfree" || currentOrder.paymentStatus !== "paid" || currentOrder.cashfreeOrderId !== order.cashfreeOrderId || currentOrder.cashfreePaymentId !== order.cashfreePaymentId) return "payment_not_verified" as const;
        if (currentRefund.refundId && currentRefund.refundId !== refundId) return "refund_reference_changed" as const;
        if (currentOrder.refundRequestId && currentOrder.refundRequestId !== requestId) return "another_refund_exists" as const;
        tx.update(refundRef, {
          status: "refund_processing",
          refundExecutionStatus: "processing",
          refundId,
          processingBy: adminId,
          processingAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
        tx.update(orderRef, {
          refundRequestId: requestId,
          refundAmountReserved: amount,
          refundStatus: "processing",
          updatedAt: FieldValue.serverTimestamp(),
        });
        return "reserved" as const;
      });

      if (reservation === "missing") return fail("Refund or order not found", 404);
      if (reservation === "not_approved") return fail("Approve the refund request before processing it", 409);
      if (reservation === "already_submitted") return fail("Refund has already been submitted; refresh its provider status instead", 409);
      if (reservation === "payment_not_verified") return fail("The original payment is not verified as successful", 409);
      if (reservation === "amount_changed") return fail("Refund or paid amount changed; review the request again", 409);
      if (reservation === "refund_reference_changed") return fail("Refund reference changed; refresh the request before retrying", 409);
      if (reservation === "another_refund_exists") return fail("Another refund request is already reserved for this order", 409);

      try {
        const providerResult = existingProviderRefund || await cashfreeRequest<Record<string, unknown> | Record<string, unknown>[]>(config, `/orders/${encodeURIComponent(order.cashfreeOrderId)}/refunds`, {
          method: "POST",
          idempotencyKey: deterministicUuid(`jembeekart-cashfree-refund:${requestId}`),
          body: {
            refund_amount: amountPaise / 100,
            refund_id: refundId,
            refund_note: "JembeeKart refund request",
            refund_speed: "STANDARD",
          },
        });
        const providerRefund = Array.isArray(providerResult) ? providerResult[0] : providerResult;
        if (!providerRefund || providerRefund.refund_id !== refundId || Math.round(Number(providerRefund.refund_amount) * 100) !== Math.round(amount * 100)) {
          throw new Error("CASHFREE_REFUND_RESPONSE_MISMATCH");
        }
        const providerStatus = String(providerRefund.refund_status || "PENDING").toUpperCase();
        const normalized = normalizeRefundStatus(providerStatus);
        const update = {
          status: normalized.requestStatus,
          refundExecutionStatus: normalized.executionStatus,
          providerRefundStatus: providerStatus,
          cashfreeRefundId: typeof providerRefund?.cf_refund_id === "string" || typeof providerRefund?.cf_refund_id === "number" ? String(providerRefund.cf_refund_id) : null,
          refundArn: typeof providerRefund?.refund_arn === "string" ? providerRefund.refund_arn : null,
          refundSubmittedAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        };
        await Promise.all([
          refundRef.update(update),
          orderRef.update({ refundStatus: normalized.requestStatus, refundExecutionStatus: normalized.executionStatus, updatedAt: FieldValue.serverTimestamp() }),
          db.collection("refundRequestAuditLogs").add({ refundRequestId: requestId, orderId, action: "cashfree_refund_submitted", adminId, refundId, providerStatus, amount, createdAt: FieldValue.serverTimestamp() }),
        ]);
        return NextResponse.json({ success: true, status: normalized.requestStatus, providerStatus, message: providerStatus === "SUCCESS" ? "Cashfree reports this refund as successful." : "Refund submitted to Cashfree. Final bank credit is subject to provider/bank processing; refresh status for updates." }, { headers: { "Cache-Control": "no-store" } });
      } catch (error) {
        await Promise.all([
          refundRef.update({ status: "refund_retry_required", refundExecutionStatus: "retry_required", lastProcessingError: error instanceof Error ? error.message.slice(0, 120) : "provider_error", updatedAt: FieldValue.serverTimestamp() }),
          orderRef.update({ refundStatus: "retry_required", updatedAt: FieldValue.serverTimestamp() }),
        ]).catch(() => undefined);
        console.error("Cashfree refund initiation failed:", error instanceof Error ? error.message : "unknown");
        return fail("Cashfree could not confirm the refund request. It is safe to retry using the same idempotent refund reference.", 502);
      }
    }

    const currentStatus = String(refund.status || "").toLowerCase();
    const currentExecution = String(refund.refundExecutionStatus || "").toLowerCase();
    if (!refund.refundId || !["refund_submitted", "refunded", "refund_failed"].includes(currentStatus) || !["submitted", "success", "failed"].includes(currentExecution)) {
      return fail("There is no submitted provider refund to refresh", 409);
    }
    const providerResult = await cashfreeRequest<Record<string, unknown> | Record<string, unknown>[]>(config, `/orders/${encodeURIComponent(order.cashfreeOrderId)}/refunds/${encodeURIComponent(refundId)}`);
    const providerRefund = Array.isArray(providerResult) ? providerResult[0] : providerResult;
    if (!providerRefund || providerRefund.refund_id !== refundId || Math.round(Number(providerRefund.refund_amount) * 100) !== Math.round(amount * 100)) {
      return fail("Cashfree refund details did not match the stored request", 409);
    }
    const providerStatus = String(providerRefund.refund_status || "UNKNOWN").toUpperCase();
    const normalized = normalizeRefundStatus(providerStatus);
    await Promise.all([
      refundRef.update({
        status: normalized.requestStatus,
        refundExecutionStatus: normalized.executionStatus,
        providerRefundStatus: providerStatus,
        cashfreeRefundId: typeof providerRefund?.cf_refund_id === "string" || typeof providerRefund?.cf_refund_id === "number" ? String(providerRefund.cf_refund_id) : null,
        refundArn: typeof providerRefund?.refund_arn === "string" ? providerRefund.refund_arn : null,
        lastStatusCheckedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      }),
      orderRef.update({ refundStatus: normalized.requestStatus, refundExecutionStatus: normalized.executionStatus, updatedAt: FieldValue.serverTimestamp() }),
      db.collection("refundRequestAuditLogs").add({ refundRequestId: requestId, orderId, action: "cashfree_refund_status_refreshed", adminId, refundId, providerStatus, createdAt: FieldValue.serverTimestamp() }),
    ]);
    return NextResponse.json({ success: true, status: normalized.requestStatus, providerStatus, message: providerStatus === "SUCCESS" ? "Cashfree confirms the refund as successful." : `Cashfree refund status: ${providerStatus}.` }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    if (code === "UNAUTHORIZED") return fail("Authentication required", 401);
    if (code === "FORBIDDEN") return fail("Admin access required", 403);
    console.error("Refund processing API error:", code || "unknown");
    return fail("Unable to process or refresh the refund", 502);
  }
}
