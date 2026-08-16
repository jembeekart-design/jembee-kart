"use client";

import { useEffect, useState } from "react";

import { useParams } from "next/navigation";

import {
  collection,
  onSnapshot,
  query,
  where
} from "firebase/firestore";

import { db } from "@/firebase/config";

import Header from "@/components/navigation/Header";

import BottomNavbar from "@/components/navigation/BottomNavbar";

import WhatsAppButton from "@/components/navigation/WhatsAppButton";

import CategoryCard from "@/components/categories/CategoryCard";

interface Product {
  id: string;

  title?: string;

  image?: string;

  category?: string;

  price?: number;

  discountPrice?: number;

  backgroundColor?: string;

  textColor?: string;
}

export default function CategoryProductsPage() {
  const params = useParams();

  const slug =
    String(
      params.slug || ""
    ).toLowerCase();

  const [products, setProducts] =
    useState<Product[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const productsQuery =
      query(
        collection(
          db,
          "products"
        ),
        where(
          "category",
          "==",
          slug
        )
      );

    const unsubscribe =
      onSnapshot(
        productsQuery,
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

          setProducts(data);

          setLoading(false);
        }
      );

    return () => unsubscribe();
  }, [slug]);

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[var(--color-page-background)] pt-[115px] md:pt-[150px]">

      {/* HEADER */}

      <Header />

      {/* PAGE */}

      <div className="w-full overflow-x-hidden px-3 py-5 md:px-6">

        {/* TITLE */}

        <div className="mb-6">

          <h1 className="text-3xl font-black capitalize text-[var(--text-primary)] md:text-5xl">
            {slug}
          </h1>

          <p className="mt-2 text-[var(--text-secondary)]">
            Browse category products
          </p>

        </div>

        {/* LOADING */}

        {loading ? (
          <div className="text-center text-xl font-bold text-[var(--text-secondary)]">
            Loading Products...
          </div>
        ) : products.length ===
          0 ? (
          <div className="rounded-[30px] bg-[var(--color-card-background)] p-10 text-center shadow-xl">

            <h2 className="text-2xl font-black text-[var(--text-primary)]">
              No Products Found
            </h2>

          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

            {products.map(
              (product) => {
                return (
                  <CategoryCard
                    key={
                      product.id
                    }
                    title={
                      product.title
                    }
                    image={
                      product.image
                    }
                    backgroundColor={
                      product.backgroundColor ||
                      "var(--color-primary-button)"
                    }
                    textColor={
                      product.textColor ||
                      "var(--color-primary-button)"
                    }
                  />
                );
              }
            )}

          </div>
        )}

      </div>

      {/* FLOATING BUTTONS */}

      <WhatsAppButton />

      <BottomNavbar />

    </main>
  );
}
