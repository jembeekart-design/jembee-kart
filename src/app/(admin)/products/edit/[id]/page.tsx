'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function EditProductPage() {
  const { id } = useParams();

  const [themeColor, setThemeColor] = useState("#6366f1");
  const [product, setProduct] = useState<any>(null);

  const [margin, setMargin] = useState(100);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("themeColor");
    if (saved) setThemeColor(saved);

    // 🔥 Dummy fetch (later Firestore)
    setProduct({
      id,
      name: "Custom Printed T-Shirt",
      price: 399,
      image: "https://via.placeholder.com/200",
    });
  }, [id]);

  const finalPrice = product
    ? product.price + Number(margin)
    : 0;

  return (
    <div className="space-y-6 text-white">
      {/* Title */}
      <h1 className="text-3xl font-bold">
        ✏️ Edit Product
      </h1>

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
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">
              {product.name}
            </h2>

            <p>Base Price: ₹{product.price}</p>

            {/* Margin */}
            <div>
              <label className="text-sm opacity-70">
                Margin (Profit)
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

            {/* Visibility Toggle */}
            <div className="flex items-center gap-3">
              <label className="text-sm">
                Visible on Store
              </label>

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
      )}

      {/* Info */}
      <div className="glass p-4 rounded-xl text-sm opacity-70">
        You can only edit margin and visibility. Product data is synced
        from Qikink.
      </div>
    </div>
  );
}
