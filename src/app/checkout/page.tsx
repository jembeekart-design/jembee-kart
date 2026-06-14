"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth, db } from "@/firebase/config";
import { doc, getDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ArrowLeft, MapPin, Loader2, ShieldCheck, CreditCard, Home, Truck, CheckCircle2 } from "lucide-react";

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
  const user = auth.currentUser;

  if (!user || !product || !address) {
  alert(`
USER = ${!!user}
PRODUCT = ${!!product}
ADDRESS = ${!!address}

productId = ${productId}
`);
  return;
}

  setLoading(true);

  try {
    const orderNumber = `JK-${Date.now()}`;

    await addDoc(collection(db, "orders"), {
      orderNumber,

      userId: user.uid,

      customerName: address.fullName,
      customerPhone: address.mobile,

      shippingAddress: address,

      productId: product.id,
      productTitle: product.title,
      productImage: product.image,

      productPrice: 1599,
      productDiscountPrice: 1099,

      quantity: 1,

      subtotal: 1599,
      discount: 500,
      finalAmount: 1099,

      paymentMethod: "cod",

      status: "placed",

      referralEligible: true,
      cashbackProcessed: false,
      commissionProcessed: false,
      rewardProcessed: false,

      exchangeEligible: true,
      exchangeRequested: false,

      placedAt: serverTimestamp(),
      createdAt: serverTimestamp(),

      sellerId: "default_seller",
      sellerName: "JembeeKart Official",
    });

    router.push("/payment-success");
  } catch (error) {
    console.error(error);
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
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 bg-white rounded-full shadow-sm"><ArrowLeft size={20} /></button>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Checkout</h1>
            <p className="text-[11px] text-gray-400">Review your order and place</p>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-100">
          <ShieldCheck size={14} className="text-purple-600" />
          <span className="text-[9px] font-bold text-gray-700 uppercase">100% Secure</span>
        </div>
      </div>

      {/* PRODUCT CARD */}
      <div className="bg-white p-4 rounded-3xl mb-4 shadow-sm border border-gray-50 flex gap-4 relative">
        <img src={product?.image} className="w-20 h-20 rounded-2xl object-cover bg-gray-100" />
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 text-sm">{product?.title || "T Shirt"}</h3>
          <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Size: M • Color: Black</p>
          <div className="bg-green-50 text-green-600 text-[9px] font-bold px-2 py-0.5 rounded-md w-fit my-1.5">27% OFF</div>
          <div className="flex items-baseline gap-2">
            <span className="text-[10px] line-through text-gray-400 font-bold">₹1499</span>
            <span className="text-base font-extrabold">₹1099</span>
          </div>
        </div>
        <div className="absolute top-4 right-4 text-[10px] font-bold bg-gray-50 px-2.5 py-1 rounded-lg">Qty: 1</div>
        <div className="absolute bottom-4 right-4 flex items-center gap-1 text-[9px] text-purple-600 font-bold">
            <CheckCircle2 size={12}/> 7 Days Return
        </div>
      </div>

      {/* DELIVERY ADDRESS */}
      <div className="bg-white p-5 rounded-3xl mb-4 shadow-sm border border-gray-50">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-sm flex items-center gap-2 text-gray-800"><MapPin size={16} className="text-purple-600"/> Delivery Address</h2>
          <button className="text-purple-600 font-bold text-[10px]">Change Address {">"}</button>
        </div>
        <div className="flex gap-4">
          <div className="bg-purple-50 p-3 rounded-2xl h-fit"><Home size={20} className="text-purple-600"/></div>
          <div className="text-xs text-gray-600 leading-relaxed">
            <p className="font-bold text-gray-900 text-sm">{address?.fullName || "Md Alim Ansari"}</p>
            <p className="font-semibold text-gray-500 mt-0.5">{address?.mobile || "7061369212"}</p>
            <p className="text-[11px] mt-1 pr-4">Purelia road no 12 mango Jamshedpur, Petrol pump, EAST SINGHBUM, 831012</p>
          </div>
        </div>
      </div>

      {/* PAYMENT METHOD */}
      <div className="bg-white p-5 rounded-3xl mb-4 shadow-sm border border-gray-50">
        <h2 className="font-bold text-sm mb-4 text-gray-800"><CreditCard size={16} className="inline mr-2 text-purple-600"/> Payment Method</h2>
        <div className="border-2 border-purple-600 bg-purple-50 p-4 rounded-2xl flex justify-between items-center mb-3">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-purple-600 rounded-full flex items-center justify-center"><div className="w-2.5 h-2.5 bg-purple-600 rounded-full"></div></div>
            <span className="text-sm font-bold">Cash On Delivery (COD)</span>
          </div>
          <span className="text-[9px] bg-green-100 text-green-700 px-2 py-1 rounded-md font-bold">Recommended</span>
        </div>
        <div className="border border-gray-100 p-4 rounded-2xl flex justify-between items-center opacity-50">
            <span className="text-sm font-bold">UPI / Google Pay</span>
            <span className="text-[9px] bg-gray-100 text-gray-500 px-2 py-1 rounded-md font-bold">Coming Soon</span>
        </div>
      </div>

      {/* PRICE DETAILS */}
      <div className="bg-white p-5 rounded-3xl border border-gray-50 shadow-sm mb-4">
        <h2 className="font-bold text-sm mb-4 text-gray-800">Price Details</h2>
        <div className="space-y-2.5 text-xs">
            <div className="flex justify-between text-gray-500"><span>MRP</span><span>₹1499</span></div>
            <div className="flex justify-between text-green-600 font-bold"><span>Discount</span><span>- ₹400</span></div>
            <div className="flex justify-between text-gray-500"><span>Delivery Charges</span><span className="text-green-600 font-bold">FREE</span></div>
            <div className="border-t border-dashed my-2"></div>
            <div className="flex justify-between text-base font-extrabold text-gray-900 pt-1"><span>Total Payable</span><span>₹1099</span></div>
        </div>
        <div className="mt-4 bg-green-50 text-green-600 text-[10px] font-bold p-2.5 rounded-xl text-center">You save ₹400 on this order</div>
      </div>

      {/* EXPECTED DELIVERY */}
      <div className="bg-white p-4 rounded-3xl border border-gray-50 shadow-sm mb-28 flex items-center gap-4">
        <div className="bg-orange-50 p-3 rounded-2xl"><Truck className="text-orange-500" size={20} /></div>
        <div>
          <p className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest">Expected Delivery</p>
          <p className="text-sm font-bold text-gray-900">Between 24 - 26 May 2025</p>
        </div>
      </div>

      {/* FIXED BUTTON */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
        <button onClick={handlePlaceOrder} className="w-full bg-[#3b2bc4] text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-purple-600/30">
          {loading ? "Processing..." : "Place Order (COD)"}
        </button>
        <p className="text-center text-[10px] text-gray-400 mt-3 font-semibold">Your information is safe with us</p>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return <Suspense fallback={<div>Loading...</div>}><CheckoutContent /></Suspense>;
}
