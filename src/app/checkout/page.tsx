"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth, db } from "@/firebase/config";
import { doc, getDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ArrowLeft, MapPin, Loader2, Package } from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("productId");

  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState<any>(null);
  const [product, setProduct] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      if (!auth.currentUser || !productId) return;

      const addrRef = doc(db, "users", auth.currentUser.uid, "addresses", "default");
      const addrSnap = await getDoc(addrRef);
      if (addrSnap.exists()) setAddress(addrSnap.data());

      const prodRef = doc(db, "products", productId);
      const prodSnap = await getDoc(prodRef);
      if (prodSnap.exists()) setProduct({ id: prodSnap.id, ...prodSnap.data() });
    }
    fetchData();
  }, [productId]);

  async function handlePlaceOrder() {
    if (!auth.currentUser || !product || !address) {
      alert("Missing Order Details");
      return;
    }

    setLoading(true);

    const mrp = Number(product.price || 0);
    const finalAmount = Number(product.discountPrice || product.price || 0);
    const discount = mrp - finalAmount;

    try {
      const orderRef = await addDoc(collection(db, "orders"), {
        orderNumber: "JK-" + Date.now(),
        userId: auth.currentUser.uid,
        
        // Snapshots
        productId: product.id,
        productTitle: product.title,
        productImage: product.image || (product.images?.length ? product.images[0] : ""),
        productPrice: mrp,
        productDiscountPrice: finalAmount,
        quantity: 1,

        customerName: auth.currentUser.displayName || "Customer",
        customerEmail: auth.currentUser.email || "",
        customerPhone: address.mobile || "",

        sellerId: product.seller?.id || "default_seller",
        sellerName: product.seller?.name || "JembeeKart Official",

        // Order State & Lifecycle
        status: "placed", 
        paymentMethod: "cod",
        
        // Optimized Flat Timeline & Hooks
        placedAt: serverTimestamp(),
        processingAt: null,
        shippedAt: null,
        deliveredAt: null,
        
        exchangeEligible: true,
        exchangeRequested: false,
        
        // Pricing
        subtotal: mrp,
        discount,
        finalAmount,
        
        // Logistics
        shippingAddress: address,
        
        // MLM / Processing Engine Hooks
        referralEligible: true,
        commissionProcessed: false,
        cashbackProcessed: false,
        rewardProcessed: false,
        
        createdAt: serverTimestamp(),
      });

      router.push(`/payment-success?orderId=${orderRef.id}`);
    } catch (error) {
      console.error("ORDER_PLACEMENT_ERROR:", error);
      alert("Order Placement Failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!product) return <div className="p-10 text-center font-bold">Loading Checkout...</div>;

  return (
    <main className="min-h-screen bg-slate-50 pb-24">
      <div className="sticky top-0 bg-white border-b px-4 py-4 flex items-center gap-4 z-10">
        <button onClick={() => router.back()}><ArrowLeft size={20} /></button>
        <h1 className="text-xl font-black text-slate-900">Checkout</h1>
      </div>

      <div className="p-4 space-y-4 max-w-lg mx-auto">
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
          <h2 className="font-bold flex items-center gap-2 text-slate-700">
            <MapPin size={18} className="text-purple-600"/> Delivery Address
          </h2>
          {address ? (
            <div className="mt-3 text-sm text-slate-600 bg-slate-50 p-3 rounded-2xl">
              <p className="font-bold text-slate-900">{address.fullName}</p>
              <p>{address.mobile}</p>
              <p>{address.address}, {address.city}, {address.pincode}</p>
            </div>
          ) : (
            <button onClick={() => router.push("/address")} className="mt-2 text-purple-600 font-bold text-sm">Add Address</button>
          )}
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
          <h2 className="font-bold mb-3 text-slate-700 flex items-center gap-2">
            <Package size={18} className="text-purple-600"/> Order Summary
          </h2>
          <div className="flex justify-between text-sm py-1">
            <span>{product.title}</span>
            <span className="font-semibold text-slate-900">₹{product.discountPrice}</span>
          </div>
          <hr className="my-3 border-slate-100"/>
          <div className="flex justify-between font-black text-lg text-slate-900">
            <span>Total Payable</span>
            <span>₹{product.discountPrice}</span>
          </div>
        </div>

        <button
          onClick={handlePlaceOrder}
          disabled={loading || !address}
          className="w-full bg-slate-900 text-white rounded-2xl py-4 font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : "Place Order (COD)"}
        </button>
      </div>
    </main>
  );
}
