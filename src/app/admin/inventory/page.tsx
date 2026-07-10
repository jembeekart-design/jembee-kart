"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

import {
  collection,
  onSnapshot,
  query
} from "firebase/firestore";

import {
  Package,
  Boxes,
  AlertTriangle,
  CheckCircle2,
  Search,
  IndianRupee
} from "lucide-react";

import { db } from "@/firebase/config";

interface ProductData {
  id: string;
  name?: string;
  stock?: number;
  price?: number;
  category?: string;
  image?: string;
}

export default function InventoryPage() {

  const [products, setProducts] =
    useState<ProductData[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  useEffect(() => {

    const q = query(
      collection(db, "products")
    );

    const unsubscribe =
      onSnapshot(q, (snapshot) => {

        const data:
          ProductData[] = [];

        snapshot.forEach((doc) => {

          data.push({
            id: doc.id,
            ...doc.data()
          });

        });

        setProducts(data);

        setLoading(false);

      });

    return () =>
      unsubscribe();

  }, []);

  const filteredProducts =
    products.filter((product) =>
      product.name
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  if (loading) {

    return (

      <div className="flex min-h-screen items-center justify-center bg-[var(--card-color)] text-[var(--button-text-color)]">

        Loading Inventory...

      </div>

    );
  }

  return (

    <main className="min-h-screen bg-[var(--primary-color)] p-4 text-[var(--button-text-color)]">

      {/* HEADER */}

      <div className="mb-8 flex items-center gap-4">

        <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-[var(--secondary-color)]">

          <Boxes size={30} />

        </div>

        <div>

          <h1 className="text-3xl font-black">
            Inventory Manager
          </h1>

          <p className="mt-1 text-sm text-[var(--muted-text-color)]">
            Manage products & stock
          </p>

        </div>

      </div>

      {/* STATS */}

      <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-3">

        <StatCard
          title="Total Products"
          value={
            products.length.toString()
          }
          icon={
            <Package size={24} />
          }
        />

        <StatCard
          title="Low Stock"
          value={
            products
              .filter(
                (product) =>
                  (product.stock || 0) <
                  5
              )
              .length
              .toString()
          }
          icon={
            <AlertTriangle size={24} />
          }
        />

        <StatCard
          title="In Stock"
          value={
            products
              .filter(
                (product) =>
                  (product.stock || 0) >
                  0
              )
              .length
              .toString()
          }
          icon={
            <CheckCircle2 size={24} />
          }
        />

      </div>

      {/* SEARCH */}

      <div className="mb-6 flex items-center gap-3 rounded-[30px] bg-[var(--primary-color)] px-5 py-4">

        <Search size={22} />

        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
          className="w-full bg-transparent outline-none"
        />

      </div>

      {/* PRODUCTS */}

      <div className="space-y-5">

        {filteredProducts.length === 0 && (

          <div className="rounded-[30px] bg-[var(--primary-color)] p-10 text-center">

            No Products Found

          </div>

        )}

        {filteredProducts.map(
          (product) => (

            <div
              key={product.id}
              className="rounded-[30px] bg-[var(--primary-color)] p-5"
            >

              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                {/* LEFT */}

                <div className="flex items-center gap-4">

                  <img
                    src={
                      product.image ||
                      "https://placehold.co/100x100/png"
                    }
                    alt="product"
                    className="h-24 w-24 rounded-2xl object-cover"
                  />

                  <div>

                    <h2 className="text-2xl font-black">

                      {product.name ||
                        "Unnamed Product"}

                    </h2>

                    <p className="mt-2 text-sm text-[var(--muted-text-color)]">

                      Category:
                      {" "}
                      {product.category ||
                        "N/A"}

                    </p>

                    <div className="mt-3 flex items-center gap-2">

                      <IndianRupee size={16} />

                      <span className="font-bold">

                        {product.price || 0}

                      </span>

                    </div>

                  </div>

                </div>

                {/* RIGHT */}

                <div className="flex flex-col items-start gap-3 md:items-end">

                  <div className="rounded-full bg-[var(--card-color)] px-5 py-2 text-sm font-bold">

                    Stock:
                    {" "}
                    {product.stock || 0}

                  </div>

                  <StockBadge
                    stock={
                      product.stock || 0
                    }
                  />

                </div>

              </div>

            </div>

          )
        )}

      </div>

    </main>

  );
}

function StatCard({
  title,
  value,
  icon
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {

  return (

    <div className="rounded-[30px] bg-[var(--primary-color)] p-5">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm text-[var(--muted-text-color)]">
            {title}
          </p>

          <h2 className="mt-2 text-3xl font-black">
            {value}
          </h2>

        </div>

        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--card-color)]">

          {icon}

        </div>

      </div>

    </div>

  );
}

function StockBadge({
  stock
}: {
  stock: number;
}) {

  function getColor() {

    if (stock <= 0) {

      return "bg-[var(--danger-color)]";

    }

    if (stock < 5) {

      return "bg-[var(--warning-color)]";

    }

    return "bg-[var(--success-color)]";

  }

  function getText() {

    if (stock <= 0) {

      return "Out Of Stock";

    }

    if (stock < 5) {

      return "Low Stock";

    }

    return "In Stock";

  }

  return (

    <div
      className={`rounded-full px-5 py-2 text-sm font-bold ${getColor()}`}
    >

      {getText()}

    </div>

  );
}
