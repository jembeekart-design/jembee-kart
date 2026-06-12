"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  where,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";

import { auth, db } from "@/firebase/config";
import { Package, Loader2, AlertCircle } from "lucide-react";

interface Order {
  id: string;
  productTitle?: string;
  image?: string;
  amount?: number;
  quantity?: number;
  status?: string;
  trackingId?: string;
  createdAt?: Timestamp;
  userId?: string;
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let unsubscribeOrders: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setOrders([]);
        setLoading(false);
        return;
      }

      const q = query(
        collection(db, "orders"),
        where("userId", "==", user.uid)
      );

      unsubscribeOrders = onSnapshot(
        q,
        (snapshot) => {
          const data: Order[] = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<Order, "id">),
          }));

          data.sort((a, b) => {
            const aTime = a.createdAt?.toMillis?.() || 0;
            const bTime = b.createdAt?.toMillis?.() || 0;
            return bTime - aTime;
          });

          setOrders(data);
          setLoading(false);
        },
        (err) => {
          console.error(err);
          setError(err.message);
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

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="animate-spin text-violet-600" size={40} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <AlertCircle className="text-red-500" size={50} />
        <p className="mt-3 font-bold">{error}</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 pb-20">
      <h1 className="text-3xl font-black text-slate-800">
        My Orders
      </h1>

      <p className="text-slate-500 mb-6">
        Total Orders: {orders.length}
      </p>

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center shadow">
          <Package size={50} className="mx-auto text-slate-300" />

          <h3 className="mt-4 text-xl font-bold">
            No Orders Found
          </h3>

          <Link
            href="/"
            className="inline-block mt-5 bg-violet-600 text-white px-6 py-3 rounded-xl font-bold"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-3xl p-4 shadow border"
            >
              <div className="flex gap-4">
                <img
                  src={order.image || "/placeholder.png"}
                  alt={order.productTitle || "Product"}
                  className="w-24 h-24 rounded-2xl object-cover bg-slate-100"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.png";
                  }}
                />

                <div className="flex-1">
                  <h3 className="font-bold text-lg">
                    {order.productTitle}
                  </h3>

                  <p className="text-xs text-slate-500">
                    Order ID: {order.id}
                  </p>

                  <p className="text-lg font-black text-violet-600 mt-2">
                    ₹{order.amount || 0}
                  </p>

                  <p className="text-sm text-slate-500">
                    Qty: {order.quantity || 1}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex justify-between items-center">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(
                    order.status
                  )}`}
                >
                  {order.status || "Pending"}
                </span>

                <Link
                  href={`/account/orders/${order.id}`}
                  className="text-violet-600 font-bold"
                >
                  View Details →
                </Link>
              </div>

              {order.trackingId && (
                <div className="mt-3 bg-slate-100 rounded-xl p-3">
                  <p className="text-xs text-slate-500">
                    Tracking ID
                  </p>

                  <p className="font-bold">
                    {order.trackingId}
                  </p>
                </div>
              )}

              {order.createdAt && (
                <p className="mt-3 text-xs text-slate-400">
                  Ordered on{" "}
                  {order.createdAt.toDate().toLocaleDateString(
                    "en-IN"
                  )}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
