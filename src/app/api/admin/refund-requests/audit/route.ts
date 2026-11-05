import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";

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

const KNOWN_AUDIT_ACTIONS = new Set([
  "approve", "reject",
  "cashfree_refund_reservation_acquired",
  "cashfree_refund_submitted",
  "cashfree_refund_manual_review_required",
  "cashfree_refund_submission_error",
  "cashfree_refund_status_refreshed",
]);

function toIso(value: unknown): string | null {
  if (!value || typeof value !== "object" || !("toDate" in value) || typeof (value as { toDate?: unknown }).toDate !== "function") return null;
  try {
    const date = (value as { toDate: () => Date }).toDate();
    return date instanceof Date && Number.isFinite(date.getTime()) ? date.toISOString() : null;
  } catch {
    return null;
  }
}

function validIdentifier(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= 700 && !value.includes("/");
}

function validateAuditRecord(data: FirebaseFirestore.DocumentData, requestId: string) {
  const issues: string[] = [];
  if (data.refundRequestId !== requestId) issues.push("request_id_mismatch");
  if (typeof data.action !== "string" || !KNOWN_AUDIT_ACTIONS.has(data.action)) issues.push("unknown_action");
  if (!validIdentifier(data.adminId)) issues.push("invalid_admin_id");
  if (data.orderId !== undefined && data.orderId !== null && !validIdentifier(data.orderId)) issues.push("invalid_order_id");
  if (data.refundId !== undefined && data.refundId !== null && (typeof data.refundId !== "string" || data.refundId.length > 100)) issues.push("invalid_refund_id");
  if (data.amount !== undefined && data.amount !== null) {
    const amountPaise = Math.round(Number(data.amount) * 100);
    if (typeof data.amount !== "number" || !Number.isFinite(data.amount) || data.amount <= 0 ||
        !Number.isSafeInteger(amountPaise) || Math.abs(data.amount * 100 - amountPaise) > 1e-7) {
      issues.push("invalid_amount");
    }
    if (data.amountPaise !== undefined && data.amountPaise !== null && data.amountPaise !== amountPaise) {
      issues.push("amount_paise_mismatch");
    }
  }
  if (data.amountPaise !== undefined && data.amountPaise !== null && (!Number.isSafeInteger(data.amountPaise) || data.amountPaise <= 0)) {
    issues.push("invalid_amount_paise");
  }
  if (!toIso(data.createdAt)) issues.push("invalid_created_at");
  if (data.reservationReleased !== undefined && data.reservationReleased !== null && typeof data.reservationReleased !== "boolean") {
    issues.push("invalid_reservation_flag");
  }
  return issues;
}

