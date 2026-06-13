"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth, db } from "@/firebase/config";
import { doc, getDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ArrowLeft, MapPin, Loader2, Package, CreditCard, ShieldCheck, ChevronRight } from "lucide-react";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("productId");

  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [address, setAddress] = useState<any>(null);
  const [product, setProduct] = useState<any>(null);

  // ... (Keep your useEffect logic same as provided) ...

  return (
    <main className="min-h-screen bg-[#f8f9fa] pb-24">
      {/* HEADER */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b px-6 py-5 flex items-center gap-4 z-10">
        <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft size={22} className="text-slate-800" />
        </button>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Checkout</h1>
      </div>

      <div className="p-4 space-y-6 max-w-lg mx-auto">
        
        {/* ADDRESS CARD */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-[0_4px_20px_-5px_rgba(0,0,0,0.05)]">
          <h2 className="font-bold flex items-center gap-2 text-slate-400 text-xs uppercase tracking-widest mb-4">
            <MapPin size={16} /> Delivery Location
          </h2>
          {address ? (
            <div className="text-sm text-slate-700 bg-slate-50 p-4 rounded-3xl border border-slate-100/50">
              <p className="font-extrabold text-slate-900 text-base mb-1">{address.fullName}</p>
              <p className="font-medium text-slate-600">{address.mobile}</p>
              <p className="mt-2 text-slate-500 leading-relaxed">{address.address}, {address.city}, {address.pincode}</p>
            </div>
          ) : (
            <button onClick={() => router.push("/address")} className="w-full py-3 border-2 border-dashed border-purple-200 text-purple-600 font-bold rounded-2xl hover:bg-purple-50 transition-all">
              + Add Delivery Address
            </button>
          )}
        </div>

        {/* ORDER SUMMARY */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-[0_4px_20px_-5px_rgba(0,0,0,0.05)]">
          <h2 className="font-bold mb-4 text-slate-400 text-xs uppercase tracking-widest flex items-center gap-2">
            <Package size={16} /> Order Details
          </h2>
          <div className="flex gap-4 items-center">
            <img src={product.image} className="w-16 h-16 rounded-2xl object-cover bg-slate-100" />
            <div className="flex-1">
              <p className="font-bold text-slate-900 line-clamp-1">{product.title}</p>
              <p className="text-sm text-slate-500 font-medium">Qty: 1</p>
            </div>
            <p className="font-bold text-lg text-slate-900">₹{product.discountPrice}</p>
          </div>
          
          <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
            <div className="flex justify-between text-sm text-slate-500">
              <span>Subtotal</span>
              <span>₹{product.price}</span>
            </div>
            <div className="flex justify-between text-sm text-green-600 font-bold">
              <span>Discount</span>
              <span>-₹{product.price - product.discountPrice}</span>
            </div>
            <div className="flex justify-between text-lg font-black text-slate-900 mt-2">
              <span>Total Payable</span>
              <span>₹{product.discountPrice}</span>
            </div>
          </div>
        </div>

        {/* SECURE BADGE */}
        <div className="flex justify-center items-center gap-2 text-slate-400 text-xs font-bold">
          <ShieldCheck size={14} /> 100% Secure Payments
        </div>
      </div>

      {/* FIXED BOTTOM BUTTON */}
      <div className="fixed bottom-0 left-0 w-full p-4 bg-white/80 backdrop-blur-lg border-t border-slate-100">
        <button
          onClick={handlePlaceOrder}
          disabled={loading || !address}
          className="w-full bg-[#7c3aed] text-white rounded-[1.5rem] py-5 font-black text-lg flex items-center justify-center gap-3 hover:bg-[#6d28d9] transition-all shadow-lg shadow-purple-500/30 disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={24} /> : "Place Order (COD)"}
        </button>
      </div>
    </main>
  );
}
