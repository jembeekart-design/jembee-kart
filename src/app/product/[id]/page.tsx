"use client";

import { useEffect, useState } from "react";

import {
  doc,
  getDoc
} from "firebase/firestore";

import { db } from "@/firebase/config";

interface ProductPageProps {
  params: {
    id: string;
  };
}

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
}

export default function ProductDetailsPage({
  params
}: ProductPageProps) {
  const [product, setProduct] =
    useState<Product | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const documentRef = doc(
          db,
          "products",
          params.id
        );

        const snapshot =
          await getDoc(
            documentRef
          );

        if (
          snapshot.exists()
        ) {
          setProduct({
            id: snapshot.id,

            ...(snapshot.data() as Omit<
              Product,
              "id"
            >)
          });
        }

        setLoading(false);
      } catch (error) {
        console.error(error);

        setLoading(false);
      }
    }

    fetchProduct();
  }, [params.id]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">

        <h1 className="text-2xl font-black text-gray-500">
          Loading Product...
        </h1>

      </main>
    );
  }

  if (!product) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">

        <h1 className="text-2xl font-black text-red-500">
          Product Not Found
        </h1>

      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8">

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 rounded-[40px] bg-white p-6 shadow-2xl md:grid-cols-2 md:p-10">

        {/* IMAGE */}

        <div className="overflow-hidden rounded-[30px] bg-gray-100">

          <img
            src={product.image}
            alt={product.title}
            className="h-full w-full object-cover"
          />

        </div>

        {/* CONTENT */}

        <div className="flex flex-col justify-center">

          {/* CATEGORY */}

          <div className="mb-4 inline-flex w-fit rounded-full bg-blue-100 px-4 py-2 text-sm font-black text-blue-700">

            {product.category}

          </div>

          {/* TITLE */}

          <h1 className="text-4xl font-black text-gray-900 md:text-6xl">

            {product.title}

          </h1>

          {/* RATING */}

          <div className="mt-5 flex items-center gap-2">

            <span className="text-yellow-500">
              ⭐
            </span>

            <span className="text-lg font-bold text-gray-600">
              {product.rating}
            </span>

          </div>

          {/* PRICE */}

          <div className="mt-6 flex items-center gap-4">

            <span className="text-5xl font-black text-blue-600">
              ₹
              {product.discountPrice}
            </span>

            <span className="text-2xl font-bold text-gray-400 line-through">
              ₹
              {product.price}
            </span>

          </div>

          {/* DESCRIPTION */}

          <p className="mt-6 text-lg leading-relaxed text-gray-600">

            {product.description}

          </p>

          {/* STOCK */}

          <div className="mt-6">

            <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-black text-green-700">

              In Stock:
              {" "}
              {product.stock}

            </span>

          </div>

          {/* BUTTONS */}

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">

            <button className="rounded-2xl bg-blue-600 px-8 py-4 text-lg font-black text-white transition-all duration-300 hover:bg-blue-700">

              Add To Cart

            </button>

            <button className="rounded-2xl bg-black px-8 py-4 text-lg font-black text-white transition-all duration-300 hover:bg-gray-800">

              Buy Now

            </button>

          </div>

        </div>

      </div>

    </main>
  );
}