export async function GET(req: NextRequest) {
  try {
    await verifyAdmin(req);
    const requestId = req.nextUrl.searchParams.get("requestId")?.trim() || "";
    const cursor = req.nextUrl.searchParams.get("cursor")?.trim() || "";
    if (!requestId || requestId.length > 700 || requestId.includes("/") || cursor.length > 1500 || cursor.includes("/")) {
      return NextResponse.json({ success: false, message: "A valid refund request ID or page cursor is required" }, { status: 400, headers: { "Cache-Control": "no-store" } });
    }
    const db = getAdminDb();
    let cursorSnapshot: FirebaseFirestore.QueryDocumentSnapshot | null = null;
    if (cursor) {
      const cursorDoc = await db.collection("refundRequestAuditLogs").doc(cursor).get();
      if (!cursorDoc.exists || cursorDoc.data()?.refundRequestId !== requestId) {
        return NextResponse.json({ success: false, message: "Audit history cursor is invalid for this refund request" }, { status: 400, headers: { "Cache-Control": "no-store" } });
      }
      cursorSnapshot = cursorDoc as FirebaseFirestore.QueryDocumentSnapshot;
    }
    let query = db.collection("refundRequestAuditLogs")
      .where("refundRequestId", "==", requestId)
      .orderBy("createdAt", "desc");
    if (cursorSnapshot) query = query.startAfter(cursorSnapshot);
    const snap = await query.limit(51).get();
    const refundSnapshot = await db.collection("refund_requests").doc(requestId).get();
    const refundData = refundSnapshot.exists ? refundSnapshot.data() || {} : null;
    const linkedOrderId = refundData && typeof refundData.orderId === "string" ? refundData.orderId : "";
    const linkedOrderSnapshot = linkedOrderId && linkedOrderId.length <= 200 && /^[A-Za-z0-9_-]+$/.test(linkedOrderId)
      ? await db.collection("orders").doc(linkedOrderId).get()
      : null;
    const linkedOrderData = linkedOrderSnapshot?.exists ? linkedOrderSnapshot.data() || {} : null;
    const currentRecordIssues: string[] = [];
    if (!refundData) currentRecordIssues.push("refund_request_missing");
    if (refundData && (!linkedOrderId || linkedOrderId.length > 200 || !/^[A-Za-z0-9_-]+$/.test(linkedOrderId))) {
      currentRecordIssues.push("invalid_linked_order_id");
    } else if (linkedOrderId && !linkedOrderData) {
      currentRecordIssues.push("linked_order_missing");
    }
    if (refundData && linkedOrderData) {
      if (typeof refundData.userId !== "string" || !refundData.userId ||
          typeof linkedOrderData.userId !== "string" || !linkedOrderData.userId ||
          refundData.userId !== linkedOrderData.userId) {
        currentRecordIssues.push("customer_ownership_mismatch");
      }
      const refundAmount = Number(refundData.amount);
      const paidAmount = Number(linkedOrderData.finalAmount);
      const refundPaise = Math.round(refundAmount * 100);
      const paidPaise = Math.round(paidAmount * 100);
      if (!Number.isFinite(refundAmount) || refundAmount <= 0 || !Number.isSafeInteger(refundPaise) ||
          Math.abs(refundAmount * 100 - refundPaise) > 1e-7 ||
          !Number.isFinite(paidAmount) || paidAmount <= 0 || !Number.isSafeInteger(paidPaise) ||
          Math.abs(paidAmount * 100 - paidPaise) > 1e-7 || refundPaise > paidPaise) {
        currentRecordIssues.push("refund_amount_exceeds_or_invalid_vs_paid_amount");
      }
      if (linkedOrderData.paymentMethod !== "cashfree" || linkedOrderData.paymentStatus !== "paid") {
        currentRecordIssues.push("order_not_verified_cashfree_paid");
      }
      if (linkedOrderData.refundReservationStatus === "active") {
        if (linkedOrderData.refundRequestId !== requestId) {
          currentRecordIssues.push("active_order_reservation_points_elsewhere");
        }
        const reservedPaise = Number.isSafeInteger(linkedOrderData.refundAmountReservedPaise)
          ? linkedOrderData.refundAmountReservedPaise
          : Math.round(Number(linkedOrderData.refundAmountReserved) * 100);
        if (!Number.isSafeInteger(reservedPaise) || reservedPaise <= 0 || reservedPaise !== refundPaise) {
          currentRecordIssues.push("active_reservation_amount_mismatch");
        }
      }
      const executionStatus = typeof refundData.refundExecutionStatus === "string"
        ? refundData.refundExecutionStatus.trim().toLowerCase()
        : "";
      const requestStatus = typeof refundData.status === "string"
        ? refundData.status.trim().toLowerCase()
        : "";
      const terminalExecution = executionStatus === "success" || executionStatus === "failed";
      const terminalRequest = requestStatus === "refunded" || requestStatus === "refund_failed" ||
        requestStatus === "rejected" || requestStatus === "cancelled";
      const expectsActiveReservation = executionStatus === "processing" || executionStatus === "submitted" ||
        executionStatus === "unknown" || executionStatus === "retry_required" ||
        requestStatus === "refund_processing" || requestStatus === "refund_retry_required" ||
        requestStatus === "refund_submitted" || requestStatus === "refund_manual_review_required";
      const hasActiveReservation = linkedOrderData.refundReservationStatus === "active";
      if (expectsActiveReservation && !hasActiveReservation) {
        currentRecordIssues.push("nonterminal_refund_without_active_reservation");
      }
      if (hasActiveReservation && terminalExecution) {
        currentRecordIssues.push("terminal_refund_has_active_reservation");
      }
      if (hasActiveReservation && terminalRequest && !terminalExecution) {
        currentRecordIssues.push("terminal_request_has_active_reservation");
      }
      if (typeof refundData.refundId === "string" && refundData.refundId.length > 100) {
        currentRecordIssues.push("invalid_stored_refund_id");
      }
    }
    const hasMore = snap.docs.length > 50;
    const pageDocs = snap.docs.slice(0, 50);
    const events = pageDocs.map((doc) => {
      const data = doc.data();
      const qualityIssues = validateAuditRecord(data, requestId);
      return {
        id: doc.id,
        action: typeof data.action === "string" && KNOWN_AUDIT_ACTIONS.has(data.action) ? data.action : "unknown_action",
        adminId: validIdentifier(data.adminId) ? data.adminId : null,
        orderId: validIdentifier(data.orderId) ? data.orderId : null,
        refundId: typeof data.refundId === "string" && data.refundId.length <= 100 ? data.refundId : null,
        providerStatus: typeof data.providerStatus === "string" ? data.providerStatus.slice(0, 60) : null,
        committedStatus: typeof data.committedStatus === "string" ? data.committedStatus.slice(0, 60) : null,
        committedExecutionStatus: typeof data.committedExecutionStatus === "string" ? data.committedExecutionStatus.slice(0, 60) : null,
        errorCode: typeof data.errorCode === "string" ? data.errorCode.slice(0, 80) : null,
        amount: typeof data.amount === "number" && Number.isFinite(data.amount) && data.amount > 0 ? data.amount : null,
        amountPaise: typeof data.amountPaise === "number" && Number.isSafeInteger(data.amountPaise) && data.amountPaise > 0 ? data.amountPaise : null,
        reservationReleased: typeof data.reservationReleased === "boolean" ? data.reservationReleased : null,
        createdAt: toIso(data.createdAt),
        qualityIssues,
        dataQuality: qualityIssues.length ? "review_required" : "valid",
      };
    });
    return NextResponse.json({
      success: true,
      currentRecordCheck: {
        status: currentRecordIssues.length ? "review_required" : "consistent",
        issues: currentRecordIssues,
        linkedOrderId: linkedOrderId || null,
        refundStatus: refundData && typeof refundData.status === "string" ? refundData.status.slice(0, 80) : null,
        refundExecutionStatus: refundData && typeof refundData.refundExecutionStatus === "string" ? refundData.refundExecutionStatus.slice(0, 80) : null,
        orderPaymentMethod: linkedOrderData && typeof linkedOrderData.paymentMethod === "string" ? linkedOrderData.paymentMethod.slice(0, 40) : null,
        orderPaymentStatus: linkedOrderData && typeof linkedOrderData.paymentStatus === "string" ? linkedOrderData.paymentStatus.slice(0, 40) : null,
        reservationStatus: linkedOrderData && typeof linkedOrderData.refundReservationStatus === "string" ? linkedOrderData.refundReservationStatus.slice(0, 40) : null,
        reservedAmountPaise: linkedOrderData && Number.isSafeInteger(linkedOrderData.refundAmountReservedPaise)
          ? linkedOrderData.refundAmountReservedPaise
          : null,
      },
      events,
      limit: 50,
      hasMore,
      nextCursor: hasMore && pageDocs.length ? pageDocs[pageDocs.length - 1].id : null,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    const status = code === "UNAUTHORIZED" ? 401 : code === "FORBIDDEN" ? 403 : 500;
    if (status === 500) console.error("Refund audit history API error:", code || "unknown");
    return NextResponse.json({ success: false, message: status === 401 ? "Authentication required" : status === 403 ? "Admin access required" : "Could not load refund audit history" }, { status, headers: { "Cache-Control": "no-store" } });
  }
}
