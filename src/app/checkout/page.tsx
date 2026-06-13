"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth, db } from "@/firebase/config";
import { doc, getDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ArrowLeft, MapPin, Loader2, ShieldCheck, CreditCard, Home, Lock } from "lucide-react";

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

  // FIX: Proper handlePlaceOrder with redirection
  const handlePlaceOrder = async () => {
    if (!product) return;
    setLoading(true);
    try {
      const orderRef = await addDoc(collection(db, "orders"), {
        userId: auth.currentUser?.uid,
        productId: product.id,
        productTitle: product.title,
        amount: product.discountPrice || product.price,
        status: "pending",
        paymentMethod: "COD",
        createdAt: serverTimestamp(),
      });
      
      // Success redirection
      router.push(`/payment-success?orderId=${orderRef.id}`);
    } catch (error) {
      console.error("Order error:", error);
      alert("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="animate-spin text-purple-600" size={32} /></div>;

  return (
    <main className="min-h-screen bg-[#f3f4fa] pb-32 px-4 max-w-lg mx-auto font-sans">
      {/* HEADER */}
      <div className="py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()}><ArrowLeft size={24} className="text-gray-900" /></button>
          <div>
            <h1 className="text-xl font-bold">Checkout</h1>
          </div>
        </div>
        <div className="flex items-center gap-1 text-purple-700">
          <ShieldCheck size={18} />
          <span className="text-xs font-bold">100% Secure</span>
        </div>
      </div>

      {/* PRODUCT CARD */}
      <div className="bg-white p-4 rounded-2xl mb-4 border flex gap-4 shadow-sm">
        <img src={product?.image} className="w-20 h-20 rounded-xl object-cover bg-gray-100" />
        <div className="flex-1">
          <h3 className="font-bold text-gray-900">{product?.title}</h3>
          <p className="text-xs text-gray-500">Size: M • Color: Black</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xs line-through text-gray-400">₹{product?.price}</span>
            <span className="text-lg font-bold">₹{product?.discountPrice || product?.price}</span>
          </div>
        </div>
      </div>

      {/* DELIVERY ADDRESS */}
      <div className="bg-white p-5 rounded-2xl mb-4 border shadow-sm">
        <h2 className="font-bold text-sm mb-3 flex items-center gap-2"><MapPin size={16} className="text-purple-600"/> Delivery Address</h2>
        <div className="flex gap-3">
          <div className="bg-purple-50 p-3 rounded-xl h-fit"><Home size={20} className="text-purple-600"/></div>
          <div className="text-sm">
            <p className="font-bold">{address?.fullName || "User Name"}</p>
            <p className="text-xs text-gray-500">{address?.address || "Address not set"}</p>
          </div>
        </div>
      </div>

      {/* PAYMENT METHOD */}
      <div className="bg-white p-5 rounded-2xl mb-4 border shadow-sm">
        <h2 className="font-bold text-sm mb-4">Payment Method</h2>
        <div className="border border-purple-600 bg-purple-50 p-3 rounded-xl flex justify-between items-center">
          <span className="text-sm font-bold">Cash On Delivery (COD)</span>
          <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded font-bold">Selected</span>
        </div>
      </div>

      {/* PRICE DETAILS */}
      <div className="bg-white p-5 rounded-2xl border shadow-sm mb-4">
        <h2 className="font-bold text-sm mb-3">Price Details</h2>
        <div className="flex justify-between text-sm py-1"><span>Total Payable</span><span className="font-bold">₹{product?.discountPrice || product?.price}</span></div>
      </div>

      {/* FIXED BUTTON */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t rounded-t-3xl">
        <button 
          onClick={handlePlaceOrder} 
          disabled={loading}
          className="w-full bg-purple-700 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" size={20}/> : <><Lock size={18}/> Place Order (COD)</>}
        </button>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return <Suspense fallback={<div>Loading...</div>}><CheckoutContent /></Suspense>;
}
