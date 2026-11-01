"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";

import {
  Package,
  Truck,
  CheckCircle2,
  Clock3,
  ShieldCheck,
  AlertCircle
} from "lucide-react";

import { auth, db } from "@/firebase/config";

interface Order {
  id: string;
  userId: string; 
  customerName: string;
  productTitle: string;
  amount: number;
  profitAmount?: number; // FUTURE SCALABILITY: Aligns strictly to e-commerce net margins (₹50–₹200)
  status: string;
  address: string;
  image: string;
  commissionProcessed?: boolean; // Cryptographic lock against duplicate payments loop
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Realtime orders hook stream reader (onSnapshot)
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "orders"),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        })) as Order[];
        
        setOrders(data);
        setLoading(false);
      },
      (error) => {
        console.error("Firestore orders channel synchronization exception:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  /* Order lifecycle changes are performed by the authenticated server API.
     Browser-side commission and wallet writes are intentionally not invoked here. */
  async function updateStatus(id: string, status: string) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Please sign in again.");
      const token = await user.getIdToken();
      const response = await fetch("/api/admin/orders/status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderId: id, status }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.success !== true) {
        throw new Error(typeof result.message === "string" ? result.message : "Order status update failed.");
      }
      if (status === "delivered") {
        alert("Order marked delivered. Financial settlement remains pending and no commission has been marked as paid.");
      } else if (status === "cancelled" && result.inventoryRestockStatus === "manual_review") {
        alert("Order cancelled. This legacy order has no verified stock-deduction marker, so inventory must be reviewed manually.");
      } else if (status === "cancelled" && result.inventoryRestockStatus === "restocked") {
        alert("Order cancelled and product stock restored.");
      }
    } catch (error) {
      console.error("Order status update failed:", error);
      alert(error instanceof Error ? error.message : "Failed to update order status.");
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-card-background)] font-black text-sm uppercase tracking-widest text-[var(--color-primary-button)]">
        Syncing Orders Database Stream...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--color-page-background)] p-4 text-[var(--button-text-color)]">
      {/* HEADER MODULE CONTAINER */}
      <div className="mb-6">
        <h1 className="text-3xl font-black">Orders Manager</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">Manage customer orders and delivery status</p>
      </div>

      {/* ORDERS FEED LAYOUT LAYER */}
      <div className="space-y-5">
        {orders.map((order) => (
          <div
            key={order.id}
            className={`overflow-hidden rounded-[30px] border transition-all ${
              order.status === "delivered" ? "border-[var(--color-success)]/20 bg-[var(--color-card-background)]" : "border-[var(--color-border)]/10 bg-[var(--color-card-background)]"
            }`}
          >
            {/* TOP INFRA BANNER */}
            <div className="flex items-center justify-between border-b border-[var(--color-border)]/10 p-4">
              <div className="flex items-center gap-3">
                <img
                  src={order.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500"}
                  alt={order.productTitle || "Product SKU"}
                  className="h-14 w-14 rounded-2xl object-cover ring-1 ring-white/10"
                />
                <div>
                  <h2 className="text-lg font-black">{order.productTitle || "Untitled Product"}</h2>
                  <p className="text-xs text-[var(--muted-text-color)]">Buyer: {order.customerName || "Guest User"}</p>
                </div>
              </div>


            </div>

            {/* DATA LAYOUT PARAMETERS MATRIX */}
            <div className="space-y-4 p-4">
              <div className="rounded-2xl bg-[var(--color-page-background)]/60 p-4 border border-[var(--color-border)]/5">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package size={16} className="text-[var(--color-primary-button)]" />
                    <p className="text-sm font-bold">Financial Parameters</p>
                  </div>
                  {order.commissionProcessed && (
                    <span className="flex items-center gap-1 text-[10px] bg-[var(--color-primary-button)]/20 text-[var(--color-primary-button)] px-2.5 py-1 rounded-full font-black tracking-wider uppercase">
                      <ShieldCheck size={12} /> Commission Paid
                    </span>
                  )}
                </div>

                {order.status === "delivered" && order.commissionProcessed !== true && (
                  <p className="mb-3 rounded-xl border border-[var(--color-warning)]/30 bg-[var(--color-warning)]/10 px-3 py-2 text-xs font-semibold text-[var(--text-primary)]">Delivered — financial settlement pending; no commission payout is confirmed.</p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-[var(--text-primary)]">
                  <div>
                    <p><span className="text-[var(--text-muted)] font-medium">Order Value:</span> <span className="text-[var(--color-success)] font-bold">₹{order.amount?.toLocaleString("en-IN")}</span></p>
                    {order.profitAmount !== undefined && (
                      <p className="mt-1"><span className="text-[var(--text-muted)] font-medium">Net Profit Margin:</span> <span className="text-[var(--color-warning)] font-bold">₹{order.profitAmount?.toLocaleString("en-IN")}</span></p>
                    )}
                    <p className="mt-1"><span className="text-[var(--text-muted)] font-medium">Shipping Address:</span> {order.address || "Digital Delivery Protocol Layer"}</p>
                  </div>
                  <div className="md:text-right flex flex-col justify-end">
                    <p className="text-xs font-mono text-[var(--text-muted)]">Trace ID: {order.userId || "Missing Reference Link"}</p>
                    <p className="text-xs font-mono text-[var(--text-muted)] mt-0.5">Order ID: {order.id}</p>
                  </div>
                </div>
              </div>

              {/* ACTION TOGGLE MODULE (SECURE INTERACTION INTERFACE SHIELD) */}
              <div>
                <p className="mb-3 text-xs uppercase font-bold tracking-wider text-[var(--text-muted)]">Modify Order Execution State</p>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => updateStatus(order.id, "processing")}
                    disabled={order.commissionProcessed || order.status === "delivered"}
                    className="flex items-center justify-center gap-2 rounded-2xl px-3 py-3 text-sm font-bold transition active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-[var(--color-card-background)] bg-[var(--color-card-background)] hover:bg-[var(--color-card-background)] text-[var(--text-muted)] data-[active=true]:bg-[var(--color-warning)] data-[active=true]:text-[var(--text-primary)]"
                    data-active={order.status === "processing" || order.status === "pending" || order.status === "placed"}
                  >
                    <Clock3 size={16} />
                    Processing
                  </button>

                  <button
                    onClick={() => updateStatus(order.id, "shipped")}
                    disabled={order.commissionProcessed || order.status === "delivered"}
                    className="flex items-center justify-center gap-2 rounded-2xl px-3 py-3 text-sm font-bold transition active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-[var(--color-card-background)] bg-[var(--color-card-background)] hover:bg-[var(--color-card-background)] text-[var(--text-muted)] data-[active=true]:theme-primary-bg data-[active=true]:text-[var(--button-text-color)]"
                    data-active={order.status === "shipped"}
                  >
                    <Truck size={16} />
                    Shipped
                  </button>

                  <button
                    onClick={() => updateStatus(order.id, "delivered")}
                    disabled={order.commissionProcessed || order.status === "delivered"}
                    className="flex items-center justify-center gap-2 rounded-2xl px-3 py-3 text-sm font-bold transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-[var(--color-card-background)] disabled:text-[var(--color-success)]/60 bg-[var(--color-card-background)] hover:bg-[var(--color-card-background)] text-[var(--text-muted)] data-[active=true]:bg-[var(--color-success)] data-[active=true]:text-[var(--button-text-color)]"
                    data-active={order.status === "delivered"}
                  >
                    <CheckCircle2 size={16} />
                    Delivered
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Empty State Handling Layout */}
        {orders.length === 0 && (
          <div className="py-16 text-center rounded-[30px] border border-dashed border-[var(--color-border)]/10 p-6 bg-[var(--color-card-background)]">
            <AlertCircle size={32} className="mx-auto text-[var(--text-muted)] mb-3" />
            <p className="text-sm font-bold text-[var(--text-muted)]">No customer orders available inside datastore arrays.</p>
          </div>
        )}
      </div>
    </main>
  );
}
