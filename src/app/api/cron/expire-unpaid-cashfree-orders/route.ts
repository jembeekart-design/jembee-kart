import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { timingSafeEqual } from "node:crypto";
import { getAdminDb } from "@/firebase/admin";
import { cashfreeRequest, confirmCashfreePayment, getCashfreeConfig } from "@/lib/payments/cashfree";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorized(req: NextRequest): boolean {
  const expected = process.env.CRON_SECRET || "";
  const provided = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "").trim();
  if (!expected || !provided) return false;
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(provided, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(req: NextRequest) {
  if (!process.env.CRON_SECRET) return NextResponse.json({ success: false, message: "Cron is not configured" }, { status: 503 });
  if (!authorized(req)) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  try {
    const db = getAdminDb();
    const now = new Date();
    const due = await db.collection("orders")
      .where("paymentMethod", "==", "cashfree")
      .where("paymentStatus", "==", "pending")
      .where("status", "==", "payment_pending")
      .where("paymentExpiresAt", "<=", now)
      .orderBy("paymentExpiresAt", "asc")
      .limit(50)
      .get();

    let expired = 0;
    let skipped = 0;
    for (const snapshot of due.docs) {
      const orderRef = snapshot.ref;
      const eventRef = db.collection("orderStatusEvents").doc(`cashfree_expire_${snapshot.id}`);
      const initial = snapshot.data();
      if (initial.paymentInitiationStatus === "created" && initial.cashfreePaymentSessionId) {
        // Do provider reconciliation outside the Firestore transaction. If the provider
        // cannot confirm the order is expired, inventory remains reserved.
        try {
          const config = await getCashfreeConfig({ requireEnabled: false });
          const providerOrderId = typeof initial.cashfreeOrderId === "string" ? initial.cashfreeOrderId : snapshot.id;
          const payments = await cashfreeRequest<Array<Record<string, unknown>>>(config, `/orders/${encodeURIComponent(providerOrderId)}/payments`);
          const successfulPayments = Array.isArray(payments) ? payments.filter((item) => String(item.payment_status || "").toUpperCase() === "SUCCESS") : [];
          if (successfulPayments.length > 0) {
            for (const successful of successfulPayments) await confirmCashfreePayment(snapshot.id, providerOrderId, successful);
            skipped += 1;
            continue;
          }
          const providerOrder = await cashfreeRequest<Record<string, unknown>>(config, `/orders/${encodeURIComponent(providerOrderId)}`);
          const providerStatus = String(providerOrder.order_status || "").toUpperCase();
          if (providerStatus !== "EXPIRED" && providerStatus !== "TERMINATED") {
            skipped += 1;
            continue;
          }
        } catch {
          // Provider state is unknown; never release stock based only on a local timeout.
          skipped += 1;
          continue;
        }
      }

      const result = await db.runTransaction(async (tx) => {
        const currentSnap = await tx.get(orderRef);
        if (!currentSnap.exists) return "skipped" as const;
        const order = currentSnap.data() || {};
        const expiry = order.paymentExpiresAt?.toDate?.() || (order.paymentExpiresAt instanceof Date ? order.paymentExpiresAt : null);
        if (order.paymentMethod !== "cashfree" || order.paymentStatus !== "pending" || order.status !== "payment_pending" || !expiry || expiry.getTime() > Date.now()) return "skipped" as const;
        let productRef: FirebaseFirestore.DocumentReference | null = null;
        let restoredStock: number | null = null;
        let restockStatus: "restocked" | "manual_review" = "manual_review";
        if (order.stockDeducted === true && order.stockRestocked !== true) {
          const productId = typeof order.productId === "string" ? order.productId : "";
          const quantity = Number(order.quantity);
          if (!productId || !Number.isSafeInteger(quantity) || quantity < 1 || quantity > 20) return "inventory_error" as const;
          productRef = db.collection("products").doc(productId);
          const productSnap = await tx.get(productRef);
          if (!productSnap.exists) return "inventory_error" as const;
          const stock = Number(productSnap.data()?.stock);
          if (!Number.isSafeInteger(stock) || stock < 0 || stock + quantity > Number.MAX_SAFE_INTEGER) return "inventory_error" as const;
          restoredStock = stock + quantity;
          restockStatus = "restocked";
        }

        tx.update(orderRef, {
          status: "cancelled",
          paymentStatus: "expired",
          paymentExpiredAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
          inventoryRestockStatus: restockStatus,
          ...(restockStatus === "restocked" ? { stockRestocked: true, stockRestockedAt: FieldValue.serverTimestamp() } : { inventoryReviewRequired: true }),
        });
        if (productRef && restoredStock !== null) tx.update(productRef, { stock: restoredStock });
        tx.create(eventRef, {
          orderId: snapshot.id,
          fromStatus: "payment_pending",
          toStatus: "cancelled",
          actorUid: "system:cashfree-expiry-cron",
          inventoryRestockStatus: restockStatus,
          createdAt: FieldValue.serverTimestamp(),
        });
        return "expired" as const;
      });
      if (result === "expired") expired += 1;
      else skipped += 1;
    }

    return NextResponse.json({ success: true, scanned: due.size, expired, skipped, limit: 50 });
  } catch (error) {
    console.error("Cashfree expiry cron error:", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ success: false, message: "Unable to expire unpaid orders" }, { status: 500 });
  }
}
