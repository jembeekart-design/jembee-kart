"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth, db } from "@/firebase/config";
import { doc, getDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ArrowLeft, MapPin, Loader2, ShieldCheck, CreditCard, Home, Lock, Truck, ChevronRight } from "lucide-react";

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
      const orderRef = await addDoc(collection(db, "orders"), {
        userId: auth.currentUser?.uid,
        productId: product.id,
        amount: product.discountPrice || product.price,
        status: "pending",
        paymentMethod: "COD",
        createdAt: serverTimestamp(),
      });
      router.push(`/payment-success?orderId=${orderRef.id}`);
    } catch (error) {
      alert("Order Failed");
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="animate-spin text-purple-600" /></div>;

  return (
    <main className="min-h-screen bg-[#f3f4fa] pb-32 px-4 max-w-lg mx-auto font-sans">
      {/* HEADER */}
      <div className="py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()}><ArrowLeft size={24} /></button>
          <div>
            <h1 className="text-xl font-black">Checkout</h1>
            <p className="text-[11px] text-gray-500 font-medium">Review your order and place</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-purple-700">
          <ShieldCheck size={18} />
          <span className="text-[10px] font-bold tracking-tight">100% Secure</span>
        </div>
      </div>

      {/* PRODUCT CARD */}
      <div className="bg-white p-4 rounded-3xl mb-4 border border-gray-100 flex gap-4 shadow-sm">
        <img src={product?.image} className="w-20 h-20 rounded-2xl object-cover bg-gray-100" />
        <div className="flex-1">
          <h3 className="font-bold text-gray-900">{product?.title}</h3>
          <p className="text-xs text-gray-500 font-medium">Size: M • Color: Black</p>
          <div className="bg-green-50 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded w-fit my-1.5">27% OFF</div>
          <div className="flex items-baseline gap-2">
            <span className="text-xs line-through text-gray-400 font-bold">₹{product?.price}</span>
            <span className="text-lg font-black">₹{product?.discountPrice}</span>
          </div>
        </div>
        <div className="text-[10px] font-black self-start bg-gray-50 px-2 py-1 rounded-lg">Qty: 1</div>
      </div>

      {/* DELIVERY ADDRESS */}
      <div className="bg-white p-5 rounded-3xl mb-4 border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-black text-sm flex items-center gap-2"><MapPin size={16} className="text-purple-600"/> Delivery Address</h2>
          <button className="text-purple-600 font-black text-[11px]">Change Address {">"}</button>
        </div>
        <div className="flex gap-3">
          <div className="bg-purple-50 p-3 rounded-2xl h-fit"><Home size={20} className="text-purple-600"/></div>
          <div className="text-sm">
            <p className="font-black text-gray-900">{address?.fullName || "Md Alim Ansari"}</p>
            <p className="text-xs text-gray-500 font-bold">{address?.mobile || "7061369212"}</p>
            <p className="text-[11px] text-gray-500 leading-tight mt-1">{address?.address || "Purelia road no 12 mango Jamshedpur"}</p>
          </div>
        </div>
      </div>

      {/* PAYMENT METHOD */}
      <div className="bg-white p-5 rounded-3xl mb-4 border border-gray-100 shadow-sm">
        <h2 className="font-black text-sm mb-4"><CreditCard size={16} className="inline mr-2 text-purple-600"/> Payment Method</h2>
        <div className="border-2 border-purple-600 bg-purple-50 p-4 rounded-2xl flex justify-between items-center mb-3">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-purple-600 rounded-full flex items-center justify-center"><div className="w-2 h-2 bg-purple-600 rounded-full"></div></div>
            <span className="text-sm font-black">Cash On Delivery (COD)</span>
          </div>
          <span className="text-[9px] bg-green-100 text-green-700 px-2 py-1 rounded-md font-black">Recommended</span>
        </div>
        <div className="border border-gray-100 p-4 rounded-2xl flex justify-between items-center opacity-60">
            <span className="text-sm font-black">UPI / PhonePe</span>
            <span className="text-[9px] bg-gray-100 text-gray-500 px-2 py-1 rounded-md font-black">Coming Soon</span>
        </div>
      </div>

      {/* PRICE DETAILS */}
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm mb-4">
        <h2 className="font-black text-sm mb-3">Price Details</h2>
        <div className="flex justify-between text-xs font-bold text-gray-500 py-1"><span>MRP</span><span>₹{product?.price}</span></div>
        <div className="flex justify-between text-xs font-black text-green-600 py-1"><span>Discount</span><span>- ₹{product?.price - product?.discountPrice}</span></div>
        <div className="flex justify-between text-xs font-bold text-gray-500 py-1"><span>Delivery Charges</span><span className="text-green-600 font-black">FREE</span></div>
        <hr className="my-3 border-dashed" />
        <div className="flex justify-between text-base font-black"><span>Total Payable</span><span>₹{product?.discountPrice}</span></div>
      </div>

      {/* EXPECTED DELIVERY */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm mb-28 flex items-center gap-4">
        <div className="bg-orange-50 p-3 rounded-2xl"><Truck className="text-orange-500" size={20} /></div>
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase">Expected Delivery</p>
          <p className="text-sm font-black text-gray-900">Between 24 - 26 May 2025</p>
        </div>
      </div>

      {/* FIXED BUTTON */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
        <button onClick={handlePlaceOrder} className="w-full bg-[#3b2bc4] text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-purple-600/30">
          {loading ? "Processing..." : "Place Order (COD)"}
        </button>
        <p className="text-center text-[10px] text-gray-400 mt-3 font-bold">Your information is safe with us</p>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return <Suspense fallback={<div>Loading...</div>}><CheckoutContent /></Suspense>;
}
