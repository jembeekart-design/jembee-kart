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
import { Package, Loader2, Truck, CheckCircle, AlertCircle } from "lucide-react";

interface Order {
  id: string;
  productTitle?: string;
  productImage?: string;
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
  const [error, setError] = useState<string | null>(null);

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
        (err) => {
          console.error("Firestore Error:", err);
          setError("Failed to load orders. Please try again later.");
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
      case "delivered": return "bg-green-100 text-green-700";
      case "shipped": return "bg-blue-100 text-blue-700";
      case "processing": return "bg-yellow-100 text-yellow-700";
      case "cancelled": return "bg-red-100 text-red-700";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-violet-600" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center text-red-600 flex flex-col items-center">
          <AlertCircle size={40} />
          <p className="mt-2 font-bold">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 pb-20">
      <h1 className="text-2xl font-black text-slate-800 mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-slate-100">
          <Package size={48} className="mx-auto text-slate-300" />
          <h3 className="mt-4 text-lg font-bold text-slate-700">No Orders Found</h3>
          <Link href="/" className="inline-block mt-4 bg-violet-600 text-white px-6 py-3 rounded-xl font-bold">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100">
              <div className="flex gap-4">
                <img src={order.productImage || "/placeholder.png"} alt={order.productTitle} className="w-20 h-20 rounded-2xl object-cover bg-slate-100" />
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800 line-clamp-1">{order.productTitle || "Product"}</h3>
                  <p className="text-xs text-slate-400 mt-1">ID: {order.id.slice(-8)}</p>
                  <p className="text-lg font-black text-violet-700 mt-1">₹{order.amount || 0}</p>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusColor(order.status)}`}>
                  {order.status || "Pending"}
                </span>
                <Link href={`/dashboard/orders/${order.id}`} className="text-xs font-bold text-violet-600 underline">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
