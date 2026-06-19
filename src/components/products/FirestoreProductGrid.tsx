"use client";

import {
  useEffect,
  useMemo,
  useState
} from "react";

import Link from "next/link";

import {
  collection,
  onSnapshot
} from "firebase/firestore";

import {
  ArrowRight,
  SlidersHorizontal
} from "lucide-react";

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

}

/* ======================================================
COMPONENT
====================================================== */

export default function FirestoreProductGrid() {

  const [products, setProducts] =
    useState<Product[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [sortType, setSortType] =
    useState("featured");

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

                  id:
                    document.id,

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

    return () =>
      unsubscribe();

  }, []);

  /* ======================================================
  SORT
  ====================================================== */

  const sortedProducts =
    useMemo(() => {

      const copied =
        [...products];

      switch (
        sortType
      ) {

        case "price-low":

          return copied.sort(
            (a, b) =>
              Number(
                a.discountPrice ||
                a.price ||
                0
              ) -
              Number(
                b.discountPrice ||
                b.price ||
                0
              )
          );

        case "price-high":

          return copied.sort(
            (a, b) =>
              Number(
                b.discountPrice ||
                b.price ||
                0
              ) -
              Number(
                a.discountPrice ||
                a.price ||
                0
              )
          );

        case "rating":

          return copied.sort(
            (a, b) =>
              Number(
                b.rating || 0
              ) -
              Number(
                a.rating || 0
              )
          );

        default:

          return copied;

      }

    }, [
      products,
      sortType
    ]);

  /* ======================================================
  LOADING
  ====================================================== */

  if (loading) {

    return (

      <div className="flex w-full items-center justify-center py-12">

        <div className="flex flex-col items-center gap-3">

          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

          <p className="text-sm font-black text-gray-500">

            Loading Products...

          </p>

        </div>

      </div>

    );

  }

  /* ======================================================
  UI
  ====================================================== */

  return (

    <section className="w-full bg-[#f4f5f7] px-3 py-3">

      {/* SORT FILTER */}

      <div
        className="
          mb-4
          flex
          items-center
          justify-between
          gap-3
          rounded-[26px]
          bg-white
          p-2
          shadow-sm
        "
      >

        {/* SORT */}

        <button
          onClick={() => {

            if (
              sortType ===
              "featured"
            ) {

              setSortType(
                "price-low"
              );

            } else if (
              sortType ===
              "price-low"
            ) {

              setSortType(
                "price-high"
              );

            } else if (
              sortType ===
              "price-high"
            ) {

              setSortType(
                "rating"
              );

            } else {

              setSortType(
                "featured"
              );

            }

          }}
          className="
            flex
            h-[52px]
            flex-1
            items-center
            justify-center
            gap-2
            rounded-2xl
            bg-[#f8f8f8]
            text-sm
            font-black
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
            h-[52px]
            flex-1
            items-center
            justify-center
            gap-2
            rounded-2xl
            bg-[#f8f8f8]
            text-sm
            font-black
            text-gray-800
          "
        >

          <SlidersHorizontal
            size={18}
          />

          Filter

        </button>

      </div>

      {/* HEADER */}

      <div className="mb-4 flex items-center justify-between">

        <div>

          <h2
            className="
              text-[28px]
              font-black
              leading-none
              text-[#111827]
            "
          >

            Trending Products

          </h2>

          <p
            className="
              mt-1
              text-[12px]
              font-semibold
              text-gray-500
            "
          >

            Best selling products for you

          </p>

        </div>

        {/* VIEW ALL */}

        <Link
          href="/products"
          className="
            flex
            items-center
            gap-2
            rounded-full
            theme-primary-bg
            px-4
            py-2
            text-xs
            font-black
            text-white
            shadow-lg
          "
        >

          View All

          <ArrowRight
            size={14}
          />

        </Link>

      </div>

      {/* PRODUCTS */}

      <div
        className="
          grid
          grid-cols-2
          gap-3

          md:grid-cols-3
          lg:grid-cols-4
          xl:grid-cols-5
        "
      >

        {sortedProducts.map(
          (product) => {

            return (

              <Link
                key={product.id}
                href={`/product/${product.id}`}
                className="block w-full"
              >

                <ProductCard

                  id={product.id}

                  title={
                    product.title
                  }

                  images={
                    product.images ||
                    (
                      product.image
                        ? [
                            product.image
                          ]
                        : []
                    )
                  }

                  price={
                    product.price
                  }

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

          }
        )}

      </div>

    </section>

  );

}
