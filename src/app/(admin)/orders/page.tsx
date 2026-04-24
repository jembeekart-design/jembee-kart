'use client';

import { useEffect, useState } from "react";
import Link from "next/link";

type Order = {
  id: string;
  customer: string;
  amount: number;
  status: string;
};

export default function OrdersPage() {
  const [themeColor, setThemeColor] = useState("#6366f1");
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("themeColor");
    if (saved) setThemeColor(saved);

    // 🔥 Dummy data (replace with Firestore later)
    setOrders([
      {
        id: "ORD001",
        customer: "Rahul",
        amount: 599,
        status: "Pending",
      },
      {
        id: "ORD002",
        customer: "Aman",
        amount: 999,
        status: "Shipped",
      },
    ]);
  }, []);

  const updateStatus = (id: string, newStatus: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, status: newStatus } : o
      )
    );
  };

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">📦 Orders</h1>

        <button
          className="px-5 py-2 rounded-xl font-medium"
          style={{
            background: themeColor,
            boxShadow: `0 0 20px ${themeColor}55`,
          }}
        >
          Sync Qikink Orders
        </button>
      </div>

      {/* Table */}
      <div className="glass rounded-2xl p-5 overflow-x-auto">
        <table className="w-full text-left">
          <thead className="opacity-70 text-sm">
            <tr>
              <th className="p-3">Order ID</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Status</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                className="border-t border-white/10 hover:bg-white/5 transition"
              >
                <td className="p-3">{order.id}</td>

                <td className="p-3">{order.customer}</td>

                <td className="p-3 font-bold">
                  ₹{order.amount}
                </td>

                <td className="p-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${
                      order.status === "Pending"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : order.status === "Shipped"
                        ? "bg-blue-500/20 text-blue-400"
                        : "bg-green-500/20 text-green-400"
                    }`}
                  >
                    {order.status}
                  </span>
                </td>

                <td className="p-3 space-x-2">
                  <select
                    value={order.status}
                    onChange={(e) =>
                      updateStatus(order.id, e.target.value)
                    }
                    className="bg-white/10 border border-white/20 rounded px-2 py-1 text-sm"
                  >
                    <option>Pending</option>
                    <option>Shipped</option>
                    <option>Delivered</option>
                  </select>

                  <Link href={`/orders/${order.id}`}>
                    <button
                      className="px-3 py-1 rounded-lg text-sm"
                      style={{
                        border: `1px solid ${themeColor}`,
                        color: themeColor,
                      }}
                    >
                      View
                    </button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {orders.length === 0 && (
          <div className="text-center py-10 opacity-60">
            No orders found 🚀
          </div>
        )}
      </div>

      {/* Info */}
      <div className="glass p-4 rounded-xl text-sm opacity-70">
        Orders are synced with Qikink. You can update status and track
        delivery.
      </div>
    </div>
  );
}
