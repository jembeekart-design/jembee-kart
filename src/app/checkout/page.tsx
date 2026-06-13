"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth, db } from "@/firebase/config";
import { doc, getDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ArrowLeft, MapPin, Loader2, Package, ShieldCheck } from "lucide-react";

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
      if (!user || !productId) {
        setDataLoading(false);
        return;
      }
      try {
        const addrRef = doc(db, "users", user.uid, "addresses", "default");
        const addrSnap = await getDoc(addrRef);
        if (addrSnap.exists()) setAddress(addrSnap.data());

        const prodRef = doc(db, "products", productId);
        const prodSnap = await getDoc(prodRef);
        if (prodSnap.exists()) setProduct({ id: prodSnap.id, ...prodSnap.data() });
      } catch (err) {
        console.error("FETCH_ERROR:", err);
      } finally {
        setDataLoading(false);
      }
    });
    return () => unsubscribe();
  }, [productId]);

  async function handlePlaceOrder() {
    if (!auth.currentUser || !product || !address) {
      alert("Missing details. Please ensure you are logged in and have an address.");
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
        status: "placed",
        paymentMethod: "cod",
        placedAt: serverTimestamp(),
        subtotal: mrp,
        discount,
        finalAmount,
        shippingAddress: address,
        createdAt: serverTimestamp(),
      });
      router.push(`/payment-success?orderId=${orderRef.id}`);
    } catch (error) {
      console.error(error);
      alert("Order Failed.");
    } finally {
      setLoading(false);
    }
  }

  if (dataLoading) return <main className="flex min-h-screen items-center justify-center"><Loader2 className="animate-spin text-purple-600" size={32}/></main>;
  if (!product) return <main className="p-10 text-center font-bold">Product not found. <button onClick={() => router.push("/")} className="text-purple-600">Go Home</button></main>;

  return (
    <main className="min-h-screen bg-[#f8f9fa] pb-24">
      {/* HEADER */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b px-6 py-5 flex items-center gap-4 z-10">
        <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-full"><ArrowLeft size={20} /></button>
        <h1 className="text-xl font-black text-slate-900">Checkout</h1>
      </div>

      <div className="p-4 space-y-6 max-w-lg mx-auto">
        {/* ADDRESS */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <h2 className="font-bold flex items-center gap-2 text-slate-400 text-xs uppercase mb-4"><MapPin size={16}/> Delivery Address</h2>
          {address ? (
            <div className="text-sm text-slate-700 bg-slate-50 p-4 rounded-3xl">
              <p className="font-bold text-slate-900 text-base">{address.fullName}</p>
              <p className="font-medium text-slate-600">{address.mobile}</p>
              <p className="mt-2 text-slate-500">{address.address}, {address.city}, {address.pincode}</p>
            </div>
          ) : (
            <button onClick={() => router.push("/address")} className="w-full py-3 border-2 border-dashed border-purple-200 text-purple-600 font-bold rounded-2xl">+ Add Address</button>
          )}
        </div>

        {/* SUMMARY */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <h2 className="font-bold mb-4 text-slate-400 text-xs uppercase flex items-center gap-2"><Package size={16}/> Order Summary</h2>
          <div className="flex justify-between items-center">
            <p className="font-bold text-slate-900">{product.title}</p>
            <p className="font-black text-slate-900">₹{product.discountPrice}</p>
          </div>
          <hr className="my-4 border-slate-100"/>
          <div className="flex justify-between text-lg font-black text-slate-900">
            <span>Total Payable</span>
            <span>₹{product.discountPrice}</span>
          </div>
        </div>

        {/* PLACE ORDER */}
        <button
          onClick={handlePlaceOrder}
          disabled={loading || !address}
          className="w-full bg-[#7c3aed] text-white rounded-[1.5rem] py-5 font-black text-lg flex items-center justify-center gap-3 hover:bg-[#6d28d9] transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={24} /> : "Place Order (COD)"}
        </button>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return <Suspense fallback={<div>Loading...</div>}><CheckoutContent /></Suspense>;
}
