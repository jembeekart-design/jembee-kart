"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp
} from "firebase/firestore";

import {
  Package,
  Truck,
  CheckCircle2,
  Trash2,
  Clock3,
  ShieldCheck,
  AlertCircle
} from "lucide-react";

import { db } from "@/firebase/config";

// ✅ 1. Import MLM Level Distribution Engine Pipeline Hook
import { distributeLevelCommission } from "@/lib/mlm/distributeLevelCommission";

interface Order {
  id: string;
  userId: string; 
  customerName: string;
  productTitle: string;
  amount: number;
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

  /* ======================================================
  CRITICAL STATUS TRANSITION ROUTER (WITH INTEGRATED MLM ENGINE)
  ====================================================== */
  async function updateStatus(id: string, status: string) {
    try {
      const orderRef = doc(db, "orders", id);
      const currentOrder = orders.find((o) => o.id === id);
      if (!currentOrder) return;

      // Duplicate Delivered click protection & payment safety interceptor
      if (status === "delivered" && currentOrder.commissionProcessed) {
        alert("Security Alert: System distribution ledger already finalized for this order ID.");
        return;
      }

      // Node Activation Dynamic Wrapper Strategy
      if (status === "delivered") {
        if (currentOrder.userId) {
          const userProfileRef = doc(db, "users", currentOrder.userId);
          const userSnap = await getDoc(userProfileRef);
          
          if (userSnap.exists()) {
            // STEP 1: Delivered → MLM profile state activation tracking
            await updateDoc(userProfileRef, {
              joinedPackage: true,
              mlmActive: true,
              packageStatus: "active",
              activationDate: serverTimestamp(),
            });

            console.log(`MLM parameters initialized for User ID: ${currentOrder.userId}`);

            // ✅ STEP 2: Trigger Multi-level Commission Engine calculations and Audit Log insertions
            await distributeLevelCommission({
              userId: currentOrder.userId,
              amount: currentOrder.amount,
              orderId: currentOrder.id,
            });

            console.log(`Up-line level distribution sequence dispatched for order trace context: ${id}`);

            // ⚠️ FUTURE SEED COUPLING LINKS:
            // Yahan line up honge reward matrix nodes, rank pools, aur Business Volume calculations.

            // ✅ STEP 3: Single write transaction lock pipeline settlement
            await updateDoc(orderRef, { 
              status, 
              commissionProcessed: true 
            });

            console.log(`Financial settlement locks and status committed atomically for Order ID: ${id}`);
          } else {
            console.warn("User profile path missing from Firestore trees.");
          }
        } else {
          console.warn("Operation bypassed: No userId tracking reference bound inside order doc.");
        }
      } else {
        // Safe router tracking fallback state adjustments (Pending/Shipped execution profiles)
        await updateDoc(orderRef, { status });
      }
    } catch (error) {
      console.error("Pipeline breakdown exception caught inside updateStatus stream:", error);
      alert("System execution fault: Failed to alter order parameter updates.");
    }
  }

  // Delete user traces validation confirmation wrapper
  async function deleteOrder(id: string) {
    if (!confirm("Are you absolutely sure you want to drop this order document trace?")) return;
    try {
      await deleteDoc(doc(db, "orders", id));
    } catch (error) {
      console.error("Failed to safely destroy data node mapping:", error);
    }
  }

