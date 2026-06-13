"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth, db } from "@/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { 
  ArrowLeft, MapPin, Loader2, ShieldCheck, CreditCard, 
  Home, Truck, Heart, Info, Smartphone, CheckCircle 
} from "lucide-react";

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

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      router.push(`/payment-success`);
    } catch (error) {
      alert("Order Failed");
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="animate-spin text-purple-600" /></div>;

  return (
    <main className="min-h-screen bg-[#f8f9fe] pb-32 px-4 max-w-lg mx-auto font-sans">
      
      {/* HEADER */}
      <div className="py-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 bg-white rounded-full shadow-sm"><ArrowLeft size={20} /></button>
          <h1 className="text-2xl font-black text-gray-900 tracking-tighter">Checkout</h1>
        </div>
        <div className="flex gap-4 text-gray-400">
          <Heart size={22} />
          <Info size={22} />
        </div>
      </div>

      {/* PRODUCT CARD */}
      <div className="bg-white p-5 rounded-[2rem] mb-4 shadow-sm border border-gray-100 flex gap-5 relative">
        <img src={product?.image} className="w-24 h-24 rounded-2xl object-cover bg-gray-100" />
        <div className="flex-1 flex flex-col justify-center">
          <h3 className="font-bold text-gray-900 text-sm leading-tight">{product?.title || "T Shirt"}</h3>
          <p className="text-[11px] text-gray-400 font-semibold mt-1">Size: M • Color: Black</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-[11px] line-through text-gray-400 font-bold">₹1499</span>
            <span className="text-lg font-black text-gray-900">₹1099</span>
          </div>
        </div>
        <div className="absolute top-5 right-5 text-[10px] font-bold bg-gray-100 px-3 py-1 rounded-full text-gray-600">Qty: 1</div>
      </div>

      {/* DELIVERY ADDRESS */}
      <div className="bg-white p-6 rounded-[2rem] mb-4 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-5">
          <h2 className="font-bold text-sm flex items-center gap-2 text-gray-800"><MapPin size={18} className="text-purple-600"/> Delivery Address</h2>
          <button className="text-purple-600 font-bold text-[11px]">Change {">"}</button>
        </div>
        <div className="flex gap-4 items-start">
          <div className="bg-purple-50 p-3 rounded-2xl"><Home size={20} className="text-purple-600"/></div>
          <div className="text-xs text-gray-600 leading-relaxed">
            <p className="font-bold text-gray-900 text-sm">{address?.fullName || "Md Alim Ansari"}</p>
            <p className="font-semibold text-gray-500 mt-0.5">{address?.mobile || "7061369212"}</p>
            <p className="text-[11px] mt-1 pr-2">{address?.address || "Purelia road no 12 mango Jamshedpur, 831012"}</p>
          </div>
        </div>
      </div>

      {/* PAYMENT METHOD */}
      <div className="bg-white p-6 rounded-[2rem] mb-4 shadow-sm border border-gray-100">
        <h2 className="font-bold text-sm mb-5 text-gray-800"><CreditCard size={18} className="inline mr-2 text-purple-600"/> Payment Method</h2>
        
        <div className="border-2 border-purple-600 bg-purple-50 p-4 rounded-3xl flex justify-between items-center mb-3">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-purple-600 rounded-full flex items-center justify-center"><div className="w-2.5 h-2.5 bg-purple-600 rounded-full"></div></div>
            <span className="text-sm font-bold">Cash On Delivery (COD)</span>
          </div>
          <span className="text-[9px] bg-green-100 text-green-700 px-2 py-1 rounded-md font-bold">Recommended</span>
        </div>

        <div className="border border-gray-100 p-4 rounded-3xl flex items-center gap-3 opacity-50">
            <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
            <Smartphone size={20} />
            <span className="text-sm font-bold">UPI / Google Pay</span>
        </div>
      </div>

      {/* PRICE DETAILS */}
      <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm mb-4">
        <h2 className="font-bold text-sm mb-5">Price Details</h2>
        <div className="space-y-3 text-xs font-semibold">
            <div className="flex justify-between text-gray-500"><span>MRP</span><span>₹1499</span></div>
            <div className="flex justify-between text-green-600"><span>Discount</span><span>- ₹400</span></div>
            <div className="flex justify-between text-gray-500"><span>Delivery</span><span className="text-green-600 font-bold">FREE</span></div>
            <div className="border-t border-dashed my-3"></div>
            <div className="flex justify-between text-base font-black text-gray-900 pt-1"><span>Total Payable</span><span>₹1099</span></div>
        </div>
      </div>

      {/* FIXED BUTTON */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 rounded-t-[2rem] shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
        <button onClick={handlePlaceOrder} className="w-full bg-[#3b2bc4] text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-purple-600/30">
          {loading ? "Processing..." : "Place Order (₹1099)"}
        </button>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return <Suspense fallback={<div>Loading...</div>}><CheckoutContent /></Suspense>;
}
