// src/app/payment/page.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  Wallet,
  Landmark,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";

export default function PaymentPage() {
  const router = useRouter();

  const [selectedMethod, setSelectedMethod] = useState("cod");
  const [loading, setLoading] = useState(false);

  async function handlePlaceOrder() {
    try {
      setLoading(true);

      // TODO:
      // Firestore Order Create Logic Here

      setTimeout(() => {
        router.push("/order-success");
      }, 1500);
    } catch (error) {
      console.error(error);
      alert("Order Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[var(--card-color)] border-b border-slate-200 px-4 py-4 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center"
        >
          <ArrowLeft size={18} />
        </button>

        <h1 className="text-xl font-black text-slate-800">
          Payment Method
        </h1>
      </div>

      <div className="p-4 max-w-lg mx-auto space-y-4">

        {/* Order Summary */}
        <div className="bg-[var(--card-color)] rounded-3xl p-5 shadow-sm border border-slate-100">
          <h2 className="text-lg font-black text-slate-800 mb-3">
            Order Summary
          </h2>

          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>₹999</span>
          </div>

          <div className="flex justify-between mt-2">
            <span>Shipping</span>
            <span>₹0</span>
          </div>

          <div className="border-t mt-3 pt-3 flex justify-between font-black text-lg">
            <span>Total</span>
            <span className="text-violet-600">₹999</span>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-[var(--card-color)] rounded-3xl p-5 shadow-sm border border-slate-100">
          <h2 className="text-lg font-black text-slate-800 mb-4">
            Select Payment Method
          </h2>

          {/* COD */}
          <button
            onClick={() => setSelectedMethod("cod")}
            className={`w-full flex items-center justify-between p-4 rounded-2xl border mb-3 ${
              selectedMethod === "cod"
                ? "border-violet-600 bg-violet-50"
                : "border-slate-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <Wallet size={22} />
              <div className="text-left">
                <p className="font-bold">Cash On Delivery</p>
                <p className="text-xs text-slate-500">
                  Pay after delivery
                </p>
              </div>
            </div>

            {selectedMethod === "cod" && (
              <CheckCircle2 className="text-violet-600" />
            )}
          </button>

          {/* UPI */}
          <button
            onClick={() => setSelectedMethod("upi")}
            className={`w-full flex items-center justify-between p-4 rounded-2xl border mb-3 ${
              selectedMethod === "upi"
                ? "border-violet-600 bg-violet-50"
                : "border-slate-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <CreditCard size={22} />
              <div className="text-left">
                <p className="font-bold">UPI Payment</p>
                <p className="text-xs text-slate-500">
                  Google Pay, PhonePe, Paytm
                </p>
              </div>
            </div>

            {selectedMethod === "upi" && (
              <CheckCircle2 className="text-violet-600" />
            )}
          </button>

          {/* Bank */}
          <button
            onClick={() => setSelectedMethod("bank")}
            className={`w-full flex items-center justify-between p-4 rounded-2xl border ${
              selectedMethod === "bank"
                ? "border-violet-600 bg-violet-50"
                : "border-slate-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <Landmark size={22} />
              <div className="text-left">
                <p className="font-bold">Net Banking</p>
                <p className="text-xs text-slate-500">
                  Direct Bank Transfer
                </p>
              </div>
            </div>

            {selectedMethod === "bank" && (
              <CheckCircle2 className="text-violet-600" />
            )}
          </button>
        </div>

        {/* Place Order */}
        <button
          onClick={handlePlaceOrder}
          disabled={loading}
          className="w-full bg-violet-600 text-[var(--button-text-color)] py-5 rounded-3xl font-black text-lg disabled:opacity-50"
        >
          {loading ? "Processing..." : "Place Order"}
        </button>
      </div>
    </main>
  );
}