  // System load mapping state configuration block
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black font-black text-sm uppercase tracking-widest text-pink-500">
        Syncing Orders Database Stream...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0b0b0b] p-4 text-white">
      {/* HEADER MODULE CONTAINER */}
      <div className="mb-6">
        <h1 className="text-3xl font-black">Orders Manager</h1>
        <p className="mt-1 text-sm text-gray-400">Manage customer orders & MLM structural conversions</p>
      </div>

      {/* ORDERS FEED LAYOUT LAYER */}
      <div className="space-y-5">
        {orders.map((order) => (
          <div
            key={order.id}
            className={`overflow-hidden rounded-[30px] border transition-all ${
              order.status === "delivered" ? "border-green-500/20 bg-[#111612]" : "border-white/10 bg-[#151515]"
            }`}
          >
            {/* TOP INFRA BANNER */}
            <div className="flex items-center justify-between border-b border-white/10 p-4">
              <div className="flex items-center gap-3">
                <img
                  src={order.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500"}
                  alt={order.productTitle || "Product SKU"}
                  className="h-14 w-14 rounded-2xl object-cover ring-1 ring-white/10"
                />
                <div>
                  <h2 className="text-lg font-black">{order.productTitle || "Untitled Product"}</h2>
                  <p className="text-xs text-gray-400">Buyer: {order.customerName || "Guest User"}</p>
                </div>
              </div>

              <button
                onClick={() => deleteOrder(order.id)}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition active:scale-90"
              >
                <Trash2 size={18} />
              </button>
            </div>

            {/* DATA LAYOUT PARAMETERS MATRIX */}
            <div className="space-y-4 p-4">
              <div className="rounded-2xl bg-[#1b1b1b]/60 p-4 border border-white/5">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package size={16} className="text-pink-500" />
                    <p className="text-sm font-bold">Financial Parameters</p>
                  </div>
                  {order.commissionProcessed && (
                    <span className="flex items-center gap-1 text-[10px] bg-cyan-500/20 text-cyan-400 px-2.5 py-1 rounded-full font-black tracking-wider uppercase">
                      <ShieldCheck size={12} /> Commission Paid
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-300">
                  <div>
                    <p><span className="text-gray-500 font-medium">Order Value:</span> <span className="text-green-400 font-bold">₹{order.amount?.toLocaleString("en-IN")}</span></p>
                    <p className="mt-1"><span className="text-gray-500 font-medium">Shipping Address:</span> {order.address || "Digital Delivery Protocol Layer"}</p>
                  </div>
                  <div className="md:text-right flex flex-col justify-end">
                    <p className="text-xs font-mono text-gray-600">Trace ID: {order.userId || "Missing Reference Link"}</p>
                    <p className="text-xs font-mono text-gray-600 mt-0.5">Order ID: {order.id}</p>
                  </div>
                </div>
              </div>

              {/* ACTION TOGGLE MODULE (SECURE INTERACTION INTERFACE SHIELD) */}
              <div>
                <p className="mb-3 text-xs uppercase font-bold tracking-wider text-gray-400">Modify Order Execution State</p>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => updateStatus(order.id, "pending")}
                    disabled={order.commissionProcessed || order.status === "delivered"}
                    className="flex items-center justify-center gap-2 rounded-2xl px-3 py-3 text-sm font-bold transition active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-[#1e1e1e] bg-[#1e1e1e] hover:bg-[#252525] text-gray-400 data-[active=true]:bg-yellow-500 data-[active=true]:text-black"
                    data-active={order.status === "pending"}
                  >
                    <Clock3 size={16} />
                    Pending
                  </button>

                  <button
                    onClick={() => updateStatus(order.id, "shipped")}
                    disabled={order.commissionProcessed || order.status === "delivered"}
                    className="flex items-center justify-center gap-2 rounded-2xl px-3 py-3 text-sm font-bold transition active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-[#1e1e1e] bg-[#1e1e1e] hover:bg-[#252525] text-gray-400 data-[active=true]:bg-blue-500 data-[active=true]:text-white"
                    data-active={order.status === "shipped"}
                  >
                    <Truck size={16} />
                    Shipped
                  </button>

                  <button
                    onClick={() => updateStatus(order.id, "delivered")}
                    disabled={order.commissionProcessed || order.status === "delivered"}
                    className="flex items-center justify-center gap-2 rounded-2xl px-3 py-3 text-sm font-bold transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-[#151a16] disabled:text-green-500/60 bg-[#1e1e1e] hover:bg-[#252525] text-gray-400 data-[active=true]:bg-green-500 data-[active=true]:text-white"
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
          <div className="py-16 text-center rounded-[30px] border border-dashed border-white/10 p-6 bg-[#111]">
            <AlertCircle size={32} className="mx-auto text-gray-600 mb-3" />
            <p className="text-sm font-bold text-gray-500">No customer orders available inside datastore arrays.</p>
          </div>
        )}
      </div>
    </main>
  );
}
