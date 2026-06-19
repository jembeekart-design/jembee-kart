"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import Link from "next/link";
import { ArrowLeft, Copy, MapPin, Phone, Truck, FileText, XCircle, RotateCcw } from "lucide-react";

export default function OrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    getDoc(doc(db, "orders", id as string)).then(snap => {
      if (snap.exists()) setOrder({ id: snap.id, ...snap.data() });
    });
  }, [id]);

  const handleCancel = async () => {
    if (confirm("Are you sure you want to cancel this order?")) {
      await updateDoc(doc(db, "orders", id as string), { status: "Cancelled" });
      setOrder({ ...order, status: "Cancelled" });
    }
  };

  if (!order) return <div className="p-10 text-center font-bold">Loading Order Details...</div>;

  const status = order.status?.toLowerCase() || "placed";
  const steps = ['placed', 'processing', 'shipped', 'delivered'];
  const currentStepIndex = steps.indexOf(status);

  const getStatusColor = (s: string) => ({
    'placed': 'bg-blue-500', 'processing': 'bg-orange-500', 
    'shipped': 'bg-purple-500', 'delivered': 'bg-green-500', 'cancelled': 'bg-red-500'
  }[s?.toLowerCase()] || 'bg-gray-500');

  return (
    <main className="min-h-screen bg-[#f8f9fe] pb-24">
      <div className="sticky top-0 bg-white p-4 flex items-center gap-4 shadow-sm z-20">
        <button onClick={() => router.back()} className="p-2 bg-gray-100 rounded-full"><ArrowLeft size={20}/></button>
        <h1 className="font-black text-lg">Order #{order.orderNumber}</h1>
      </div>

      <div className="p-4 space-y-4">
        {/* HERO CARD - SCHEMA FIXED */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-6 rounded-3xl text-white shadow-lg">
          <div className="flex justify-between items-start">
             <div>
                <p className="opacity-80 text-[10px] font-bold uppercase">Placed: {order?.placedAt?.seconds ? new Date(order.placedAt.seconds * 1000).toLocaleDateString() : 'N/A'}</p>
                <h2 className="text-3xl font-black mt-1">₹{order.finalAmount}</h2>
             </div>
             <button onClick={() => { navigator.clipboard.writeText(order.orderNumber); alert("Order ID Copied!"); }} className="bg-white/20 p-2 rounded-xl"><Copy size={16}/></button>
          </div>
          <div className="flex gap-2 mt-4">
            <span className={`px-3 py-1 ${getStatusColor(status)} rounded-lg text-[10px] font-bold uppercase`}>{order.status}</span>
            <span className="px-3 py-1 bg-white/20 rounded-lg text-[10px] font-bold uppercase">{order.paymentMethod}</span>
          </div>
        </div>

        {/* TRACKING TIMELINE - FIX 3 & 9 */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100">
           <h3 className="font-black text-sm mb-4">Tracking Timeline</h3>
           <div className="space-y-4">
             {steps.map((step, i) => (
                <div key={step} className="flex items-center gap-3">
                   <div className={`w-3 h-3 rounded-full ${i <= currentStepIndex ? 'bg-green-500' : 'bg-gray-200'}`} />
                   <p className={`text-xs font-bold ${i <= currentStepIndex ? 'text-gray-900' : 'text-gray-400'}`}>{step.charAt(0).toUpperCase() + step.slice(1)}</p>
                </div>
             ))}
           </div>
        </div>

        {/* PRODUCT CARD - SCHEMA FIXED (NO ITEMS ARRAY) */}
        <div className="bg-white p-4 rounded-3xl flex gap-4 border border-gray-100">
          <img src={order.productImage || "/placeholder.png"} className="w-20 h-20 rounded-2xl object-cover bg-gray-50" />
          <div className="flex-1">
            <h2 className="font-bold text-sm">{order.productTitle}</h2>
            <p className="text-[10px] font-bold text-gray-500">Qty: {order.quantity} | Price: ₹{order.productPrice}</p>
            <p className="text-sm font-black text-indigo-600 mt-1">Total: ₹{order.quantity * order.productPrice}</p>
          </div>
        </div>

        {/* SUMMARY - SCHEMA FIXED */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 text-sm space-y-2">
            <div className="flex justify-between"><p>Subtotal</p><p className="font-bold">₹{order.quantity * order.productPrice}</p></div>
            <div className="flex justify-between text-red-500"><p>Discount</p><p className="font-bold">-₹{order.discount || 0}</p></div>
            <div className="flex justify-between font-black text-lg pt-2 border-t"><p>Total</p><p>₹{order.finalAmount}</p></div>
        </div>

        {/* DELIVERY ADDRESS - SCHEMA FIXED */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100">
           <h3 className="font-black text-sm mb-3 flex items-center gap-2 text-indigo-600"><MapPin size={16}/> Delivery Address</h3>
           <p className="font-bold">{order.shippingAddress?.fullName}</p>
           <p className="text-sm text-gray-600">{order.shippingAddress?.address}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
           <p className="text-sm font-bold flex items-center gap-2 mt-2"><Phone size={14}/> {order.shippingAddress?.mobile}</p>
        </div>

        {/* ACTIONS */}
        <div className="grid grid-cols-2 gap-3">
           <Link href={`/track-order/${id}`} className="bg-indigo-600 text-white p-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2"><Truck size={16}/> Track</Link>
           <button className="bg-white p-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 border"><FileText size={16}/> Invoice</button>
           {["placed", "processing"].includes(status) && (
             <button onClick={handleCancel} className="bg-red-50 text-red-600 p-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2"><XCircle size={16}/> Cancel Order</button>
           )}
           {status === "delivered" && order.exchangeEligible && (
             <button className="bg-green-50 text-green-600 p-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2"><RotateCcw size={16}/> Return</button>
           )}
        </div>
      </div>
    </main>
  );
}
