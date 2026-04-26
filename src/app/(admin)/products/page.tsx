'use client';

import { useEffect, useState } from "react";
import Link from "next/link";

type Product = {
  id: string;
  name: string;
  price: number;
  margin: number;
  image: string;
  sku: string; // Qikink Products ke liye SKU zaroori hai
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    // Dummy data (Production mein Firestore se fetch hoga)
    setProducts([
      {
        id: "1",
        name: "Premium Cotton T-Shirt",
        sku: "QK-TSH-001",
        price: 499,
        margin: 150,
        image: "https://via.placeholder.com/150",
      },
      {
        id: "2",
        name: "Oversized Hoodie",
        sku: "QK-HOD-092",
        price: 999,
        margin: 250,
        image: "https://via.placeholder.com/150",
      },
    ]);
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 🚀 Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white flex items-center gap-3">
            <span className="opacity-50">🛒</span> Products
          </h1>
          <p className="text-white/40 text-sm mt-1 uppercase tracking-widest font-bold">Qikink Inventory Management</p>
        </div>

        <Link href="/products/import-qikink">
          <button className="btn-guardian flex items-center gap-2 group">
            <span className="text-lg group-hover:rotate-90 transition-transform duration-300">+</span>
            Import from Qikink
          </button>
        </Link>
      </div>

      {/* 📊 High-End Glass Table Container */}
      <div className="glass-guardian overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-[10px] uppercase tracking-[2px] font-black text-white/50">
                <th className="p-5">Product Details</th>
                <th className="p-5">SKU</th>
                <th className="p-5">Qikink Price</th>
                <th className="p-5">Your Margin</th>
                <th className="p-5">Final Price</th>
                <th className="p-5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="group hover:bg-white/[0.03] transition-all duration-300"
                >
                  <td className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden glass-normal border-white/10 group-hover:border-white/30 transition-colors">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white group-hover:text-[var(--primary)] transition-colors">{product.name}</p>
                        <p className="text-[10px] text-white/30">Active in Store</p>
                      </div>
                    </div>
                  </td>

                  <td className="p-5">
                    <span className="text-[10px] font-mono bg-white/5 px-2 py-1 rounded border border-white/10 text-white/60">
                      {product.sku}
                    </span>
                  </td>

                  <td className="p-5 text-sm text-white/70 font-medium">₹{product.price}</td>

                  <td className="p-5">
                    <div className="text-sm font-bold text-[var(--primary)] filter drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.3)]">
                      +₹{product.margin}
                    </div>
                  </td>

                  <td className="p-5">
                    <div className="text-lg font-black text-white">
                      ₹{product.price + product.margin}
                    </div>
                  </td>

                  <td className="p-5 text-right">
                    <Link href={`/products/edit/${product.id}`}>
                      <button className="px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border border-white/10 hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all bg-white/5">
                        Edit Item
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 🚀 Empty State */}
        {products.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4 opacity-20">📦</div>
            <h3 className="text-xl font-bold text-white/40 italic">Inventory is empty.</h3>
            <p className="text-sm text-white/20 mt-2">Sync with Qikink to populate products.</p>
          </div>
        )}
      </div>

      {/* ℹ️ Strategic Info Card */}
      <div className="glass-normal p-6 border-l-4 border-[var(--primary)]">
        <div className="flex items-start gap-4">
          <div className="text-2xl">⚡</div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-white/80">Qikink Pricing Sync</h2>
            <p className="text-xs text-white/40 mt-1 leading-relaxed">
              Base prices are fetched directly from Qikink. Your "Final Price" is calculated automatically based on your set margin. 
              Any changes made here will reflect live on your seller storefront.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
