"use client";

import Image from "next/image";

import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Package,
} from "lucide-react";

import ThemePanel from "@/components/ui/ThemePanel";

const products = [
  {
    id: "PRD-1021",
    name: "Oversized Hoodie",
    category: "Fashion",
    stock: 128,
    price: "₹1499",
    status: "Active",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
  },
  {
    id: "PRD-1022",
    name: "Premium Sneakers",
    category: "Shoes",
    stock: 48,
    price: "₹3499",
    status: "Low Stock",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
  },
];

export default function AdminProductsPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">

      {/* BACKGROUND */}
      <div className="absolute inset-0">

        <img
          src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3"
          alt=""
          className="h-full w-full object-cover opacity-30"
        />

        <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

      </div>

      {/* CONTENT */}
      <div className="relative z-10 px-6 pb-32 pt-8">

        {/* TOP */}
        <div className="flex items-center justify-between">

          <div>

            <h1 className="text-5xl font-black tracking-tight">
              Products
            </h1>

            <p className="mt-2 text-white/50">
              Manage Qikink products & inventory
            </p>

          </div>

          <button className="btn-primary flex items-center gap-3">

            <Plus className="h-5 w-5" />

            Add Product

          </button>

        </div>

        {/* SEARCH */}
        <div className="mt-8 flex gap-4">

          <div className="glass flex flex-1 items-center gap-3 px-5 py-4">

            <Search className="h-5 w-5 text-white/40" />

            <input
              placeholder="Search products..."
              className="w-full bg-transparent text-white outline-none placeholder:text-white/40"
            />

          </div>

          <button className="glass flex items-center gap-3 px-5">

            <Filter className="h-5 w-5" />

            Filters

          </button>

        </div>

        {/* PRODUCTS GRID */}
        <section className="mt-10 grid gap-6 md:grid-cols-2">

          {products.map((product) => (
            <div
              key={product.id}
              className="glass overflow-hidden rounded-[32px]"
            >

              {/* IMAGE */}
              <div className="relative h-64 w-full">

                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />

                <div className="absolute right-4 top-4">

                  <button className="glass rounded-full p-3">

                    <MoreVertical className="h-5 w-5" />

                  </button>

                </div>

              </div>

              {/* INFO */}
              <div className="p-6">

                <div className="flex items-start justify-between">

                  <div>

                    <h2 className="text-2xl font-black">
                      {product.name}
                    </h2>

                    <p className="mt-1 text-white/50">
                      {product.category}
                    </p>

                  </div>

                  <div className="badge-success">
                    {product.status}
                  </div>

                </div>

                {/* META */}
                <div className="mt-6 grid grid-cols-3 gap-4">

                  <div className="rounded-2xl bg-white/5 p-4">

                    <p className="text-sm text-white/40">
                      Product ID
                    </p>

                    <h3 className="mt-2 font-semibold">
                      {product.id}
                    </h3>

                  </div>

                  <div className="rounded-2xl bg-white/5 p-4">

                    <p className="text-sm text-white/40">
                      Stock
                    </p>

                    <h3 className="mt-2 font-semibold">
                      {product.stock}
                    </h3>

                  </div>

                  <div className="rounded-2xl bg-white/5 p-4">

                    <p className="text-sm text-white/40">
                      Price
                    </p>

                    <h3 className="mt-2 font-semibold">
                      {product.price}
                    </h3>

                  </div>

                </div>

                {/* ACTIONS */}
                <div className="mt-6 flex gap-4">

                  <button className="btn-primary flex-1">
                    Edit Product
                  </button>

                  <button className="glass flex h-14 w-14 items-center justify-center">

                    <Package className="h-6 w-6" />

                  </button>

                </div>

              </div>

            </div>
          ))}

        </section>

        {/* THEME PANEL */}
        <section className="mt-10">

          <ThemePanel />

        </section>

      </div>

    </main>
  );
}
