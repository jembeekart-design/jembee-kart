import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";

export const runtime = "nodejs";

const ALLOWED_STATUSES = new Set(["processing", "shipped", "delivered", "cancelled"]);
const TRANSITIONS: Record<string, string[]> = {
  placed: ["processing", "cancelled"],
  pending: ["processing", "cancelled"], // legacy order status
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

function response(message: string, status: number) {
  return NextResponse.json({ success: false, message }, { status });
}

async function requireAdmin(req: NextRequest): Promise<string> {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) throw new Error("UNAUTHORIZED");
  const token = header.slice(7).trim();
  if (!token) throw new Error("UNAUTHORIZED");
  const decoded = await getAdminAuth().verifyIdToken(token, true);
  const db = getAdminDb();
  const userSnap = await db.collection("users").doc(decoded.uid).get();
  let userData = userSnap.exists ? userSnap.data() : undefined;
  if (userData?.role !== "admin" && userData?.role !== "super_admin") {
    const fallback = await db.collection("users").where("uid", "==", decoded.uid).limit(1).get();
    userData = fallback.docs[0]?.data();
  }
  if (userData?.role !== "admin" && userData?.role !== "super_admin") throw new Error("FORBIDDEN");
  return decoded.uid;
}

export async function POST(req: NextRequest) {
  try {
    const adminUid = await requireAdmin(req);
    const contentLength = Number(req.headers.get("content-length") || 0);
    if (Number.isFinite(contentLength) && contentLength > 4096) return response("Request body too large", 413);
    const raw = await req.text();
    if (Buffer.byteLength(raw, "utf8") > 4096) return response("Request body too large", 413);

    let body: unknown;
    try { body = JSON.parse(raw); } catch { return response("Invalid JSON request", 400); }
    if (!body || typeof body !== "object" || Array.isArray(body)) return response("Invalid request body", 400);

    const payload = body as Record<string, unknown>;
    const orderId = typeof payload.orderId === "string" ? payload.orderId.trim() : "";
    const nextStatus = typeof payload.status === "string" ? payload.status.trim().toLowerCase() : "";
    if (!orderId || orderId.length > 200 || !/^[A-Za-z0-9_-]+$/.test(orderId)) return response("Invalid order ID", 400);
    if (!ALLOWED_STATUSES.has(nextStatus)) return response("Invalid order status", 400);

    const db = getAdminDb();
    const orderRef = db.collection("orders").doc(orderId);
    const eventRef = db.collection("orderStatusEvents").doc();
    const result = await db.runTransaction(async (tx) => {
      const orderSnap = await tx.get(orderRef);
      if (!orderSnap.exists) throw new Error("ORDER_NOT_FOUND");
      const order = orderSnap.data()!;
      const currentStatus = typeof order.status === "string" ? order.status : "placed";
      if (currentStatus === nextStatus) return { unchanged: true, currentStatus };
      if (!(TRANSITIONS[currentStatus] || []).includes(nextStatus)) throw new Error("INVALID_TRANSITION");
      if (nextStatus === "delivered" && order.commissionProcessed === true) throw new Error("ALREADY_SETTLED");

      // A paid Cashfree order must not be cancelled through the generic status
      // endpoint. Require a provider-confirmed full refund first; otherwise the
      // admin could restore stock while the customer still keeps the payment.
      if (nextStatus === "cancelled" && order.paymentMethod === "cashfree") {
        if (order.paymentStatus === "pending") throw new Error("PAYMENT_RECONCILIATION_REQUIRED");
        if (order.paymentStatus === "paid") {
          const paidAmount = Number(order.finalAmount);
          const refundedAmount = Number(order.refundAmountReserved);
          const fullyRefunded =
            order.refundStatus === "refunded" &&
            order.refundExecutionStatus === "success" &&
            Number.isFinite(paidAmount) && paidAmount > 0 &&
            Number.isFinite(refundedAmount) &&
            Math.round(refundedAmount * 100) >= Math.round(paidAmount * 100);
          if (!fullyRefunded) throw new Error("REFUND_REQUIRED");
        }
      }

      // A cancellation must restore inventory atomically with the status change.
      // New orders carry explicit stock markers. Legacy orders without markers
      // are cancelled with a manual inventory-review flag instead of guessing.
      let inventoryRestockStatus: "restocked" | "manual_review" | undefined;
      let productRef: FirebaseFirestore.DocumentReference | undefined;
      let restoredStock: number | undefined;
      if (nextStatus === "cancelled") {
        if (order.stockDeducted === true && order.stockRestocked !== true) {
          const productId = typeof order.productId === "string" ? order.productId : "";
          const quantity = Number(order.quantity);
          if (!productId || !Number.isSafeInteger(quantity) || quantity < 1 || quantity > 20) {
            throw new Error("CANCEL_INVENTORY_INVALID");
          }
          productRef = db.collection("products").doc(productId);
          const productSnap = await tx.get(productRef);
          if (!productSnap.exists) throw new Error("CANCEL_PRODUCT_NOT_FOUND");
          const currentStock = Number(productSnap.data()?.stock);
          if (!Number.isSafeInteger(currentStock) || currentStock < 0 || currentStock + quantity > Number.MAX_SAFE_INTEGER) {
            throw new Error("CANCEL_INVENTORY_INVALID");
          }
          restoredStock = currentStock + quantity;
          inventoryRestockStatus = "restocked";
        } else if (order.stockRestocked === true) {
          throw new Error("INVENTORY_ALREADY_RESTOCKED");
        } else {
          inventoryRestockStatus = "manual_review";
        }
      }

      const update: Record<string, unknown> = {
        status: nextStatus,
        updatedAt: FieldValue.serverTimestamp(),
        updatedBy: adminUid,
      };
      if (nextStatus === "delivered") {
        // Delivery status is not proof that any cashback or MLM commission was paid.
        // Keep financial settlement explicitly pending until a trusted server payout flow exists.
        update.deliveredAt = FieldValue.serverTimestamp();
        update.financialProcessingStatus = "pending";
        update.commissionProcessed = false;
        update.commissionDistributed = false;
      }
      if (nextStatus === "cancelled") {
        update.cancelledAt = FieldValue.serverTimestamp();
        update.inventoryRestockStatus = inventoryRestockStatus;
        if (inventoryRestockStatus === "restocked") {
          update.stockRestocked = true;
          update.stockRestockedAt = FieldValue.serverTimestamp();
          if (productRef && restoredStock !== undefined) tx.update(productRef, { stock: restoredStock });
        } else {
          update.inventoryReviewRequired = true;
        }
      }

      tx.update(orderRef, update);
      tx.create(eventRef, {
        orderId,
        fromStatus: currentStatus,
        toStatus: nextStatus,
        actorUid: adminUid,
        createdAt: FieldValue.serverTimestamp(),
      });
      return { unchanged: false, currentStatus, inventoryRestockStatus };
    });

    return NextResponse.json({
      success: true,
      unchanged: result.unchanged,
      status: nextStatus,
      financialProcessingStatus: nextStatus === "delivered" ? "pending" : undefined,
      inventoryRestockStatus: nextStatus === "cancelled" ? (result.unchanged ? undefined : result.inventoryRestockStatus) : undefined,
      message: result.unchanged
        ? "Order already has this status"
        : nextStatus === "cancelled" && result.inventoryRestockStatus === "manual_review"
          ? "Order cancelled. Inventory requires manual review because this legacy order has no verified stock-deduction marker."
          : "Order status updated",
    });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    if (code === "UNAUTHORIZED") return response("Authentication required", 401);
    if (code === "FORBIDDEN") return response("Admin access required", 403);
    if (code === "ORDER_NOT_FOUND") return response("Order not found", 404);
    if (code === "INVALID_TRANSITION") return response("Invalid order status transition", 409);
    if (code === "ALREADY_SETTLED") return response("This order is already financially settled", 409);
    if (code === "PAYMENT_RECONCILIATION_REQUIRED") return response("Cashfree payment is still pending. Verify the provider status before cancelling this order.", 409);
    if (code === "REFUND_REQUIRED") return response("This Cashfree-paid order cannot be cancelled until a full refund is confirmed by Cashfree.", 409);
    if (code === "CANCEL_PRODUCT_NOT_FOUND") return response("The product for this order no longer exists; cancellation requires inventory review", 409);
    if (code === "CANCEL_INVENTORY_INVALID") return response("Inventory data is invalid; cancellation requires manual review", 409);
    if (code === "INVENTORY_ALREADY_RESTOCKED") return response("Inventory was already restored for this order", 409);
    console.error("Admin order status API error:", code || "unknown");
    return response("Unable to update order status", 500);
  }
}
