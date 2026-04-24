'use client';

import { useEffect, useState } from "react";

export default function QikinkImportForm() {
  const [themeColor, setThemeColor] = useState("#6366f1");

  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const [product, setProduct] = useState<any>(null);
  const [margin, setMargin] = useState(100);

  useEffect(() => {
    const saved = localStorage.getItem("themeColor");
    if (saved) setThemeColor(saved);
  }, []);

  // 🔥 Fetch Qikink Product (mock अभी)
  const fetchProduct = async () => {
    if (!url) return;

    setLoading(true);

    // simulate API
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

  const handleSave = () => {
    const data = {
      ...product,
      margin,
      finalPrice,
    };

    console.log("Saved Product:", data);
    alert("Product Saved (Firestore later)");
  };

  return (
    <div className="space-y-5 text-white">
      {/* URL Input */}
      <div className="glass p-4 rounded-xl space-y-3">
        <input
          type="text"
          placeholder="Paste Qikink product URL..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full p-3 rounded-xl bg-white/10 border border-white/20 outline-none"
        />

        <button
          onClick={fetchProduct}
          className="px-5 py-2 rounded-xl"
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
        <div className="glass p-5 rounded-xl grid md:grid-cols-2 gap-4">
          {/* Image */}
          <img
            src={product.image}
            alt=""
            className="w-full h-40 object-cover rounded-xl"
          />

          {/* Details */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">
              {product.name}
            </h2>

            <p>Base Price: ₹{product.price}</p>

            {/* Margin */}
            <input
              type="number"
              value={margin}
              onChange={(e) =>
                setMargin(Number(e.target.value))
              }
              className="w-full p-2 rounded-lg bg-white/10 border border-white/20"
            />

            {/* Final */}
            <p
              className="font-bold"
              style={{ color: themeColor }}
            >
              Final Price: ₹{finalPrice}
            </p>

            {/* Save */}
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-xl"
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
      <div className="glass p-3 rounded-xl text-sm opacity-70">
        Only Qikink products can be imported. Margin defines your profit.
      </div>
    </div>
  );
}
