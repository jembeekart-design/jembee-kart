"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import {
  ArrowLeft,
  Loader2,
  Package,
  Truck,
  CheckCircle,
  Clock,
} from "lucide-react";

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
    if (!params?.id) return;

    async function fetchOrder() {
      try {
        const orderId = Array.isArray(params.id)
          ? params.id[0]
          : params.id;

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

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-700";
      case "shipped":
        return "bg-blue-100 text-blue-700";
      case "processing":
        return "bg-yellow-100 text-yellow-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return <CheckCircle size={18} />;
      case "shipped":
        return <Truck size={18} />;
      default:
        return <Clock size={18} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-violet-600" size={40} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Package size={60} className="text-slate-300" />
        <h2 className="mt-4 text-xl font-bold">Order Not Found</h2>

        <button
          onClick={() => router.push("/orders")}
          className="mt-4 px-5 py-3 rounded-xl bg-violet-600 text-white font-bold"
        >
          Back To Orders
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="sticky top-0 bg-white border-b px-4 py-4 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center"
        >
          <ArrowLeft size={18} />
        </button>

        <h1 className="text-xl font-black">Order Details</h1>
      </div>

      <div className="p-4 space-y-4">
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm">
          <img
            src={order.image || "/placeholder.png"}
            alt={order.productTitle || "Product"}
            className="w-full h-72 object-cover"
          />

          <div className="p-4">
            <h2 className="text-xl font-black">
              {order.productTitle || "Product"}
            </h2>

            <p className="text-3xl font-black text-violet-600 mt-2">
              ₹{order.amount || 0}
            </p>

            <p className="text-slate-500 mt-2">
              Quantity: {order.quantity || 1}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-4 shadow-sm">
          <h3 className="font-black mb-3">Order Status</h3>

          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold ${getStatusColor(
              order.status
            )}`}
          >
            {getStatusIcon(order.status)}
            {order.status || "Pending"}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-4 shadow-sm">
          <h3 className="font-black mb-3">Order Information</h3>

          <p className="text-sm text-slate-500">Order ID</p>
          <p className="font-semibold break-all">{order.id}</p>

          {order.trackingId && (
            <>
              <p className="text-sm text-slate-500 mt-3">Tracking ID</p>
              <p className="font-semibold">{order.trackingId}</p>
            </>
          )}

          {order.createdAt?.toDate && (
            <>
              <p className="text-sm text-slate-500 mt-3">Order Date</p>
              <p className="font-semibold">
                {order.createdAt.toDate().toLocaleDateString("en-IN")}
              </p>
            </>
          )}
        </div>

        <div className="bg-white rounded-3xl p-4 shadow-sm">
          <h3 className="font-black mb-3">Delivery Details</h3>

          <p>{order.customerName || "Customer"}</p>
          <p>{order.mobile || "-"}</p>
          <p>{order.address || "-"}</p>
        </div>
      </div>
    </main>
  );
}
