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


function toPaise(value: unknown): number | null {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  const paise = Math.round(amount * 100);
  if (!Number.isSafeInteger(paise) || Math.abs(amount * 100 - paise) > 1e-7) return null;
  return paise;
}

function committedProviderRefunds(items: Record<string, unknown>[], excludedRefundId: string): number | null {
  let totalPaise = 0;
  for (const item of items) {
    if (item.refund_id === excludedRefundId) continue;
    const status = String(item.refund_status || "").toUpperCase();
    if (["CANCELLED", "REJECTED"].includes(status)) continue;
    // Unknown statuses and malformed amounts are not assumed to be harmless.
    const amountPaise = toPaise(item.refund_amount);
    if (!amountPaise) return null;
    totalPaise += amountPaise;
    if (!Number.isSafeInteger(totalPaise)) return null;
  }
  return totalPaise;
}

function normalizeRefundStatus(providerStatus: string): { requestStatus: string; executionStatus: string } {
  const status = providerStatus.trim().toUpperCase();
  if (status === "SUCCESS") return { requestStatus: "refunded", executionStatus: "success" };
  if (["PENDING", "PENDING_APPROVAL", "ONHOLD"].includes(status)) return { requestStatus: "refund_submitted", executionStatus: "submitted" };
  if (["CANCELLED", "REJECTED"].includes(status)) return { requestStatus: "refund_failed", executionStatus: "failed" };
  // Unknown provider states are never treated as a successful submission or
  // a terminal failure. Keep the reservation and require manual review.
  return { requestStatus: "refund_manual_review_required", executionStatus: "unknown" };
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
    if (!requestId || requestId.length > 700 || requestId.includes("/") || (action !== "process" && action !== "refresh" && action !== "reconcile")) {
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
    // A refund request must belong to the same customer as its linked order.
    // Legacy records without a trustworthy owner link fail closed for manual review.
    if (typeof refund.userId !== "string" || !refund.userId || typeof order.userId !== "string" || !order.userId || refund.userId !== order.userId) {
      return fail("Refund request customer does not match the linked order; manual review is required", 409);
    }
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

    if (action === "reconcile") {
      const providerItems = await cashfreeRequest<Record<string, unknown>[]>(config, `/orders/${encodeURIComponent(order.cashfreeOrderId)}/refunds`);
      if (!Array.isArray(providerItems)) {
        return NextResponse.json({
          success: true, reconciliation: {
            status: "manual_review_required", manualReviewRequired: true,
            reason: "provider_ledger_unavailable_or_malformed",
            orderId, requestId, paidAmountPaise,
            localRefundAmountPaise: amountPaise,
            providerRefundCount: null, providerCommittedAmountPaise: null,
            matches: [], unmatchedProviderRefundIds: [], unmatchedLocalRequestIds: [],
          },
        }, { headers: { "Cache-Control": "no-store" } });
      }

      // Cashfree's per-order endpoint returns the order's refund list as an
      // array; the reviewed SDK contract does not expose page/offset inputs.
      // Bound our local query so unusually large histories fail closed instead
      // of silently truncating an unbounded collection read.
      const localSnap = await db.collection("refund_requests")
        .where("orderId", "==", orderId)
        .limit(501)
        .get();
      const localHistoryTruncated = localSnap.size > 500;
      const localRows = localSnap.docs.slice(0, 500).map((doc) => {
        const data = doc.data();
        const localId = typeof data.refundId === "string" ? data.refundId : `JKR${createHash("sha256").update(doc.id).digest("hex").slice(0, 30)}`;
        const localStatus = String(data.refundExecutionStatus || "").toLowerCase();
        const expected = ["processing", "retry_required", "submitted", "success", "failed", "unknown"].includes(localStatus);
        return { requestId: doc.id, refundId: localId, amountPaise: toPaise(data.amount), executionStatus: localStatus, expectedOnProvider: expected };
      });
      const providerById = new Map<string, Record<string, unknown>>();
      let malformedProviderRows = 0;
      let unknownProviderStatuses = 0;
      for (const item of providerItems) {
        const id = typeof item.refund_id === "string" ? item.refund_id : "";
        const status = String(item.refund_status || "").toUpperCase();
        if (!id || !toPaise(item.refund_amount) || !status) malformedProviderRows++;
        if (id) {
          if (providerById.has(id)) malformedProviderRows++;
          providerById.set(id, item);
        }
        if (!["SUCCESS", "PENDING", "PENDING_APPROVAL", "ONHOLD", "CANCELLED", "REJECTED"].includes(status)) unknownProviderStatuses++;
      }
      let providerCommittedPaise = 0;
      let providerTotalPaise = 0;
      for (const item of providerItems) {
        const value = toPaise(item.refund_amount);
        if (value !== null) {
          providerTotalPaise += value;
          if (!["CANCELLED", "REJECTED"].includes(String(item.refund_status || "").toUpperCase())) providerCommittedPaise += value;
        }
      }
      const matches = localRows.map((local) => {
        const provider = providerById.get(local.refundId);
        if (!provider) return { ...local, providerStatus: null, providerAmountPaise: null, match: local.expectedOnProvider ? "missing_from_provider" : "not_submitted" };
        const providerAmountPaise = toPaise(provider.refund_amount);
        const providerStatus = String(provider.refund_status || "").toUpperCase();
        const amountMatches = local.amountPaise !== null && local.amountPaise === providerAmountPaise;
        const statusMatches = local.executionStatus === "success" ? providerStatus === "SUCCESS"
          : local.executionStatus === "failed" ? ["CANCELLED", "REJECTED"].includes(providerStatus)
          : true;
        return {
          ...local, providerStatus, providerAmountPaise,
          match: !amountMatches ? "amount_mismatch" : !statusMatches ? "status_mismatch" : "matched",
        };
      });
      const localExpectedIds = new Set(localRows.filter((row) => row.expectedOnProvider).map((row) => row.refundId));
      const unmatchedProviderRefundIds = [...providerById.keys()].filter((id) => !localExpectedIds.has(id));
      const unmatchedLocalRequestIds = matches.filter((row) => row.match === "missing_from_provider").map((row) => row.requestId);
      const mismatches = matches.filter((row) => row.match === "amount_mismatch" || row.match === "status_mismatch").length;
      const duplicateLocalRefundIds = [...new Set(localRows
        .map((row) => row.refundId)
        .filter((id, index, all) => all.indexOf(id) !== index))];
      const duplicateLocalRequestCount = Math.max(0, localRows.length - 1);
      const overRefunded = !Number.isSafeInteger(providerCommittedPaise) || providerCommittedPaise > paidAmountPaise;
      const manualReviewRequired = localHistoryTruncated || malformedProviderRows > 0 || unknownProviderStatuses > 0 || mismatches > 0 ||
        unmatchedProviderRefundIds.length > 0 || unmatchedLocalRequestIds.length > 0 || overRefunded ||
        duplicateLocalRequestCount > 0 || duplicateLocalRefundIds.length > 0 ||
        localRows.some((row) => row.amountPaise === null);
      return NextResponse.json({
        success: true,
        reconciliation: {
          status: manualReviewRequired ? "manual_review_required" : "matched",
          manualReviewRequired, orderId, requestId, paidAmountPaise,
          currentRequestRefundId: refundId, localRefundAmountPaise: amountPaise,
          localRequestCount: localHistoryTruncated ? null : localRows.length,
          localHistoryTruncated, localHistoryLimit: 500,
          providerRefundCount: providerItems.length,
          providerTotalAmountPaise: Number.isSafeInteger(providerTotalPaise) ? providerTotalPaise : null,
          providerCommittedAmountPaise: Number.isSafeInteger(providerCommittedPaise) ? providerCommittedPaise : null,
          remainingCommittedCapacityPaise: Number.isSafeInteger(providerCommittedPaise) ? Math.max(0, paidAmountPaise - providerCommittedPaise) : null,
          malformedProviderRows, unknownProviderStatuses, overRefunded,
          duplicateLocalRequestCount, duplicateLocalRefundIds,
          matches, unmatchedProviderRefundIds, unmatchedLocalRequestIds,
          readOnly: true,
        },
      }, { headers: { "Cache-Control": "no-store" } });
    }

    if (action === "process") {
      const existingRefunds = await cashfreeRequest<Record<string, unknown>[]>(config, `/orders/${encodeURIComponent(order.cashfreeOrderId)}/refunds`);
      if (!Array.isArray(existingRefunds)) return fail("Unable to reconcile existing Cashfree refunds", 502);
      existingProviderRefund = existingRefunds.find((item) => item.refund_id === refundId) || null;
      const previouslyCommittedPaise = committedProviderRefunds(existingRefunds, refundId);
      if (previouslyCommittedPaise === null) {
        return fail("Cashfree returned an incomplete refund ledger. Manual reconciliation is required before processing another refund.", 409);
      }
      if (previouslyCommittedPaise + amountPaise > paidAmountPaise) {
        return fail("This refund would exceed the remaining refundable amount for the order", 409);
      }
      if (existingProviderRefund) {
        const providerAmountPaise = toPaise(existingProviderRefund.refund_amount);
        if (!providerAmountPaise || providerAmountPaise !== amountPaise) {
          return fail("The existing Cashfree refund reference has a different or invalid amount. Manual reconciliation is required.", 409);
        }
      }
    }
    if (!/^[A-Za-z0-9]{3,40}$/.test(refundId)) return fail("Stored refund reference is invalid", 409);

    if (action === "process") {
      // Keep a durable audit event for the local reservation transition. The
      // audit write shares the same Firestore transaction as the lock.
      const reservationAuditRef = db.collection("refundRequestAuditLogs").doc();
      const reservation = await db.runTransaction(async (tx) => {
        const [currentRefundSnap, currentOrderSnap] = await Promise.all([tx.get(refundRef), tx.get(orderRef)]);
        if (!currentRefundSnap.exists || !currentOrderSnap.exists) return "missing" as const;
        const currentRefund = currentRefundSnap.data() || {};
        const currentOrder = currentOrderSnap.data() || {};
        const sameOrderRequestsQuery = db.collection("refund_requests").where("orderId", "==", orderId).limit(2);
        const sameOrderRequestsSnap = await tx.get(sameOrderRequestsQuery);
        const activeStatuses = new Set([
          "pending", "requested", "approved_pending_refund", "refund_processing",
          "refund_retry_required", "refund_submitted", "refund_manual_review_required",
        ]);
        const competingRequest = sameOrderRequestsSnap.docs.some((doc) => {
          if (doc.id === requestId) return false;
          const other = doc.data();
          return typeof other.status === "string" && activeStatuses.has(other.status.trim().toLowerCase());
        });
        if (competingRequest) return "duplicate_request" as const;
        if (typeof currentRefund.userId !== "string" || !currentRefund.userId || typeof currentOrder.userId !== "string" || !currentOrder.userId || currentRefund.userId !== currentOrder.userId) return "owner_mismatch" as const;
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
          // One active refund request per order is an intentional serialization
          // lock. It prevents concurrent partial-refund requests from racing
          // against the provider's refund list snapshot.
          refundRequestId: requestId,
          refundAmountReserved: amount,
          refundAmountReservedPaise: amountPaise,
          refundReservationStatus: "active",
          refundStatus: "processing",
          updatedAt: FieldValue.serverTimestamp(),
        });
        tx.create(reservationAuditRef, {
          refundRequestId: requestId,
          orderId,
          action: "cashfree_refund_reservation_acquired",
          adminId,
          refundId,
          amount,
          amountPaise,
          createdAt: FieldValue.serverTimestamp(),
        });
        return "reserved" as const;
      });

      if (reservation === "missing") return fail("Refund or order not found", 404);
      if (reservation === "not_approved") return fail("Approve the refund request before processing it", 409);
      if (reservation === "already_submitted") return fail("Refund has already been submitted; refresh its provider status instead", 409);
      if (reservation === "payment_not_verified") return fail("The original payment is not verified as successful", 409);
      if (reservation === "owner_mismatch") return fail("Refund request customer no longer matches the linked order; manual review is required", 409);
      if (reservation === "amount_changed") return fail("Refund or paid amount changed; review the request again", 409);
      if (reservation === "refund_reference_changed") return fail("Refund reference changed; refresh the request before retrying", 409);
      if (reservation === "another_refund_exists") return fail("Another refund request is already reserved for this order", 409);
      if (reservation === "duplicate_request") return fail("Another non-terminal refund request exists for this order. Review duplicate requests before processing.", 409);

      try {
        const providerResult = existingProviderRefund || await cashfreeRequest<Record<string, unknown> | Record<string, unknown>[]>(config, `/orders/${encodeURIComponent(order.cashfreeOrderId)}/refunds`, {
          method: "POST",
          idempotencyKey: deterministicUuid(`jembeekart-cashfree-refund:${requestId}`),
          body: {
            refund_amount: amountPaise / 100,
            refund_id: refundId,
            refund_note: "Jembee Shorts refund request",
            refund_speed: "STANDARD",
          },
        });
        const providerRefund = Array.isArray(providerResult) ? providerResult[0] : providerResult;
        const confirmedProviderAmountPaise = providerRefund ? toPaise(providerRefund.refund_amount) : null;
        if (!providerRefund || providerRefund.refund_id !== refundId || confirmedProviderAmountPaise !== amountPaise) {
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
        const submitAuditRef = db.collection("refundRequestAuditLogs").doc();
        const submitCommit = await db.runTransaction(async (tx) => {
          const [latestRefundSnap, latestOrderSnap] = await Promise.all([tx.get(refundRef), tx.get(orderRef)]);
          if (!latestRefundSnap.exists || !latestOrderSnap.exists) return "missing" as const;
          const latestRefund = latestRefundSnap.data() || {};
          const latestOrder = latestOrderSnap.data() || {};
          if (
            latestRefund.refundId !== refundId ||
            toPaise(latestRefund.amount) !== amountPaise ||
            latestRefund.orderId !== orderId ||
            typeof latestRefund.userId !== "string" || !latestRefund.userId ||
            typeof latestOrder.userId !== "string" || !latestOrder.userId ||
            latestRefund.userId !== latestOrder.userId ||
            latestOrder.refundRequestId !== requestId ||
            latestOrder.refundReservationStatus !== "active" ||
            toPaise(latestOrder.refundAmountReserved) !== amountPaise ||
            latestOrder.cashfreeOrderId !== order.cashfreeOrderId ||
            latestOrder.cashfreePaymentId !== order.cashfreePaymentId
          ) return "reservation_changed" as const;
          const latestExecution = String(latestRefund.refundExecutionStatus || "").toLowerCase();
          if (latestExecution === "success" || latestExecution === "submitted") return "already_finalized" as const;
          tx.update(refundRef, update);
          tx.update(orderRef, { refundStatus: normalized.requestStatus, refundExecutionStatus: normalized.executionStatus, updatedAt: FieldValue.serverTimestamp() });
          tx.set(submitAuditRef, { refundRequestId: requestId, orderId, action: normalized.executionStatus === "unknown" ? "cashfree_refund_manual_review_required" : "cashfree_refund_submitted", adminId, refundId, providerStatus, amount, createdAt: FieldValue.serverTimestamp() });
          return "committed" as const;
        });
        if (submitCommit !== "committed") {
          return fail(submitCommit === "missing" ? "Refund or order no longer exists" : "Refund reservation changed; reconcile provider status before continuing", submitCommit === "missing" ? 404 : 409);
        }
        return NextResponse.json({
          success: true,
          status: normalized.requestStatus,
          providerStatus,
          message: normalized.executionStatus === "unknown"
            ? "Cashfree returned an unrecognized refund status. The reservation remains active and manual review is required."
            : providerStatus === "SUCCESS"
              ? "Cashfree reports this refund as successful."
              : "Refund submitted to Cashfree. Final bank credit is subject to provider/bank processing; refresh status for updates.",
        }, { headers: { "Cache-Control": "no-store" } });
      } catch (error) {
        const failureAuditRef = db.collection("refundRequestAuditLogs").doc();
        await db.runTransaction(async (tx) => {
          const [latestRefundSnap, latestOrderSnap] = await Promise.all([tx.get(refundRef), tx.get(orderRef)]);
          if (!latestRefundSnap.exists || !latestOrderSnap.exists) return;
          const latestRefund = latestRefundSnap.data() || {};
          const latestOrder = latestOrderSnap.data() || {};
          if (latestRefund.refundId !== refundId || latestOrder.refundRequestId !== requestId || latestOrder.refundReservationStatus !== "active") return;
          const latestExecution = String(latestRefund.refundExecutionStatus || "").toLowerCase();
          if (latestExecution === "success" || latestExecution === "submitted") return;
          tx.update(refundRef, { status: "refund_retry_required", refundExecutionStatus: "retry_required", lastProcessingError: error instanceof Error ? error.message.slice(0, 120) : "provider_error", updatedAt: FieldValue.serverTimestamp() });
          tx.update(orderRef, { refundStatus: "retry_required", refundExecutionStatus: "retry_required", updatedAt: FieldValue.serverTimestamp() });
          tx.create(failureAuditRef, {
            refundRequestId: requestId,
            orderId,
            action: "cashfree_refund_submission_error",
            adminId,
            refundId,
            amount,
            amountPaise,
            errorCode: error instanceof Error && error.message === "CASHFREE_REFUND_RESPONSE_MISMATCH" ? "provider_response_mismatch" : "provider_submission_error",
            createdAt: FieldValue.serverTimestamp(),
          });
        }).catch(() => undefined);
        console.error("Cashfree refund initiation failed:", error instanceof Error ? error.message : "unknown");
        return fail("Cashfree could not confirm the refund request. It is safe to retry using the same idempotent refund reference.", 502);
      }
    }

    const currentStatus = String(refund.status || "").toLowerCase();
    const currentExecution = String(refund.refundExecutionStatus || "").toLowerCase();
    if (!refund.refundId || !["refund_submitted", "refunded", "refund_failed", "refund_manual_review_required"].includes(currentStatus) || !["submitted", "success", "failed", "unknown"].includes(currentExecution)) {
      return fail("There is no submitted provider refund to refresh", 409);
    }
    const providerResult = await cashfreeRequest<Record<string, unknown> | Record<string, unknown>[]>(config, `/orders/${encodeURIComponent(order.cashfreeOrderId)}/refunds/${encodeURIComponent(refundId)}`);
    const providerRefund = Array.isArray(providerResult) ? providerResult[0] : providerResult;
    const refreshedProviderAmountPaise = providerRefund ? toPaise(providerRefund.refund_amount) : null;
    if (!providerRefund || providerRefund.refund_id !== refundId || refreshedProviderAmountPaise !== amountPaise) {
      return fail("Cashfree refund details did not match the stored request", 409);
    }
    const providerStatus = String(providerRefund.refund_status || "UNKNOWN").toUpperCase();
    const normalized = normalizeRefundStatus(providerStatus);
    // Provider I/O happens before this transaction. Re-read both documents and
    // commit their status together so an older refresh cannot overwrite a newer
    // result or update an order whose active refund lock has changed.
    const auditRef = db.collection("refundRequestAuditLogs").doc();
    const refreshCommit = await db.runTransaction(async (tx) => {
      const [latestRefundSnap, latestOrderSnap] = await Promise.all([tx.get(refundRef), tx.get(orderRef)]);
      if (!latestRefundSnap.exists || !latestOrderSnap.exists) return "missing" as const;
      const latestRefund = latestRefundSnap.data() || {};
      const latestOrder = latestOrderSnap.data() || {};
      const latestAmountPaise = toPaise(latestRefund.amount);
      const latestPaidPaise = toPaise(latestOrder.finalAmount);
      if (
        latestRefund.refundId !== refundId || latestAmountPaise !== amountPaise ||
        latestPaidPaise !== paidAmountPaise || latestRefund.orderId !== orderId ||
        latestOrder.cashfreeOrderId !== order.cashfreeOrderId ||
        latestOrder.cashfreePaymentId !== order.cashfreePaymentId ||
        latestOrder.refundRequestId !== requestId
      ) return "reservation_changed" as const;

      const latestExecution = String(latestRefund.refundExecutionStatus || "").toLowerCase();
      const latestStatus = String(latestRefund.status || "").toLowerCase();
      // SUCCESS is authoritative and must never be downgraded by a stale
      // PENDING/UNKNOWN response. A provider SUCCESS may reconcile an older
      // local failure state; non-success responses cannot reopen a terminal
      // failure into a pending state.
      const keepCurrent = latestExecution === "success" ||
        (latestExecution === "failed" && normalized.executionStatus !== "success");
      const finalRequestStatus = keepCurrent ? latestStatus : normalized.requestStatus;
      const finalExecutionStatus = keepCurrent ? latestExecution : normalized.executionStatus;
      const finalProviderStatus = keepCurrent
        ? String(latestRefund.providerRefundStatus || providerStatus).toUpperCase()
        : providerStatus;
      const update = {
        status: finalRequestStatus,
        refundExecutionStatus: finalExecutionStatus,
        providerRefundStatus: finalProviderStatus,
        cashfreeRefundId: typeof providerRefund.cf_refund_id === "string" || typeof providerRefund.cf_refund_id === "number" ? String(providerRefund.cf_refund_id) : (latestRefund.cashfreeRefundId || null),
        refundArn: typeof providerRefund.refund_arn === "string" ? providerRefund.refund_arn : (latestRefund.refundArn || null),
        lastStatusCheckedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };
      tx.update(refundRef, update);
      const terminalProviderResult = finalExecutionStatus === "success" || finalExecutionStatus === "failed";
      const orderUpdate: Record<string, unknown> = {
        refundStatus: finalRequestStatus,
        refundExecutionStatus: finalExecutionStatus,
        updatedAt: FieldValue.serverTimestamp(),
      };
      // Release the per-order serialization lock only after Cashfree has
      // returned an explicit terminal SUCCESS/FAILED result. Pending/unknown
      // states retain the lock to prevent overlapping refunds.
      if (terminalProviderResult && latestOrder.refundRequestId === requestId && latestOrder.refundReservationStatus === "active") {
        orderUpdate.refundRequestId = FieldValue.delete();
        orderUpdate.refundAmountReserved = FieldValue.delete();
        orderUpdate.refundAmountReservedPaise = FieldValue.delete();
        orderUpdate.refundReservationStatus = "released";
        orderUpdate.refundReservationReleasedAt = FieldValue.serverTimestamp();
      }
      tx.update(orderRef, orderUpdate);
      tx.set(auditRef, {
        refundRequestId: requestId, orderId, action: "cashfree_refund_status_refreshed",
        adminId, refundId, providerStatus, committedStatus: finalRequestStatus,
        committedExecutionStatus: finalExecutionStatus,
        reservationReleased: finalExecutionStatus === "success" || finalExecutionStatus === "failed",
        createdAt: FieldValue.serverTimestamp(),
      });
      return { outcome: keepCurrent ? "kept_newer_state" as const : "updated" as const, status: finalRequestStatus };
    });
    if (refreshCommit === "missing") return fail("Refund or order no longer exists", 404);
    if (refreshCommit === "reservation_changed") return fail("Refund reservation or payment details changed during refresh; reconcile before retrying", 409);
    const keptNewerState = refreshCommit.outcome === "kept_newer_state";
    return NextResponse.json({ success: true, status: refreshCommit.status, providerStatus, message: keptNewerState ? "A newer terminal refund state was preserved; no status downgrade was applied." : (providerStatus === "SUCCESS" ? "Cashfree confirms the refund as successful." : `Cashfree refund status: ${providerStatus}.`) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    if (code === "UNAUTHORIZED") return fail("Authentication required", 401);
    if (code === "FORBIDDEN") return fail("Admin access required", 403);
    console.error("Refund processing API error:", code || "unknown");
    return fail("Unable to process or refresh the refund", 502);
  }
}
