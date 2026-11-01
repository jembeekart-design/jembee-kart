"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useParams, useRouter } from "next/navigation";
import { auth } from "@/firebase/config";
import { ArrowLeft, Truck } from "lucide-react";

type CustomerOrder = {
  id: string;
  orderNumber: string;
  status: string;
};

export default function TrackOrderPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setLoadError("Order reference is missing.");
      return;
    }

    let active = true;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!active) return;
      if (!user) {
        setLoadError("Please sign in to view tracking information.");
        setOrder(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const token = await user.getIdToken();
        const response = await fetch(`/api/orders/${encodeURIComponent(String(id))}`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        const result = await response.json().catch(() => null);
        if (!response.ok || result?.success !== true || !result.order) {
          throw new Error(result?.message || "Unable to load tracking information.");
        }
        if (active) {
          setOrder({
            id: String(result.order.id || id),
            orderNumber: typeof result.order.orderNumber === "string" ? result.order.orderNumber : "",
            status: typeof result.order.status === "string" ? result.order.status : "placed",
          });
          setLoadError("");
        }
      } catch (error) {
        if (active) {
          setOrder(null);
          setLoadError(error instanceof Error ? error.message : "Unable to load tracking information.");
        }
      } finally {
        if (active) setLoading(false);
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [id]);

  if (loading) return <div className="p-10 text-center font-bold">Loading Tracking Info...</div>;
  if (!order) return (
    <div className="p-10 text-center space-y-3">
      <p className="font-bold">{loadError || "Order not found."}</p>
      <button onClick={() => router.push("/orders")} className="underline">Back to Orders</button>
    </div>
  );

  const status = order.status?.toLowerCase() || "placed";
  const steps = ["placed", "processing", "shipped", "delivered"];
  const currentStepIndex = steps.indexOf(status);

  return (
    <main className="min-h-screen bg-[var(--color-page-background)] p-4">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="p-2 bg-[var(--color-card-background)] rounded-full border border-[var(--color-border)]"><ArrowLeft size={20}/></button>
        <h1 className="font-black text-xl">Tracking Order #{order.orderNumber || order.id}</h1>
      </div>

      <div className="bg-[var(--color-card-background)] p-5 rounded-3xl border border-[var(--color-border)]">
        <h3 className="font-black text-sm mb-4 flex items-center gap-2 text-[var(--color-primary-button)]"><Truck size={16}/> Delivery Status</h3>
        {status === "cancelled" ? (
          <p className="text-sm font-bold text-[var(--color-danger)]">This order has been cancelled.</p>
        ) : (
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={step} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${index <= currentStepIndex ? "bg-[var(--color-success)]" : "bg-[var(--color-card-background)] border border-[var(--color-border)]"}`} />
                <p className={`text-xs font-bold ${index <= currentStepIndex ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}`}>
                  {step.charAt(0).toUpperCase() + step.slice(1)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
