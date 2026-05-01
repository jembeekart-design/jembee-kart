"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// ================= TYPES =================
type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
};

type Banner = {
  id: string;
  image: string;
};

// ================= DEMO DATA =================
const banners: Banner[] = [
  { id: "1", image: "https://via.placeholder.com/1200x300?text=Big+Sale" },
  { id: "2", image: "https://via.placeholder.com/1200x300?text=Festival+Offer" },
];

const festivalBanner =
  "https://via.placeholder.com/1200x200?text=Diwali+Mega+Sale";

const products: Product[] = [
  {
    id: "1",
    name: "Printed T-Shirt",
    price: 499,
    image: "https://via.placeholder.com/300",
  },
  {
    id: "2",
    name: "Hoodie",
    price: 999,
    image: "https://via.placeholder.com/300",
  },
  {
    id: "3",
    name: "Cap",
    price: 299,
    image: "https://via.placeholder.com/300",
  },
  {
    id: "4",
    name: "Mug",
    price: 199,
    image: "https://via.placeholder.com/300",
  },
];

// ================= COMPONENT =================
export default function HomePage() {
  const router = useRouter();

  const [currentBanner, setCurrentBanner] = useState(0);

  // 🔁 Auto slider
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">

      {/* 🔥 NAVBAR */}
      <div className="p-4 flex justify-between items-center border-b border-white/10">
        <h1 className="text-xl font-bold">JembeeKart 🚀</h1>
        <button
          onClick={() => router.push("/admin")}
          className="text-sm border px-3 py-1 rounded"
        >
          Admin
        </button>
      </div>

      {/* 🎯 MAIN BANNER (SLIDER) */}
      <div className="p-4">
        <img
          src={banners[currentBanner].image}
          className="rounded-xl w-full"
        />
      </div>

      {/* 🎉 FESTIVAL BANNER */}
      <div className="px-4 mb-4">
        <img src={festivalBanner} className="rounded-xl w-full" />
      </div>

      {/* 🛍 PRODUCTS SECTION */}
      <div className="px-4">
        <h2 className="text-lg font-semibold mb-3">🔥 Trending Products</h2>

        <div className="grid grid-cols-2 gap-4">
          {products.map((p) => (
            <div
              key={p.id}
              className="bg-white/10 backdrop-blur-xl p-3 rounded-xl border border-white/20"
              onClick={() => router.push(`/product/${p.id}`)}
            >
              <img
                src={p.image}
                className="rounded-lg mb-2"
              />

              <h3 className="text-sm font-semibold">{p.name}</h3>
              <p className="text-xs text-gray-300">₹{p.price}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 🚀 VIEW ALL */}
      <div className="p-4 text-center">
        <button
          onClick={() => router.push("/products")}
          className="px-6 py-2 bg-white/10 border border-white/20 rounded-xl"
        >
          View All Products
        </button>
      </div>

    </div>
  );
}
