'use client';

import { useEffect, useState } from "react";

export default function AddFlashSalePage() {
  const [themeColor, setThemeColor] = useState("#6366f1");

  const [title, setTitle] = useState("");
  const [discount, setDiscount] = useState(10);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [active, setActive] = useState(true);

  // future: selected products
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("themeColor");
    if (saved) setThemeColor(saved);
  }, []);

  const handleSubmit = () => {
    const data = {
      title,
      discount,
      startDate,
      endDate,
      active,
      products: selectedProducts,
    };

    console.log("Flash Sale Data:", data);
    alert("Flash Sale Created (Firestore later)");
  };

  return (
    <div className="space-y-6 text-white">
      {/* Title */}
      <h1 className="text-3xl font-bold">⚡ Create Flash Sale</h1>

      <div className="glass p-6 rounded-2xl space-y-4">
        {/* Title */}
        <input
          type="text"
          placeholder="Sale Title (e.g. Weekend Sale)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-3 rounded-xl bg-white/10 border border-white/20 outline-none"
        />

        {/* Discount */}
        <div>
          <label className="text-sm opacity-70">Discount (%)</label>
          <input
            type="number"
            value={discount}
            onChange={(e) => setDiscount(Number(e.target.value))}
            className="w-full p-3 mt-1 rounded-xl bg-white/10 border border-white/20"
          />
        </div>

        {/* Dates */}
        <div className="grid md:grid-cols-2 gap-3">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="p-3 rounded-xl bg-white/10 border border-white/20"
          />

          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="p-3 rounded-xl bg-white/10 border border-white/20"
          />
        </div>

        {/* Product Selection (placeholder) */}
        <div>
          <label className="text-sm opacity-70">
            Select Products (Qikink)
          </label>

          <div className="p-3 mt-1 rounded-xl bg-white/5 border border-white/10 text-sm opacity-60">
            Product selector will be connected with Qikink products 🔗
          </div>
        </div>

        {/* Active Toggle */}
        <div className="flex items-center gap-3">
          <label>Active</label>

          <button
            onClick={() => setActive(!active)}
            className={`px-4 py-1 rounded-full text-sm ${
              active
                ? "bg-green-500/30 text-green-400"
                : "bg-red-500/30 text-red-400"
            }`}
          >
            {active ? "Active" : "Inactive"}
          </button>
        </div>

        {/* Save */}
        <button
          onClick={handleSubmit}
          className="px-6 py-2 rounded-xl font-medium"
          style={{
            background: themeColor,
            boxShadow: `0 0 20px ${themeColor}55`,
          }}
        >
          Create Flash Sale
        </button>
      </div>

      {/* Info */}
      <div className="glass p-4 rounded-xl text-sm opacity-70">
        Flash sale applies discount automatically to selected products within the active date range.
      </div>
    </div>
  );
}
