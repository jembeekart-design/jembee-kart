'use client';

import { useEffect, useState } from "react";
import Link from "next/link";

type FlashSale = {
  id: string;
  title: string;
  discount: number;
  startDate: string;
  endDate: string;
  active: boolean;
};

export default function FlashSalePage() {
  const [themeColor, setThemeColor] = useState("#6366f1");
  const [sales, setSales] = useState<FlashSale[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("themeColor");
    if (saved) setThemeColor(saved);

    // Dummy data (replace with Firestore later)
    setSales([
      {
        id: "1",
        title: "Weekend Sale",
        discount: 20,
        startDate: "2025-04-01",
        endDate: "2025-04-02",
        active: true,
      },
      {
        id: "2",
        title: "Mega Deal",
        discount: 40,
        startDate: "2025-04-05",
        endDate: "2025-04-06",
        active: false,
      },
    ]);
  }, []);

  const toggleActive = (id: string) => {
    setSales((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, active: !s.active } : s
      )
    );
  };

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">⚡ Flash Sales</h1>

        <Link href="/marketing/flash-sale/add">
          <button
            className="px-5 py-2 rounded-xl font-medium"
            style={{
              background: themeColor,
              boxShadow: `0 0 20px ${themeColor}55`,
            }}
          >
            + Add Sale
          </button>
        </Link>
      </div>

      {/* List */}
      <div className="space-y-4">
        {sales.map((sale) => (
          <div
            key={sale.id}
            className="glass p-5 rounded-2xl flex flex-col md:flex-row items-center gap-4"
          >
            {/* Info */}
            <div className="flex-1 space-y-1">
              <h2 className="text-lg font-semibold">
                {sale.title}
              </h2>

              <p
                className="text-sm font-bold"
                style={{ color: themeColor }}
              >
                {sale.discount}% OFF
              </p>

              <p className="text-xs opacity-50">
                {sale.startDate} → {sale.endDate}
              </p>
            </div>

            {/* Status */}
            <button
              onClick={() => toggleActive(sale.id)}
              className={`px-4 py-1 rounded-full text-sm ${
                sale.active
                  ? "bg-green-500/30 text-green-400"
                  : "bg-red-500/30 text-red-400"
              }`}
            >
              {sale.active ? "Active" : "Inactive"}
            </button>

            {/* Edit */}
            <Link href={`/marketing/flash-sale/edit/${sale.id}`}>
              <button
                className="px-3 py-1 rounded-lg text-sm"
                style={{
                  border: `1px solid ${themeColor}`,
                  color: themeColor,
                }}
              >
                Edit
              </button>
            </Link>
          </div>
        ))}

        {sales.length === 0 && (
          <div className="text-center opacity-50">
            No flash sales created
          </div>
        )}
      </div>

      {/* Info */}
      <div className="glass p-4 rounded-xl text-sm opacity-70">
        Flash sales are time-limited offers. Only active sales within the date range will apply automatically.
      </div>
    </div>
  );
}
