'use client';

import { useEffect, useState } from "react";
import Link from "next/link";

type Product = {
  id: string;
  name: string;
  price: number;
  margin: number;
  image: string;
};

export default function ProductsPage() {
  const [themeColor, setThemeColor] = useState("#6366f1");
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("themeColor");
    if (saved) setThemeColor(saved);

    // Dummy data (replace with Firestore later)
    setProducts([
      {
        id: "1",
        name: "Custom T-Shirt",
        price: 499,
        margin: 100,
        image: "https://via.placeholder.com/150",
      },
      {
        id: "2",
        name: "Printed Hoodie",
        price: 999,
        margin: 200,
        image: "https://via.placeholder.com/150",
      },
    ]);
  }, []);

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">🛒 Products</h1>

        <Link href="/products/import-qikink">
          <button
            className="px-5 py-2 rounded-xl font-medium shadow-lg"
            style={{
              background: themeColor,
              boxShadow: `0 0 20px ${themeColor}55`,
            }}
          >
            + Import from Qikink
          </button>
        </Link>
      </div>

      {/* Glass Table */}
      <div className="glass rounded-2xl p-5 overflow-x-auto">
        <table className="w-full text-left">
          <thead className="opacity-70 text-sm">
            <tr>
              <th className="p-3">Product</th>
              <th className="p-3">Price</th>
              <th className="p-3">Margin</th>
              <th className="p-3">Final</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => (
              <tr
                key={product.id}
                className="border-t border-white/10 hover:bg-white/5 transition"
              >
                <td className="p-3 flex items-center gap-3">
                  <img
                    src={product.image}
                    alt=""
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  {product.name}
                </td>

                <td className="p-3">₹{product.price}</td>

                <td
                  className="p-3 font-medium"
                  style={{ color: themeColor }}
                >
                  +₹{product.margin}
                </td>

                <td className="p-3 font-bold">
                  ₹{product.price + product.margin}
                </td>

                <td className="p-3">
                  <Link href={`/products/edit/${product.id}`}>
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Empty state */}
        {products.length === 0 && (
          <div className="text-center py-10 opacity-60">
            No products found. Import from Qikink 🚀
          </div>
        )}
      </div>

      {/* Info Card */}
      <div className="glass p-5 rounded-xl">
        <h2 className="font-semibold mb-2">ℹ️ Important</h2>
        <p className="text-sm opacity-70">
          All products are imported from Qikink. You can only edit pricing,
          margin, and visibility.
        </p>
      </div>
    </div>
  );
}
