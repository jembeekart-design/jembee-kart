'use client';

import { useEffect, useState } from "react";

export default function ImportQikinkPage() {
  const [themeColor, setThemeColor] = useState("#6366f1");

  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const [product, setProduct] = useState<any>(null);
  const [margin, setMargin] = useState(100);

  useEffect(() => {
    const saved = localStorage.getItem("themeColor");
    if (saved) setThemeColor(saved);
  }, []);

  // 🔥 Fake fetch (later Qikink API)
  const fetchProduct = async () => {
    if (!url) return;

    setLoading(true);

    setTimeout(() => {
      setProduct({
        name: "Custom Printed T-Shirt",
        price: 399,
        image: "https://via.placeholder.com/200",
      });
      setLoading(false);
    }, 1000);
  };

  const finalPrice = product
    ? product.price + Number(margin)
    : 0;

  return (
    <div className="space-y-6 text-white">
      {/* Title */}
      <h1 className="text-3xl font-bold">
        🔗 Import Product (Qikink)
      </h1>

      {/* Input Card */}
      <div className="glass p-6 rounded-2xl space-y-4">
        <input
          type="text"
          placeholder="Paste Qikink product URL..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full p-3 rounded-xl bg-white/10 border border-white/20 outline-none"
        />

        <button
          onClick={fetchProduct}
          className="px-5 py-2 rounded-xl font-medium"
          style={{
            background: themeColor,
            boxShadow: `0 0 20px ${themeColor}55`,
          }}
        >
          {loading ? "Fetching..." : "Fetch Product"}
        </button>
      </div>

      {/* Product Preview */}
      {product && (
        <div className="glass p-6 rounded-2xl grid md:grid-cols-2 gap-6">
          {/* Image */}
          <div className="flex justify-center">
            <img
              src={product.image}
              alt=""
              className="w-48 h-48 rounded-xl object-cover"
            />
          </div>

          {/* Details */}
          <div className="space-y-3">
            <h2 className="text-xl font-semibold">
              {product.name}
            </h2>

            <p>Base Price: ₹{product.price}</p>

            {/* Margin */}
            <div>
              <label className="text-sm opacity-70">
                Set Margin
              </label>
              <input
                type="number"
                value={margin}
                onChange={(e) =>
                  setMargin(Number(e.target.value))
                }
                className="w-full p-2 rounded-lg bg-white/10 border border-white/20 mt-1"
              />
            </div>

            {/* Final Price */}
            <div
              className="text-lg font-bold"
              style={{ color: themeColor }}
            >
              Final Price: ₹{finalPrice}
            </div>

            {/* Save Button */}
            <button
              className="mt-3 px-5 py-2 rounded-xl font-medium"
              style={{
                background: themeColor,
                boxShadow: `0 0 20px ${themeColor}55`,
              }}
            >
              Save Product
            </button>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="glass p-4 rounded-xl text-sm opacity-70">
        Only Qikink products are allowed. This will auto-fetch product
        details and allow margin editing.
      </div>
    </div>
  );
}
