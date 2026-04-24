'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function OrderDetailPage() {
  const { id } = useParams();

  const [themeColor, setThemeColor] = useState("#6366f1");
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem("themeColor");
    if (saved) setThemeColor(saved);

    // 🔥 Dummy data (later Firestore/Qikink)
    setOrder({
      id,
      customer: "Rahul Kumar",
      phone: "9876543210",
      address: "Delhi, India",
      status: "Pending",
      items: [
        {
          name: "Custom T-Shirt",
          price: 499,
          qty: 1,
          image: "https://via.placeholder.com/100",
        },
      ],
    });
  }, [id]);

  const updateStatus = (newStatus: string) => {
    setOrder((prev: any) => ({
      ...prev,
      status: newStatus,
    }));
  };

  const total =
    order?.items?.reduce(
      (sum: number, item: any) =>
        sum + item.price * item.qty,
      0
    ) || 0;

  return (
    <div className="space-y-6 text-white">
      {/* Title */}
      <h1 className="text-3xl font-bold">
        📦 Order Details
      </h1>

      {order && (
        <>
          {/* Order Info */}
          <div className="glass p-6 rounded-2xl space-y-3">
            <h2 className="text-xl font-semibold">
              Order ID: {order.id}
            </h2>

            <p>Customer: {order.customer}</p>
            <p>Phone: {order.phone}</p>
            <p>Address: {order.address}</p>

            {/* Status */}
            <div className="flex items-center gap-3">
              <span>Status:</span>

              <select
                value={order.status}
                onChange={(e) =>
                  updateStatus(e.target.value)
                }
                className="bg-white/10 border border-white/20 rounded px-3 py-1"
              >
                <option>Pending</option>
                <option>Shipped</option>
                <option>Delivered</option>
              </select>
            </div>
          </div>

          {/* Items */}
          <div className="glass p-6 rounded-2xl">
            <h2 className="text-xl font-semibold mb-4">
              🛒 Items
            </h2>

            <div className="space-y-4">
              {order.items.map((item: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center gap-4 border-b border-white/10 pb-3"
                >
                  <img
                    src={item.image}
                    alt=""
                    className="w-16 h-16 rounded-lg object-cover"
                  />

                  <div className="flex-1">
                    <p>{item.name}</p>
                    <p className="text-sm opacity-70">
                      Qty: {item.qty}
                    </p>
                  </div>

                  <div
                    className="font-bold"
                    style={{ color: themeColor }}
                  >
                    ₹{item.price}
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="text-right mt-4 text-lg font-bold">
              Total: ₹{total}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              className="px-5 py-2 rounded-xl font-medium"
              style={{
                background: themeColor,
                boxShadow: `0 0 20px ${themeColor}55`,
              }}
            >
              Sync with Qikink
            </button>

            <button className="px-5 py-2 rounded-xl bg-red-500/30 text-red-400">
              Cancel Order
            </button>
          </div>
        </>
      )}
    </div>
  );
}
