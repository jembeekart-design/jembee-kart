"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";

import { auth, db } from "@/firebase/config";
import { Package, Loader2, Truck, CheckCircle } from "lucide-react";

interface Order {
  id: string;
  productTitle?: string;
  productImage?: string;
  amount?: number;
  quantity?: number;
  status?: string;
  trackingId?: string;
  createdAt?: Timestamp;
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeOrders: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setOrders([]);
        setLoading(false);
        return;
      }

      const ordersRef = collection(db, "orders");

      const q = query(
        ordersRef,
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );

      unsubscribeOrders = onSnapshot(
        q,
        (snapshot) => {
          const data: Order[] = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<Order, "id">),
          }));

          setOrders(data);
          setLoading(false);
        },
        (error) => {
          console.error("ORDER_FETCH_ERROR:", error);
          setLoading(false);
        }
      );
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeOrders) unsubscribeOrders();
    };
  }, []);

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
        return <CheckCircle size={14} />;
      case "shipped":
        return <Truck size={14} />;
      default:
        return <Package size={14} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-violet-600" size={30} />
          <p className="text-sm font-semibold text-slate-500">
            Loading Orders...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-800">
          My Orders
        </h1>

        <p className="text-sm text-slate-500">
          Total Orders: {orders.length}
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center shadow-sm">
          <Package size={48} className="mx-auto text-slate-300" />

          <h3 className="mt-4 text-lg font-bold text-slate-700">
            No Orders Found
          </h3>

          <p className="text-sm text-slate-500 mt-2">
            Your placed orders will appear here.
          </p>

          <Link
            href="/"
            className="inline-block mt-4 bg-violet-600 text-white px-5 py-3 rounded-xl font-bold"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100"
            >
              <div className="flex gap-4">
                <img
                  src={
                    order.productImage ||
                    "/placeholder-product.png"
                  }
                  alt={order.productTitle}
                  className="w-24 h-24 rounded-2xl object-cover bg-slate-100"
                />

                <div className="flex-1">
                  <h3 className="font-black text-slate-800 line-clamp-2">
                    {order.productTitle || "Product"}
                  </h3>

                  <p className="text-sm text-slate-500 mt-1">
                    Order ID: #{order.id}
                  </p>

                  <p className="text-sm font-bold text-slate-700 mt-1">
                    Qty: {order.quantity || 1}
                  </p>

                  <p className="text-lg font-black text-violet-700 mt-2">
                    ₹{order.amount || 0}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div
                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(
                    order.status
                  )}`}
                >
                  {getStatusIcon(order.status)}
                  {order.status || "Pending"}
                </div>

                <Link
                  href={`/dashboard/orders/${order.id}`}
                  className="text-violet-700 text-sm font-bold"
                >
                  View Details →
                </Link>
              </div>

              {order.trackingId && (
                <div className="mt-3 bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500">
                    Tracking ID
                  </p>

                  <p className="font-bold text-slate-700">
                    {order.trackingId}
                  </p>
                </div>
              )}

              {order.createdAt && (
                <p className="mt-3 text-xs text-slate-400">
                  Ordered on{" "}
                  {order.createdAt
                    .toDate()
                    .toLocaleDateString("en-IN")}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
