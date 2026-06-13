"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth, db } from "@/firebase/config";
import { doc, getDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ArrowLeft, MapPin, Loader2, Package, ShieldCheck, Home, CreditCard, ChevronRight, Lock } from "lucide-react";

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

  if (dataLoading) return <main className="flex min-h-screen items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-purple-600" size={32}/></main>;
  if (!product) return <main className="p-10 text-center font-bold">Product not found. <button onClick={() => router.push("/")} className="text-purple-600">Go Home</button></main>;

  const mrp = Number(product.price || 0);
  const finalAmount = Number(product.discountPrice || product.price || 0);
  const discountAmount = mrp - finalAmount;
  const discountPercentage = mrp > 0 ? Math.round((discountAmount / mrp) * 100) : 0;
  const productImage = product.image || (product.images?.length ? product.images[0] : "");

  return (
    <main className="min-h-screen bg-[#edeef7] bg-gradient-to-b from-[#f3f3fa] via-[#e5e6f5] to-[#f4f3fb] pb-12 font-sans antialiased text-slate-800">
      
      {/* HEADER */}
      <div className="max-w-xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1 hover:bg-slate-200/50 rounded-full transition">
            <ArrowLeft size={24} className="text-slate-900" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Checkout</h1>
            <p className="text-xs text-slate-500 font-medium">Review your order and place</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-right">
          <div className="bg-purple-100 p-1.5 rounded-xl text-purple-700">
            <ShieldCheck size={18} />
          </div>
          <div className="text-left">
            <p className="text-[11px] font-black text-purple-700 leading-none">100% Secure</p>
            <p className="text-[9px] text-slate-400 font-bold">Safe & Encrypted</p>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-4 max-w-xl mx-auto">
        
        {/* PRODUCT CARD */}
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex gap-4 relative">
          <div className="w-24 h-24 bg-slate-50 rounded-2xl overflow-hidden flex-shrink-0 border border-slate-100">
            <img src={productImage} alt={product.title} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 space-y-1">
            <h3 className="font-extrabold text-slate-900 text-lg leading-tight line-clamp-1">{product.title}</h3>
            <p className="text-xs text-slate-400 font-bold">Size: M  •  Color: Black</p>
            {discountPercentage > 0 && (
              <span className="inline-block bg-green-100 text-green-700 text-[11px] px-2 py-0.5 rounded-md font-black">
                {discountPercentage}% OFF
              </span>
            )}
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-sm text-slate-400 line-through font-bold">₹{mrp}</span>
              <span className="text-xl font-black text-slate-900">₹{finalAmount}</span>
            </div>
          </div>
          <div className="absolute top-4 right-4 bg-slate-100 text-slate-800 text-xs font-black px-3 py-1.5 rounded-xl border border-slate-200/40">
            Qty: 1
          </div>
          <div className="absolute bottom-4 right-4 flex items-center gap-1 text-[11px] text-slate-500 bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg font-bold">
            <span className="text-purple-600">✓</span> 7 Days Easy Return
          </div>
        </div>

        {/* DELIVERY ADDRESS */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-black text-slate-900 flex items-center gap-2 text-base">
              <span className="bg-purple-600 text-white p-1.5 rounded-xl"><MapPin size={16}/></span>
              Delivery Address
            </h2>
            <button onClick={() => router.push("/address")} className="text-purple-600 font-black text-xs flex items-center gap-0.5">
              Change Address <ChevronRight size={14} />
            </button>
          </div>
          
          {address ? (
            <div className="flex gap-4 items-start">
              <div className="bg-purple-50 p-4 rounded-2xl text-purple-600 border border-purple-100/50">
                <Home size={22} />
              </div>
              <div className="text-sm text-slate-600 space-y-0.5 flex-1">
                <p className="font-black text-slate-950 text-base">{address.fullName}</p>
                <p className="font-bold text-slate-700">{address.mobile}</p>
                <p className="text-slate-500 leading-relaxed font-medium">
                  {address.address}, {address.city}, {address.pincode}
                </p>
              </div>
            </div>
          ) : (
            <button onClick={() => router.push("/address")} className="w-full py-3 border-2 border-dashed border-purple-200 text-purple-600 font-bold rounded-2xl hover:bg-purple-50 transition-all">
              + Add Address Details
            </button>
          )}
        </div>

        {/* PAYMENT METHOD */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-4">
          <h2 className="font-black text-slate-900 flex items-center gap-2 text-base">
            <span className="bg-purple-600 text-white p-1.5 rounded-xl">
              <CreditCard size={16}/>
            </span>
            Payment Method
          </h2>

          {/* COD Option - Selected */}
          <div className="border-[1.5px] border-purple-600 bg-purple-50/40 p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full border-4 border-purple-600 bg-white flex items-center justify-center" />
              <div className="bg-purple-100 text-purple-700 p-1.5 rounded-xl font-bold text-xs">₹</div>
              <div>
                <p className="font-black text-slate-900 text-sm">Cash On Delivery (COD)</p>
                <p className="text-[11px] text-slate-400 font-bold">Pay when your order is delivered</p>
              </div>
            </div>
            <span className="bg-green-100 text-green-700 text-[10px] font-extrabold px-2 py-0.5 rounded-md">
              Recommended
            </span>
          </div>

          {/* UPI Option - Coming Soon */}
          <div className="opacity-50 p-4 rounded-2xl flex items-center justify-between border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full border-2 border-slate-300 bg-white" />
              <span className="font-black text-slate-400 italic text-sm tracking-tighter">UPI</span>
              <p className="font-bold text-slate-500 text-sm pl-2">UPI / Google Pay / PhonePe</p>
            </div>
            <span className="bg-slate-100 text-slate-500 text-[9px] font-bold px-2 py-0.5 rounded-md">
              Coming Soon
            </span>
          </div>

          {/* Card Option - Coming Soon */}
          <div className="opacity-50 p-4 rounded-2xl flex items-center justify-between border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full border-2 border-slate-300 bg-white" />
              <div className="text-slate-400"><CreditCard size={18}/></div>
              <p className="font-bold text-slate-500 text-sm">Credit / Debit Card / Net Banking</p>
            </div>
            <span className="bg-slate-100 text-slate-500 text-[9px] font-bold px-2 py-0.5 rounded-md">
              Coming Soon
            </span>
          </div>
        </div>

        {/* PRICE DETAILS */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-3">
          <h2 className="font-black text-slate-900 text-base mb-2">Price Details</h2>
          
          <div className="flex justify-between text-sm font-bold text-slate-600">
            <span>MRP</span>
            <span className="text-slate-900">₹{mrp}</span>
          </div>

          {discountAmount > 0 && (
            <div className="flex justify-between text-sm font-bold text-green-600">
              <span>Discount</span>
              <span>- ₹{discountAmount}</span>
            </div>
          )}

          <div className="flex justify-between text-sm font-bold text-slate-600">
            <span>Delivery Charges</span>
            <span className="text-green-600 font-extrabold">FREE</span>
          </div>

          <hr className="border-dashed border-slate-200 my-2" />

          <div className="flex justify-between items-center pt-1">
            <span className="text-lg font-black text-slate-900">Total Payable</span>
            <span className="text-2xl font-black text-slate-900">₹{finalAmount}</span>
          </div>

          {discountAmount > 0 && (
            <div className="text-xs text-green-600 font-extrabold flex items-center gap-1 bg-green-50/50 p-2 rounded-xl border border-green-100/30">
              <span>🏷️</span> You save ₹{discountAmount} on this order
            </div>
          )}
        </div>

        {/* EXPECTED DELIVERY STATUS */}
        <div className="bg-purple-100/60 border border-purple-200/50 p-4 rounded-2xl flex items-center gap-4">
          <div className="text-2xl">🚚</div>
          <div>
            <p className="text-xs font-bold text-purple-700 uppercase tracking-wider">Expected Delivery</p>
            <p className="text-sm font-black text-slate-900">Between 2-3 Days</p>
          </div>
        </div>

        {/* ACTION BUTTON */}
        <div className="pt-2">
          <button
            onClick={handlePlaceOrder}
            disabled={loading || !address}
            className="w-full bg-[#3b2bc4] hover:bg-[#3122a3] text-white rounded-2xl py-4.5 font-black text-lg flex items-center justify-center gap-2 shadow-xl shadow-purple-600/20 active:scale-[0.99] transition-all disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={22} />
            ) : (
              <>
                <Lock size={18} className="opacity-90" />
                Place Order (COD)
              </>
            )}
          </button>
          
          <p className="text-center text-[11px] text-slate-400 font-bold mt-3 flex items-center justify-center gap-1 uppercase tracking-wider">
            🛡️ Your information is safe with us
          </p>
        </div>

      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center font-bold text-purple-600">Loading Checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
