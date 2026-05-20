"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import {
  collection,
  onSnapshot
} from "firebase/firestore";

import { db } from "@/firebase/config";

import ProductCard from "@/components/products/ProductCard";

/* ======================================================
TYPES
====================================================== */

interface Product {
  id: string;

  title?: string;

  description?: string;

  images?: string[];

  image?: string;

  video?: string;

  category?: string;

  price?: number;

  discountPrice?: number;

  rating?: number;

  reviews?: number;

  featured?: boolean;

  visible?: boolean;

  position?: number;

  backgroundColor?: string;

  textColor?: string;

  buttonColor?: string;

  buttonTextColor?: string;

  borderRadius?: string;

  cardWidth?: string;
}

/* ======================================================
COMPONENT
====================================================== */

export default function FirestoreProductGrid() {
  const [products, setProducts] =
    useState<Product[]>([]);

  const [loading, setLoading] =
    useState(true);

  /* ======================================================
  GET PRODUCTS
  ====================================================== */

  useEffect(() => {
    const unsubscribe =
      onSnapshot(
        collection(
          db,
          "products"
        ),
        (snapshot) => {
          const data =
            snapshot.docs.map(
              (document) => {
                return {
                  id: document.id,

                  ...(document.data() as Omit<
                    Product,
                    "id"
                  >)
                };
              }
            );

          const filteredData =
            data
              .filter(
                (product) =>
                  product.visible
              )
              .sort(
                (a, b) => {
                  return (
                    Number(
                      a.position || 0
                    ) -
                    Number(
                      b.position || 0
                    )
                  );
                }
              );

          setProducts(
            filteredData
          );

          setLoading(false);
        }
      );

    return () => unsubscribe();
  }, []);

  /* ======================================================
  LOADING
  ====================================================== */

  if (loading) {
    return (
      <div className="flex w-full items-center justify-center py-10">

        <p className="text-base font-black text-gray-500">
          Loading Products...
        </p>

      </div>
    );
  }

  /* ======================================================
  UI
  ====================================================== */

  return (
    <section className="w-full bg-[#f1f3f6] px-2 py-3">

      {/* TOP BAR */}

      <div
        className="
          mb-4
          flex
          items-center
          justify-between
          rounded-2xl
          bg-white
          px-4
          py-3
          shadow-sm
        "
      >

        {/* SORT */}

        <button
          className="
            flex
            flex-1
            items-center
            justify-center
            gap-2
            border-r
            border-gray-200
            text-sm
            font-bold
            text-gray-800
          "
        >

          <span className="text-lg">
            ⇅
          </span>

          Sort

        </button>

        {/* FILTER */}

        <button
          className="
            flex
            flex-1
            items-center
            justify-center
            gap-2
            text-sm
            font-bold
            text-gray-800
          "
        >

          <span className="text-lg">
            ⚙
          </span>

          Filter

        </button>

      </div>

      {/* HEADER */}

      <div className="mb-4 flex items-center justify-between">

        <h2
          className="
            text-2xl
            font-black
            text-gray-900
          "
        >

          Trending Products

        </h2>

        <button
          className="
            text-sm
            font-black
            text-blue-600
          "
        >

          View All

        </button>

      </div>

      {/* PRODUCTS */}

      <div className="grid grid-cols-2 gap-3">

        {products.map((product) => {
          return (
            <Link
              key={product.id}
              href={`/product/${product.id}`}
              className="block w-full"
            >

              <ProductCard
                id={product.id}
                title={product.title}

                images={
                  product.images ||
                  (
                    product.image
                      ? [product.image]
                      : []
                  )
                }

                price={product.price}

                discountPrice={
                  product.discountPrice
                }

                rating={
                  product.rating
                }

                reviews={
                  product.reviews
                }
              />

            </Link>
          );
        })}

      </div>

    </section>
  );
}
