"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/firebase/config";
import { doc, getDoc } from "firebase/firestore";

type OrderState = {
  orderNumber: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  manualReviewRequired?: boolean;
};

export default function PaymentSuccessPage() {
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("Jembee Shorts User");
  const [referralCode, setReferralCode] = useState("");
  const [order, setOrder] = useState<OrderState | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setMessage("Please sign in to view your order confirmation.");
        setLoading(false);
        return;
      }

      try {
        const userSnap = await getDoc(doc(db, "users", user.uid));
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setUserName(typeof userData.name === "string" ? userData.name : user.displayName || "Jembee Shorts User");
          setReferralCode(typeof userData.referralCode === "string" ? userData.referralCode : "");
        }

        const returnParams = new URLSearchParams(window.location.search);
        const orderId = returnParams.get("orderId") || returnParams.get("order_id");
        if (!orderId) {
          setMessage("Your order reference is missing. Please check My Orders.");
          return;
        }

        const token = await user.getIdToken();
        const response = await fetch(`/api/orders/${encodeURIComponent(orderId)}/status`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        const result = await response.json().catch(() => null);
        if (!response.ok || result?.success !== true || !result?.order) {
          throw new Error(result?.message || "Unable to verify this order.");
        }
        let verifiedOrder = result.order as OrderState;
        if (verifiedOrder.paymentMethod === "cashfree" && verifiedOrder.paymentStatus !== "paid") {
          const verifyResponse = await fetch(`/api/payments/cashfree/verify?orderId=${encodeURIComponent(orderId)}`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
          });
          const verifyResult = await verifyResponse.json().catch(() => null);
          if (verifyResponse.ok && verifyResult?.success === true && verifyResult.paymentStatus === "paid") {
            verifiedOrder = { ...verifiedOrder, paymentStatus: "paid", status: verifyResult.status || "placed", manualReviewRequired: verifyResult.manualReviewRequired === true };
          }
        }
        setOrder(verifiedOrder);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Unable to verify this order.");
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <main className="min-h-screen flex items-center justify-center"><h1 className="font-bold text-lg">Verifying your order...</h1></main>;
  }

  const paid = order?.paymentStatus === "paid";
  const manualReview = order?.manualReviewRequired === true;
  const codPlaced = order?.paymentMethod === "cod" && order?.status !== "cancelled";
  const title = manualReview ? "Payment Received — Review Required" : paid ? "Payment Successful" : codPlaced ? "Order Placed Successfully" : "Order Status";
  const description = manualReview
    ? "Payment was received after an order cancellation or duplicate payment was detected. Our support team must review this before fulfilment or refund."
    : paid
      ? "Your payment has been verified by our server."
    : codPlaced
      ? "Your Cash on Delivery order has been placed. Payment will be collected at delivery."
      : "Your order has been received. Payment is not confirmed yet; please check your order status.";

  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--color-primary-button)] p-4">
      <div className="w-full max-w-md rounded-[32px] bg-[var(--color-card-background)] p-8 shadow-2xl text-center">
        <div className="text-6xl mb-4">{paid || codPlaced ? "✅" : "ℹ️"}</div>
        <h1 className="text-3xl font-black text-[var(--color-success)]">{title}</h1>
        <p className="mt-4 text-[var(--text-secondary)]">{message || description}</p>

        {order && <div className="mt-6 rounded-2xl border border-[var(--color-border)] p-4 text-left">
          <p className="text-xs font-bold text-[var(--text-secondary)]">ORDER NUMBER</p>
          <p className="mt-1 font-black break-all">{order.orderNumber || "—"}</p>
          <p className="mt-3 text-xs text-[var(--text-secondary)]">Order status: <strong>{order.status}</strong></p>
          <p className="text-xs text-[var(--text-secondary)]">Payment status: <strong>{order.paymentStatus}</strong></p>
        </div>}

        <div className="mt-6 rounded-2xl border border-[var(--color-border)] p-4">
          <p className="text-xs font-bold text-[var(--text-secondary)]">CUSTOMER</p>
          <h2 className="mt-2 text-xl font-black">{userName}</h2>
          {referralCode && <><p className="mt-4 text-xs font-bold text-[var(--text-secondary)]">YOUR REFERRAL CODE</p><p className="mt-1 text-xl font-black break-all">{referralCode}</p></>}
        </div>

        <Link href="/orders" className="mt-6 block w-full rounded-2xl bg-[var(--color-primary-button)] p-4 text-center font-black text-[var(--button-text-color)]">View My Orders</Link>
        <Link href="/" className="mt-3 block text-sm font-bold">Continue Shopping</Link>
      </div>
    </main>
  );
}
