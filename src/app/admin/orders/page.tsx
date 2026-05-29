"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  updateDoc,
} from "firebase/firestore";

import {
  Package,
  Truck,
  CheckCircle2,
  Trash2,
  Clock3
} from "lucide-react";

import { db } from "@/firebase/config";

interface Order {
  id: string;
  userId: string; 
  customerName: string;
  productTitle: string;
  amount: number;
  status: string;
  address: string;
  image: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      const snapshot = await getDocs(collection(db, "orders"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];

      setOrders(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  /* ======================================================
  UPDATE STATUS WITH NAME-BASED REFERRAL GENERATION
  ====================================================== */
  async function updateStatus(id: string, status: string) {
    try {
      // 1. Update Order Status in Orders Collection
      const orderRef = doc(db, "orders", id);
      await updateDoc(orderRef, { status });

      // Local state update helper
      setOrders((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status } : item))
      );

      // 2. MLM Activation Logic on "delivered"
      if (status === "delivered") {
        const currentOrder = orders.find((o) => o.id === id);
        
        if (currentOrder && currentOrder.userId) {
          const userProfileRef = doc(db, "users", currentOrder.userId);
          const userSnap = await getDoc(userProfileRef);
          
          if (userSnap.exists()) {
            const userData = userSnap.data();
            
            // Spaces remove karke uppercase banaya (e.g., "MD ALIM ANSARI" -> "MDALIMANSARI")
            const userName = (userData?.name || "USER")
              .replace(/\s+/g, "")
              .toUpperCase();

            // Random 4 character suffix generate kiya
            const randomSuffix = Math.random()
              .toString(36)
              .substring(2, 6)
              .toUpperCase();

            // Dynamic format string interpolation (e.g., JBK + MDAL + X7Q9)
            const generatedReferralCode = `JBK${userName.substring(0, 4)}${randomSuffix}`;

            // User document update data integrity ke sath
            await updateDoc(userProfileRef, {
              mlmActive: true,
              referralCode: generatedReferralCode,
              walletBalance: userData?.walletBalance || 0,
              totalIncome: userData?.totalIncome || 0
            });

            console.log(`MLM Activated with Name-Based Code: ${generatedReferralCode}`);
          } else {
            console.warn("User profile does not exist in Firestore.");
          }
        } else {
          console.warn("Could not activate MLM. userId is missing in this order document.");
        }
      }
    } catch (error) {
      console.log(error);
      alert("Failed to update status or trigger MLM activation.");
    }
  }

  async function deleteOrder(id: string) {
    try {
      await deleteDoc(doc(db, "orders", id));
      setOrders((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.log(error);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        Loading...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0b0b0b] p-4 text-white">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-3xl font-black">Orders Manager</h1>
        <p className="mt-1 text-sm text-gray-400">Manage customer orders & MLM states</p>
      </div>

      {/* ORDERS LIST */}
      <div className="space-y-5">
        {orders.map((order) => (
          <div
            key={order.id}
            className="overflow-hidden rounded-[30px] border border-white/10 bg-[#151515]"
          >
            {/* TOP BAR */}
            <div className="flex items-center justify-between border-b border-white/10 p-4">
              <div className="flex items-center gap-3">
                <img
                  src={order.image}
                  alt={order.productTitle}
                  className="h-14 w-14 rounded-2xl object-cover"
                />
                <div>
                  <h2 className="text-lg font-black">{order.productTitle}</h2>
                  <p className="text-xs text-gray-400">{order.customerName}</p>
                </div>
              </div>

              <button
                onClick={() => deleteOrder(order.id)}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/20 text-red-500"
              >
                <Trash2 size={18} />
              </button>
            </div>

            {/* BODY DETAILS */}
            <div className="space-y-4 p-4">
              <div className="rounded-2xl bg-[#1b1b1b] p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Package size={16} />
                  <p className="text-sm font-bold">Order Details</p>
                </div>

                <div className="space-y-2 text-sm text-gray-300">
                  <p>Amount: ₹{order.amount}</p>
                  <p>Address: {order.address}</p>
                  <p className="text-xs text-gray-500">User ID: {order.userId || "Missing Reference"}</p>
                </div>
              </div>

              {/* ACTION TOGGLES */}
              <div>
                <p className="mb-3 text-sm font-bold">Order Status</p>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => updateStatus(order.id, "pending")}
                    className={`flex items-center justify-center gap-2 rounded-2xl px-3 py-3 text-sm font-bold ${
                      order.status === "pending"
                        ? "bg-yellow-500 text-black"
                        : "bg-[#1e1e1e]"
                    }`}
                  >
                    <Clock3 size={16} />
                    Pending
                  </button>

                  <button
                    onClick={() => updateStatus(order.id, "shipped")}
                    className={`flex items-center justify-center gap-2 rounded-2xl px-3 py-3 text-sm font-bold ${
                      order.status === "shipped"
                        ? "bg-blue-500 text-white"
                        : "bg-[#1e1e1e]"
                    }`}
                  >
                    <Truck size={16} />
                    Shipped
                  </button>

                  <button
                    onClick={() => updateStatus(order.id, "delivered")}
                    className={`flex items-center justify-center gap-2 rounded-2xl px-3 py-3 text-sm font-bold ${
                      order.status === "delivered"
                        ? "bg-green-500 text-white"
                        : "bg-[#1e1e1e]"
                    }`}
                  >
                    <CheckCircle2 size={16} />
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
