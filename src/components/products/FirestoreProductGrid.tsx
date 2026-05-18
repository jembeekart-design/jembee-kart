"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import {
  collection,
  onSnapshot
} from "firebase/firestore";

import { db } from "@/firebase/config";

import ProductCard from "@/components/products/ProductCard";

interface Product {
  id: string;

  title?: string;

  description?: string;

  image?: string;

  category?: string;

  price?: number;

  discountPrice?: number;

  stock?: number;

  rating?: number;

  featured?: boolean;

  visible?: boolean;

  position?: number;

  backgroundColor?: string;

  textColor?: string;

  buttonColor?: string;

  buttonTextColor?: string;

  borderRadius?: string;

  cardWidth?: string;

  imageHeight?: string;
}

export default function FirestoreProductGrid() {
  const [products, setProducts] =
    useState<Product[]>([]);

  const [loading, setLoading] =
    useState(true);

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

  if (loading) {
    return (
      <div className="flex w-full items-center justify-center py-20">

        <p className="text-xl font-black text-gray-500">
          Loading Products...
        </p>

      </div>
    );
  }

  return (
    <section className="w-full overflow-hidden px-3 py-5 md:px-6">

      {/* HEADER */}

      <div className="mb-6 flex items-center justify-between">

        <h2 className="text-2xl font-black text-gray-900 md:text-4xl">
          Trending Products
        </h2>

        <button className="text-sm font-black text-blue-600 md:text-base">
          View All
        </button>

      </div>

      {/* PRODUCTS */}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

        {products.map((product) => {
          return (
            <Link
              key={product.id}
              href={`/product/${product.id}`}
            >

              <ProductCard
                id={product.id}
                title={product.title}
                image={product.image}
                price={product.price}
                discountPrice={
                  product.discountPrice
                }
                rating={product.rating}
                stock={product.stock}
                backgroundColor={
                  product.backgroundColor
                }
                textColor={
                  product.textColor
                }
                buttonColor={
                  product.buttonColor
                }
                buttonTextColor={
                  product.buttonTextColor
                }
                borderRadius={
                  product.borderRadius
                }
                cardWidth={
                  product.cardWidth
                }
                imageHeight={
                  product.imageHeight
                }
              />

            </Link>
          );
        })}

      </div>

    </section>
  );
}
