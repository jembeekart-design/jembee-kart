"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useParams, useRouter } from "next/navigation";
import { auth } from "@/firebase/config";
import Link from "next/link";
import { ArrowLeft, Copy, MapPin, Phone, Truck, FileText, XCircle, RotateCcw } from "lucide-react";

export default function OrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (!id) return;
    let active = true;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!active) return;
      if (!user) {
        setLoadError("Please sign in to view this order.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const token = await user.getIdToken();
        const response = await fetch(`/api/orders/${encodeURIComponent(String(id))}`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        const result = await response.json().catch(() => null);
        if (!response.ok || result?.success !== true || !result.order) {
          throw new Error(result?.message || "Unable to load order details.");
        }
        if (active) {
          setOrder(result.order);
          setLoadError("");
        }
      } catch (error) {
        if (active) setLoadError(error instanceof Error ? error.message : "Unable to load order details.");
      } finally {
        if (active) setLoading(false);
      }
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, [id]);

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    const user = auth.currentUser;
    if (!user) {
      alert("Please sign in again to cancel this order.");
      return;
    }
    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/orders/${encodeURIComponent(String(id))}/cancel`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || result?.success !== true) {
        throw new Error(result?.message || "Order cancellation failed.");
      }
      setOrder({ ...order, status: "cancelled", inventoryRestockStatus: result.inventoryRestockStatus });
      alert(result.message || "Order cancelled.");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Order cancellation failed.");
    }
  };

  if (loading) return <div className="p-10 text-center font-bold">Loading Order Details...</div>;
  if (loadError || !order) return <div className="p-10 text-center space-y-3"><p className="font-bold">{loadError || "Order not found."}</p><button onClick={() => router.push("/orders")} className="underline">Back to Orders</button></div>;

  const status = order.status?.toLowerCase() || "placed";
  const steps = ['placed', 'processing', 'shipped', 'delivered'];
  const currentStepIndex = steps.indexOf(status);

  const getStatusColor = (s: string) => ({
    'placed': 'theme-primary-bg', 'processing': 'bg-[var(--color-warning)]', 
    'shipped': 'bg-[var(--color-primary-button)]', 'delivered': 'bg-[var(--color-success)]', 'cancelled': 'bg-[var(--color-danger)]'
  }[s?.toLowerCase()] || 'bg-[var(--color-page-background)]0');

  return (
    <main className="min-h-screen bg-[var(--color-page-background)] pb-24">
      <div className="sticky top-0 bg-[var(--color-card-background)] p-4 flex items-center gap-4 shadow-sm z-20">
        <button onClick={() => router.back()} className="p-2 bg-[var(--color-page-background)] rounded-full"><ArrowLeft size={20}/></button>
        <h1 className="font-black text-lg">Order #{order.orderNumber}</h1>
      </div>

      <div className="p-4 space-y-4">
        {/* HERO CARD - SCHEMA FIXED */}
        <div className="bg-gradient-to-r from-[var(--color-primary-button)] to-[var(--color-primary-button)] p-6 rounded-3xl text-[var(--button-text-color)] shadow-lg">
          <div className="flex justify-between items-start">
             <div>
                <p className="opacity-80 text-[10px] font-bold uppercase">Placed: {order?.placedAt?.seconds ? new Date(order.placedAt.seconds * 1000).toLocaleDateString() : 'N/A'}</p>
                <h2 className="text-3xl font-black mt-1">₹{order.finalAmount}</h2>
             </div>
             <button onClick={() => { navigator.clipboard.writeText(order.orderNumber); alert("Order ID Copied!"); }} className="bg-[var(--color-card-background)]/20 p-2 rounded-xl"><Copy size={16}/></button>
          </div>
          <div className="flex gap-2 mt-4">
            <span className={`px-3 py-1 ${getStatusColor(status)} rounded-lg text-[10px] font-bold uppercase`}>{order.status}</span>
            <span className="px-3 py-1 bg-[var(--color-card-background)]/20 rounded-lg text-[10px] font-bold uppercase">{order.paymentMethod}</span>
          </div>
        </div>

        {/* TRACKING TIMELINE - FIX 3 & 9 */}
        <div className="bg-[var(--color-card-background)] p-5 rounded-3xl border border-[var(--color-border)]">
           <h3 className="font-black text-sm mb-4">Tracking Timeline</h3>
           <div className="space-y-4">
             {steps.map((step, i) => (
                <div key={step} className="flex items-center gap-3">
                   <div className={`w-3 h-3 rounded-full ${i <= currentStepIndex ? 'bg-[var(--color-success)]' : 'bg-[var(--color-card-background)]'}`} />
                   <p className={`text-xs font-bold ${i <= currentStepIndex ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>{step.charAt(0).toUpperCase() + step.slice(1)}</p>
                </div>
             ))}
           </div>
        </div>

        {/* PRODUCT CARD - SCHEMA FIXED (NO ITEMS ARRAY) */}
        <div className="bg-[var(--color-card-background)] p-4 rounded-3xl flex gap-4 border border-[var(--color-border)]">
          <img src={order.productImage || "/placeholder.png"} className="w-20 h-20 rounded-2xl object-cover bg-[var(--color-page-background)]" />
          <div className="flex-1">
            <h2 className="font-bold text-sm">{order.productTitle}</h2>
            <p className="text-[10px] font-bold text-[var(--text-secondary)]">Qty: {order.quantity} | Price: ₹{order.productPrice}</p>
            <p className="text-sm font-black text-[var(--color-primary-button)] mt-1">Total: ₹{order.quantity * order.productPrice}</p>
          </div>
        </div>

        {/* SUMMARY - SCHEMA FIXED */}
        <div className="bg-[var(--color-card-background)] p-5 rounded-3xl border border-[var(--color-border)] text-sm space-y-2">
            <div className="flex justify-between"><p>Subtotal</p><p className="font-bold">₹{order.quantity * order.productPrice}</p></div>
            <div className="flex justify-between text-[var(--color-danger)]"><p>Discount</p><p className="font-bold">-₹{order.discount || 0}</p></div>
            <div className="flex justify-between font-black text-lg pt-2 border-t"><p>Total</p><p>₹{order.finalAmount}</p></div>
        </div>

        {/* DELIVERY ADDRESS - SCHEMA FIXED */}
        <div className="bg-[var(--color-card-background)] p-5 rounded-3xl border border-[var(--color-border)]">
           <h3 className="font-black text-sm mb-3 flex items-center gap-2 text-[var(--color-primary-button)]"><MapPin size={16}/> Delivery Address</h3>
           <p className="font-bold">{order.shippingAddress?.fullName}</p>
           <p className="text-sm text-[var(--text-secondary)]">{order.shippingAddress?.address}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
           <p className="text-sm font-bold flex items-center gap-2 mt-2"><Phone size={14}/> {order.shippingAddress?.mobile}</p>
        </div>

        {/* ACTIONS */}
        <div className="grid grid-cols-2 gap-3">
           <Link href={`/track-order/${id}`} className="bg-[var(--color-primary-button)] text-[var(--button-text-color)] p-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2"><Truck size={16}/> Track</Link>
           <button className="bg-[var(--color-card-background)] p-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 border"><FileText size={16}/> Invoice</button>
           {["placed", "processing"].includes(status) && (
             <button onClick={handleCancel} className="bg-[var(--color-danger)] text-[var(--color-danger)] p-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2"><XCircle size={16}/> Cancel Order</button>
           )}
           {status === "delivered" && order.exchangeEligible && (
             <button className="bg-[var(--color-success)] text-[var(--color-success)] p-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2"><RotateCcw size={16}/> Return</button>
           )}
        </div>
      </div>
    </main>
  );
}
