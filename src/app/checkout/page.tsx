"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth, db } from "@/firebase/config";
import { doc, getDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ArrowLeft, MapPin, Loader2, ShieldCheck, CreditCard, ChevronRight, Home, Lock } from "lucide-react";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("productId");

  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [address, setAddress] = useState<any>(null);
  const [product, setProduct] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user || !productId) { setDataLoading(false); return; }
      try {
        const addrRef = doc(db, "users", user.uid, "addresses", "default");
        const addrSnap = await getDoc(addrRef);
        if (addrSnap.exists()) setAddress(addrSnap.data());
        const prodRef = doc(db, "products", productId);
        const prodSnap = await getDoc(prodRef);
        if (prodSnap.exists()) setProduct({ id: prodSnap.id, ...prodSnap.data() });
      } catch (err) { console.error(err); } finally { setDataLoading(false); }
    });
    return () => unsubscribe();
  }, [productId]);

  if (dataLoading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="animate-spin text-purple-600" /></div>;

  return (
    <main className="min-h-screen bg-[#f3f4fa] pb-32 px-4 max-w-lg mx-auto font-sans">
      {/* HEADER */}
      <div className="py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()}><ArrowLeft size={24} className="text-gray-900" /></button>
          <div>
            <h1 className="text-xl font-bold">Checkout</h1>
            <p className="text-xs text-gray-500">Review your order and place</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-purple-700">
          <ShieldCheck size={18} />
          <span className="text-xs font-bold">100% Secure</span>
        </div>
      </div>

      {/* PRODUCT CARD */}
      <div className="bg-white p-4 rounded-2xl mb-4 border flex gap-4 shadow-sm">
        <img src={product?.image} className="w-20 h-20 rounded-xl object-cover" />
        <div className="flex-1">
          <h3 className="font-bold text-gray-900">T Shirt</h3>
          <p className="text-xs text-gray-500 font-medium">Size: M • Color: Black</p>
          <div className="bg-green-50 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded w-fit my-1">27% OFF</div>
          <div className="flex items-baseline gap-2">
            <span className="text-xs line-through text-gray-400">₹1499</span>
            <span className="text-lg font-bold">₹1099</span>
          </div>
        </div>
        <div className="text-xs font-bold self-start">Qty: 1</div>
      </div>

      {/* DELIVERY ADDRESS */}
      <div className="bg-white p-5 rounded-2xl mb-4 border shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-bold flex items-center gap-2 text-sm"><MapPin size={16} className="text-purple-600"/> Delivery Address</h2>
          <button className="text-purple-600 font-bold text-xs">Change Address {">"}</button>
        </div>
        <div className="flex gap-3">
          <div className="bg-purple-50 p-3 rounded-xl h-fit"><Home size={20} className="text-purple-600"/></div>
          <div className="text-sm text-gray-600">
            <p className="font-bold text-gray-900">{address?.fullName || "Md Alim Ansari"}</p>
            <p>{address?.mobile || "7061369212"}</p>
            <p className="text-xs leading-relaxed">{address?.address || "Purelia road no 12 mango Jamshedpur"}</p>
          </div>
        </div>
      </div>

      {/* PAYMENT METHOD */}
      <div className="bg-white p-5 rounded-2xl mb-4 border shadow-sm">
        <h2 className="font-bold text-sm mb-4 flex items-center gap-2"><CreditCard size={16} className="text-purple-600"/> Payment Method</h2>
        <div className="border border-purple-200 bg-purple-50/50 p-3 rounded-xl flex justify-between items-center mb-2">
          <div className="flex items-center gap-3">
            <input type="radio" checked className="accent-purple-600" />
            <span className="text-sm font-bold">Cash On Delivery (COD)</span>
          </div>
          <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded font-bold">Recommended</span>
        </div>
        <div className="flex items-center gap-3 p-3 opacity-50"><input type="radio" disabled /> <span className="text-sm font-medium">UPI / Google Pay</span></div>
      </div>

      {/* PRICE DETAILS */}
      <div className="bg-white p-5 rounded-2xl border shadow-sm mb-4">
        <h2 className="font-bold text-sm mb-3">Price Details</h2>
        <div className="flex justify-between text-sm py-1"><span>MRP</span><span>₹1499</span></div>
        <div className="flex justify-between text-sm py-1 text-green-600 font-bold"><span>Discount</span><span>- ₹400</span></div>
        <div className="flex justify-between text-sm py-1"><span>Delivery Charges</span><span className="text-green-600 font-bold">FREE</span></div>
        <hr className="my-2 border-dashed" />
        <div className="flex justify-between text-base font-bold"><span>Total Payable</span><span>₹1099</span></div>
      </div>

      {/* EXPECTED DELIVERY */}
      <div className="bg-white p-4 rounded-2xl border shadow-sm mb-6 flex items-center gap-4">
        <div className="text-2xl">🚚</div>
        <div>
          <p className="text-xs font-bold text-gray-500">Expected Delivery</p>
          <p className="text-sm font-bold">Between 24 - 26 May 2025</p>
        </div>
      </div>

      {/* FIXED BUTTON */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t rounded-t-3xl shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <button onClick={() => alert("Order Placed!")} className="w-full bg-purple-700 text-white py-4 rounded-xl font-bold text-lg">
          Place Order (COD)
        </button>
        <p className="text-center text-[10px] text-gray-400 mt-2 font-bold">Your information is safe with us</p>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return <Suspense fallback={<div>Loading...</div>}><CheckoutContent /></Suspense>;
}
