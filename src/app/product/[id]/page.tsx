"use client";

import {
  useEffect,
  useState
} from "react";

import {
  useParams
} from "next/navigation";

import {
  doc,
  getDoc
} from "firebase/firestore";

import { db } from "@/firebase/config";

interface Product {
  id: string;

  title?: string;

  description?: string;

  image?: string;

  images?: string[];

  price?: number;

  discountPrice?: number;

  category?: string;
}

export default function ProductDetailsPage() {
  const params = useParams();

  const id =
    params?.id as string;

  const [product, setProduct] =
    useState<Product | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function fetchProduct() {
      try {
        if (!id) {
          return;
        }

        console.log(
          "PRODUCT ID:",
          id
        );

        const productRef = doc(
          db,
          "products",
          id
        );

        const snapshot =
          await getDoc(
            productRef
          );

        console.log(
          "EXISTS:",
          snapshot.exists()
        );

        if (
          snapshot.exists()
        ) {
          const data =
            snapshot.data();

          setProduct({
            id: snapshot.id,

            ...data
          });
        }

        setLoading(false);
      } catch (error) {
        console.error(error);

        setLoading(false);
      }
    }

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">

        <h1 className="text-2xl font-black">
          Loading...
        </h1>

      </main>
    );
  }

  if (!product) {
    return (
      <main className="flex min-h-screen items-center justify-center">

        <h1 className="text-2xl font-black text-red-500">

          Product Not Found

        </h1>

      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white p-4">

      <img
        src={
          product.images?.[0] ||
          product.image
        }
        alt={product.title}
        className="
          h-[400px]
          w-full
          rounded-3xl
          object-cover
        "
      />

      <div className="mt-5">

        <p className="text-sm font-bold text-blue-600">

          {product.category}

        </p>

        <h1
          className="
            mt-2
            text-4xl
            font-black
          "
        >

          {product.title}

        </h1>

        <div className="mt-4 flex gap-3">

          <p
            className="
              text-4xl
              font-black
              text-black
            "
          >

            ₹
            {
              product.discountPrice
            }

          </p>

          <p
            className="
              text-2xl
              text-gray-400
              line-through
            "
          >

            ₹
            {product.price}

          </p>

        </div>

        <p className="mt-5 text-gray-600">

          {product.description}

        </p>

      </div>

    </main>
  );
}
