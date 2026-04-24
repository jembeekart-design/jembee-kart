'use client';

import { useEffect, useState } from "react";

type Props = {
  product: any;
  onSave: (data: any) => void;
};

export default function ProductForm({ product, onSave }: Props) {
  const [themeColor, setThemeColor] = useState("#6366f1");

  const [margin, setMargin] = useState(100);
  const [visible, setVisible] = useState(true);
  const [category, setCategory] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("themeColor");
    if (saved) setThemeColor(saved);

    if (product) {
      setMargin(product.margin || 100);
      setVisible(product.visible ?? true);
      setCategory(product.category || "");
    }
  }, [product]);

  if (!product) return null;

  const finalPrice = product.price + Number(margin);

  const handleSave = () => {
    const updated = {
      ...product,
      margin,
      finalPrice,
      visible,
      category,
    };

    onSave(updated);
  };

  return (
    <div className="space-y-5 text-white">
      <div className="glass p-5 rounded-2xl grid md:grid-cols-2 gap-5">
        {/* Image */}
        <img
          src={product.image}
          alt=""
          className="w-full h-40 object-cover rounded-xl"
        />

        {/* Info */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">
            {product.name}
          </h2>

          <p>Base Price: ₹{product.price}</p>

          {/* Margin */}
          <div>
            <label className="text-sm opacity-70">
              Margin (₹)
            </label>
            <input
              type="number"
              value={margin}
              onChange={(e) =>
                setMargin(Number(e.target.value))
              }
              className="w-full p-2 mt-1 rounded-lg bg-white/10 border border-white/20"
            />
          </div>

          {/* Final Price */}
          <p
            className="font-bold"
            style={{ color: themeColor }}
          >
            Final Price: ₹{finalPrice}
          </p>

          {/* Category */}
          <div>
            <label className="text-sm opacity-70">
              Category
            </label>
            <input
              type="text"
              placeholder="e.g. T-Shirts"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2 mt-1 rounded-lg bg-white/10 border border-white/20"
            />
          </div>

          {/* Visibility */}
          <div className="flex items-center gap-3">
            <label>Visible</label>

            <button
              onClick={() => setVisible(!visible)}
              className={`px-4 py-1 rounded-full text-sm ${
                visible
                  ? "bg-green-500/30 text-green-400"
                  : "bg-red-500/30 text-red-400"
              }`}
            >
              {visible ? "Visible" : "Hidden"}
            </button>
          </div>

          {/* Save */}
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl font-medium"
            style={{
              background: themeColor,
              boxShadow: `0 0 20px ${themeColor}55`,
            }}
          >
            Save Changes
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="glass p-3 rounded-xl text-sm opacity-70">
        Product data is synced from Qikink. Only margin, category, and visibility can be changed.
      </div>
    </div>
  );
}
