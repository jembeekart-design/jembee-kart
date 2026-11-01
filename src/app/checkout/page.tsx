"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth, db } from "@/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { ArrowLeft, MapPin, Loader2, ShieldCheck, CreditCard, Home, Truck, CheckCircle2 } from "lucide-react";


declare global {
  interface Window {
    Cashfree?: (options: { mode: "sandbox" | "production" }) => {
      checkout: (options: { paymentSessionId: string; redirectTarget: "_self" }) => Promise<unknown>;
    };
  }
}

let cashfreeSdkPromise: Promise<void> | null = null;

function loadCashfreeSdk(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("Checkout is unavailable"));
  if (window.Cashfree) return Promise.resolve();
  if (cashfreeSdkPromise) return cashfreeSdkPromise;
  cashfreeSdkPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    script.async = true;
    script.dataset.cashfreeSdk = "true";
    script.onload = () => {
      if (window.Cashfree) resolve();
      else {
        cashfreeSdkPromise = null;
        reject(new Error("Cashfree SDK failed to initialize"));
      }
    };
    script.onerror = () => {
      cashfreeSdkPromise = null;
      script.remove();
      reject(new Error("Unable to load Cashfree checkout"));
    };
    document.head.appendChild(script);
  });
  return cashfreeSdkPromise;
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("productId");
  const selectedSize = searchParams.get("size") || "N/A";
  const selectedColor = searchParams.get("color") || "N/A";

  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "cashfree">("cod");
  const [cashfreeAvailable, setCashfreeAvailable] = useState(false);
  const [cashfreeSandbox, setCashfreeSandbox] = useState(true);
  const [address, setAddress] = useState<any>(null);
  const [product, setProduct] = useState<any>(null);

  useEffect(() => {
    fetch("/api/payments/cashfree/availability", { cache: "no-store" })
      .then((response) => response.json())
      .then((result) => {
        setCashfreeAvailable(result?.enabled === true);
        setCashfreeSandbox(result?.sandboxMode !== false);
      })
      .catch(() => setCashfreeAvailable(false));
  }, []);

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
      alert("Please log in and save your delivery address first.");
      return;
    }

    if (loading) return;

    setLoading(true);

    try {
      // Keep one key for this checkout attempt, including retries.
      const storageKey = `jembeekart_checkout_${user.uid}_${product.id}_${paymentMethod}_${encodeURIComponent(selectedSize)}_${encodeURIComponent(selectedColor)}`;
      let idempotencyKey = sessionStorage.getItem(storageKey);

      if (!idempotencyKey) {
        idempotencyKey =
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `${Date.now()}_${Math.random().toString(36).slice(2)}_${Math.random().toString(36).slice(2)}`;

        sessionStorage.setItem(storageKey, idempotencyKey);
      }

      const idToken = await user.getIdToken();

      const response = await fetch("/api/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: 1,
          paymentMethod,
          selectedSize,
          selectedColor,
          idempotencyKey,
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok || result?.success !== true || !result?.orderId) {
        if (result?.error === "This checkout attempt has ended. Start a new checkout to place another order.") {
          sessionStorage.removeItem(storageKey);
        }
        throw new Error(result?.error || "Order placement failed.");
      }

      if (paymentMethod === "cashfree") {
        const paymentResponse = await fetch("/api/payments/cashfree/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
          body: JSON.stringify({ orderId: result.orderId }),
        });
        const paymentResult = await paymentResponse.json().catch(() => null);
        if (!paymentResponse.ok || paymentResult?.success !== true || typeof paymentResult.paymentSessionId !== "string") {
          throw new Error(paymentResult?.message || "Unable to start online payment. You can retry this checkout.");
        }
        await loadCashfreeSdk();
        if (!window.Cashfree) throw new Error("Cashfree checkout SDK is unavailable.");
        const cashfree = window.Cashfree({ mode: paymentResult.sandboxMode === true ? "sandbox" : "production" });
        await cashfree.checkout({ paymentSessionId: paymentResult.paymentSessionId, redirectTarget: "_self" });
        return;
      }

      router.push(`/payment-success?orderId=${encodeURIComponent(result.orderId)}&orderNumber=${encodeURIComponent(result.orderNumber || "")}`);
    } catch (error) {
      console.error(
        "Order placement failed:",
        error instanceof Error ? error.message : "unknown"
      );
      alert(
        error instanceof Error
          ? error.message
          : "Order placement failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };
  if (dataLoading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="animate-spin text-[var(--color-primary-button)]" /></div>;
  const checkoutPrice = product && typeof product.discountPrice === "number" && product.discountPrice > 0
    ? product.discountPrice
    : Number(product?.price || 0);
  const checkoutDiscount = Math.max(0, Number(product?.price || 0) - checkoutPrice);

  return (
    <main className="min-h-screen bg-[var(--color-page-background)] pb-32 px-4 max-w-lg mx-auto font-sans">
      {/* HEADER */}
      <div className="py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 bg-[var(--color-card-background)] rounded-full shadow-sm"><ArrowLeft size={20} /></button>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Checkout</h1>
            <p className="text-[11px] text-[var(--text-secondary)]">Review your order and place</p>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-[var(--color-card-background)] px-3 py-1.5 rounded-full shadow-sm border border-[var(--color-border)]">
          <ShieldCheck size={14} className="text-[var(--color-primary-button)]" />
          <span className="text-[9px] font-bold text-[var(--text-primary)] uppercase">100% Secure</span>
        </div>
      </div>

      {/* PRODUCT CARD */}
      <div className="bg-[var(--color-card-background)] p-4 rounded-3xl mb-4 shadow-sm border border-[var(--color-border)] flex gap-4 relative">
        <img
  src={product?.images?.[0] || "/placeholder.png"}
  className="w-20 h-20 rounded-2xl object-cover bg-[var(--color-page-background)]"
/>
        <div className="flex-1">
          <h3 className="font-bold text-[var(--text-primary)] text-sm">{product?.title || "Product"}</h3>
          <p className="text-[10px] text-[var(--text-secondary)] font-semibold mt-0.5">Size: {selectedSize} • Color: {selectedColor}</p>
          <div className="bg-[var(--color-success)] text-[var(--color-success)] text-[9px] font-bold px-2 py-0.5 rounded-md w-fit my-1.5">27% OFF</div>
          <div className="flex items-baseline gap-2">
            {checkoutDiscount > 0 && <span className="text-[10px] line-through text-[var(--text-secondary)] font-bold">₹{product?.price || 0}</span>}
            <span className="text-base font-extrabold">₹{checkoutPrice}</span>
          </div>
        </div>
        <div className="absolute top-4 right-4 text-[10px] font-bold bg-[var(--color-page-background)] px-2.5 py-1 rounded-lg">Qty: 1</div>
        <div className="absolute bottom-4 right-4 flex items-center gap-1 text-[9px] text-[var(--color-primary-button)] font-bold">
            <CheckCircle2 size={12}/> 7 Days Return
        </div>
      </div>

      {/* DELIVERY ADDRESS */}
      <div className="bg-[var(--color-card-background)] p-5 rounded-3xl mb-4 shadow-sm border border-[var(--color-border)]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-sm flex items-center gap-2 text-[var(--text-primary)]"><MapPin size={16} className="text-[var(--color-primary-button)]"/> Delivery Address</h2>
          <button className="text-[var(--color-primary-button)] font-bold text-[10px]">Change Address {">"}</button>
        </div>
        <div className="flex gap-4">
          <div className="bg-[var(--color-primary-button)] p-3 rounded-2xl h-fit"><Home size={20} className="text-[var(--color-primary-button)]"/></div>
          <div className="text-xs text-[var(--text-secondary)] leading-relaxed">
            <p className="font-bold text-[var(--text-primary)] text-sm">{address?.fullName || ""}</p>
            <p className="font-semibold text-[var(--text-secondary)] mt-0.5">{address?.mobile || ""}</p>
            <p className="text-[11px] mt-1 pr-4">{[address?.address, address?.landmark, address?.city, address?.state, address?.pincode].filter((value) => typeof value === "string" && value.trim()).join(", ")}</p>
          </div>
        </div>
      </div>

      {/* PAYMENT METHOD */}
      <div className="bg-[var(--color-card-background)] p-5 rounded-3xl mb-4 shadow-sm border border-[var(--color-border)]">
        <h2 className="font-bold text-sm mb-4 text-[var(--text-primary)]"><CreditCard size={16} className="inline mr-2 text-[var(--color-primary-button)]"/> Payment Method</h2>
        <button type="button" onClick={() => setPaymentMethod("cod")} className={`w-full border-2 p-4 rounded-2xl flex justify-between items-center mb-3 ${paymentMethod === "cod" ? "border-[var(--color-primary-button)] bg-[var(--color-primary-button)]" : "border-[var(--color-border)]"}`}>
          <span className="text-sm font-bold">Cash On Delivery (COD)</span>
          <span className="text-[9px] bg-[var(--color-success)] text-[var(--color-success)] px-2 py-1 rounded-md font-bold">Available</span>
        </button>
        <button type="button" disabled={!cashfreeAvailable} onClick={() => setPaymentMethod("cashfree")} className={`w-full border-2 p-4 rounded-2xl flex justify-between items-center disabled:opacity-50 ${paymentMethod === "cashfree" ? "border-[var(--color-primary-button)] bg-[var(--color-primary-button)]" : "border-[var(--color-border)]"}`}>
          <span className="text-sm font-bold">Online Payment (UPI / Cards / Net Banking)</span>
          <span className="text-[9px] bg-[var(--color-page-background)] text-[var(--text-secondary)] px-2 py-1 rounded-md font-bold">{cashfreeAvailable ? (cashfreeSandbox ? "Sandbox" : "Available") : "Disabled"}</span>
        </button>
      </div>

      {/* PRICE DETAILS */}
      <div className="bg-[var(--color-card-background)] p-5 rounded-3xl border border-[var(--color-border)] shadow-sm mb-4">
        <h2 className="font-bold text-sm mb-4 text-[var(--text-primary)]">Price Details</h2>
        <div className="space-y-2.5 text-xs">
            <div className="flex justify-between text-[var(--text-secondary)]"><span>MRP</span><span>₹{product?.price || 0}</span></div>
            <div className="flex justify-between text-[var(--color-success)] font-bold"><span>Discount</span><span>- ₹{checkoutDiscount}</span></div>
            <div className="flex justify-between text-[var(--text-secondary)]"><span>Delivery Charges</span><span className="text-[var(--color-success)] font-bold">FREE</span></div>
            <div className="border-t border-dashed my-2"></div>
            <div className="flex justify-between text-base font-extrabold text-[var(--text-primary)] pt-1"><span>Total Payable</span><span>₹{checkoutPrice}</span></div>
        </div>
        {checkoutDiscount > 0 && <div className="mt-4 bg-[var(--color-success)] text-[var(--color-success)] text-[10px] font-bold p-2.5 rounded-xl text-center">You save ₹{checkoutDiscount} on this order</div>}
      </div>

      {/* EXPECTED DELIVERY */}
      <div className="bg-[var(--color-card-background)] p-4 rounded-3xl border border-[var(--color-border)] shadow-sm mb-28 flex items-center gap-4">
        <div className="bg-[var(--color-warning)] p-3 rounded-2xl"><Truck className="text-[var(--color-warning)]" size={20} /></div>
        <div>
          <p className="text-[9px] font-extrabold text-[var(--text-secondary)] uppercase tracking-widest">Expected Delivery</p>
          <p className="text-sm font-bold text-[var(--text-primary)]">Delivery estimate will be confirmed after order placement.</p>
        </div>
      </div>

      {/* FIXED BUTTON */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[var(--color-card-background)] border-t border-[var(--color-border)] rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
        <button onClick={handlePlaceOrder} disabled={loading || (paymentMethod === "cashfree" && !cashfreeAvailable)} className="w-full bg-[var(--color-primary-button)] text-[var(--button-text-color)] py-4 rounded-2xl font-bold text-lg shadow-lg disabled:opacity-50">
          {loading ? "Processing..." : paymentMethod === "cashfree" ? "Continue to Secure Payment" : "Place Order (COD)"}
        </button>
        <p className="text-center text-[10px] text-[var(--text-secondary)] mt-3 font-semibold">Your information is safe with us</p>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return <Suspense fallback={<div>Loading...</div>}><CheckoutContent /></Suspense>;
}
