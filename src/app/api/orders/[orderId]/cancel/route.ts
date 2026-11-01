import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminAuth, getAdminDb } from "@/firebase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function fail(message: string, status: number) {
  return NextResponse.json({ success: false, message }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ orderId: string }> },
) {
  try {
    const authorization = req.headers.get("authorization") || "";
    if (!authorization.startsWith("Bearer ")) return fail("Authentication required", 401);
    let uid: string;
    try {
      const decoded = await getAdminAuth().verifyIdToken(authorization.slice(7).trim(), true);
      uid = decoded.uid;
    } catch {
      return fail("Session is invalid. Please sign in again.", 401);
    }

    const { orderId } = await context.params;
    if (!orderId || orderId.length > 200 || !/^[A-Za-z0-9_-]+$/.test(orderId)) return fail("Invalid order ID", 400);

    const db = getAdminDb();
    const orderRef = db.collection("orders").doc(orderId);
    const eventRef = db.collection("orderStatusEvents").doc();

    const result = await db.runTransaction(async (tx) => {
      const orderSnap = await tx.get(orderRef);
      if (!orderSnap.exists) return { code: "NOT_FOUND" as const };
      const order = orderSnap.data() || {};
      if (order.userId !== uid) return { code: "NOT_FOUND" as const };

      const status = typeof order.status === "string" ? order.status.toLowerCase() : "placed";
      if (status === "cancelled") return { code: "ALREADY_CANCELLED" as const };
      if (status !== "placed" && status !== "processing") return { code: "NOT_CANCELLABLE" as const };

      const paymentMethod = typeof order.paymentMethod === "string" ? order.paymentMethod.toLowerCase() : "cod";
      const paymentStatus = typeof order.paymentStatus === "string" ? order.paymentStatus.toLowerCase() : "not_required";
      if (paymentMethod === "cashfree" && paymentStatus === "paid") return { code: "REFUND_REQUIRED" as const };
      if (paymentMethod === "cashfree" && paymentStatus === "pending") return { code: "PAYMENT_RECONCILIATION_REQUIRED" as const };

      let restockStatus: "restocked" | "manual_review" = "manual_review";
      let productRef: FirebaseFirestore.DocumentReference | null = null;
      let newStock: number | null = null;

      if (order.stockDeducted === true && order.stockRestocked !== true) {
        const productId = typeof order.productId === "string" ? order.productId : "";
        const quantity = Number(order.quantity);
        if (!productId || !Number.isSafeInteger(quantity) || quantity < 1 || quantity > 20) {
          return { code: "INVENTORY_INVALID" as const };
        }
        productRef = db.collection("products").doc(productId);
        const productSnap = await tx.get(productRef);
        if (!productSnap.exists) return { code: "PRODUCT_MISSING" as const };
        const currentStock = Number(productSnap.data()?.stock);
        if (!Number.isSafeInteger(currentStock) || currentStock < 0 || currentStock + quantity > Number.MAX_SAFE_INTEGER) {
          return { code: "INVENTORY_INVALID" as const };
        }
        newStock = currentStock + quantity;
        restockStatus = "restocked";
      } else if (order.stockRestocked === true) {
        return { code: "ALREADY_RESTOCKED" as const };
      }

      tx.update(orderRef, {
        status: "cancelled",
        cancelledAt: FieldValue.serverTimestamp(),
        cancelledBy: uid,
        updatedAt: FieldValue.serverTimestamp(),
        inventoryRestockStatus: restockStatus,
        ...(restockStatus === "restocked" ? { stockRestocked: true, stockRestockedAt: FieldValue.serverTimestamp() } : { inventoryReviewRequired: true }),
      });
      if (productRef && newStock !== null) tx.update(productRef, { stock: newStock });
      tx.create(eventRef, {
        orderId,
        fromStatus: status,
        toStatus: "cancelled",
        actorUid: uid,
        actorType: "customer",
        inventoryRestockStatus: restockStatus,
        createdAt: FieldValue.serverTimestamp(),
      });
      return { code: "CANCELLED" as const, restockStatus };
    });

    switch (result.code) {
      case "NOT_FOUND": return fail("Order not found", 404);
      case "ALREADY_CANCELLED": return fail("This order is already cancelled", 409);
      case "NOT_CANCELLABLE": return fail("This order can no longer be cancelled", 409);
      case "REFUND_REQUIRED": return fail("This order is already paid. Please submit a refund request instead of cancelling it here.", 409);
      case "PAYMENT_RECONCILIATION_REQUIRED": return fail("Payment is still pending. Please wait for payment verification before cancelling.", 409);
      case "INVENTORY_INVALID": return fail("Inventory data is invalid; support must review this cancellation", 409);
      case "PRODUCT_MISSING": return fail("The product no longer exists; support must review this cancellation", 409);
      case "ALREADY_RESTOCKED": return fail("Inventory was already restored for this order", 409);
      default:
        return NextResponse.json({
          success: true,
          status: "cancelled",
          inventoryRestockStatus: result.restockStatus,
          message: result.restockStatus === "manual_review"
            ? "Order cancelled. Inventory requires manual review because this legacy order has no verified stock-deduction marker."
            : "Order cancelled and inventory restored.",
        }, { headers: { "Cache-Control": "no-store" } });
    }
  } catch (error) {
    console.error("Customer order cancellation error:", error instanceof Error ? error.message : "unknown");
    return fail("Unable to cancel this order", 500);
  }
}
