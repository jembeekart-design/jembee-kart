"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, getFirestore } from "firebase/firestore"; // Import getFirestore
import { app } from "@/firebase/config"; // Import 'app' instead of 'db'
import {
  ArrowLeft,
  Loader2,
  Package,
  Truck,
  CheckCircle,
  Clock,
} from "lucide-react";

// Initialize db locally to ensure types match
const db = getFirestore(app);

interface Order {
  id: string;
  productTitle?: string;
  image?: string;
  amount?: number;
  quantity?: number;
  status?: string;
  trackingId?: string;
  customerName?: string;
  address?: string;
  mobile?: string;
  createdAt?: any;
}

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // params.id ko string mein convert karne ka safe tareeka
    const id = params?.id;
    if (!id) {
      setLoading(false);
      return;
    }

    const orderId = Array.isArray(id) ? id[0] : id;

    async function fetchOrder() {
      try {
        const orderRef = doc(db, "orders", orderId);
        const orderSnap = await getDoc(orderRef);

        if (orderSnap.exists()) {
          setOrder({
            id: orderSnap.id,
            ...(orderSnap.data() as any),
          });
        }
      } catch (error) {
        console.error("ORDER_DETAILS_ERROR:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [params]);

  // ... (Baaki functions getStatusColor aur getStatusIcon waise hi rahenge)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-violet-600" size={40} />
      </div>
    );
  }

  // ... (Baaki UI code waisa hi rahega)
