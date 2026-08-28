"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { ArrowLeft, Truck } from "lucide-react";

export default function TrackOrderPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    getDoc(doc(db, "orders", id as string)).then(snap => {
      if (snap.exists()) setOrder({ id: snap.id, ...snap.data() });
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div className="p-10 text-center font-bold">Loading Tracking Info...</div>;
  if (!order) return <div className="p-10 text-center font-bold">Order not found.</div>;

  const status = order.status?.toLowerCase() || "placed";
  const steps = ['placed', 'processing', 'shipped', 'delivered'];
  const currentStepIndex = steps.indexOf(status);

  return (
    <main className="min-h-screen bg-[var(--color-page-background)] p-4">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="p-2 bg-[var(--color-card-background)] rounded-full border border-[var(--color-border)]"><ArrowLeft size={20}/></button>
        <h1 className="font-black text-xl">Tracking Order #{order.orderNumber}</h1>
      </div>

      <div className="bg-[var(--color-card-background)] p-5 rounded-3xl border border-[var(--color-border)]">
        <h3 className="font-black text-sm mb-4 flex items-center gap-2 text-[var(--color-primary-button)]"><Truck size={16}/> Delivery Status</h3>
        <div className="space-y-4">
          {steps.map((step, i) => (
            <div key={step} className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${i <= currentStepIndex ? 'bg-[var(--color-success)]' : 'bg-[var(--color-card-background)] border border-[var(--color-border)]'}`} />
              <p className={`text-xs font-bold ${i <= currentStepIndex ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                {step.charAt(0).toUpperCase() + step.slice(1)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
