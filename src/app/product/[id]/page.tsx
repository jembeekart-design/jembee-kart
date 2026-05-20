"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";

import Link from "next/link";

import { useParams } from "next/navigation";

import {
  addDoc,
  collection,
  doc,
  getDoc
} from "firebase/firestore";

import {
  ArrowLeft,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Headphones,
  Heart,
  RotateCcw,
  Share2,
  ShieldCheck,
  ShoppingCart,
  Star,
  Store,
  Truck,
  Zap
} from "lucide-react";

import { db } from "@/firebase/config";

interface Product {
  id: string;
  title?: string;
  description?: string;
  image?: string;
  images?: string[];
  category?: string;
  price?: number;
  discountPrice?: number;
  rating?: number;
  stock?: number;
  sizes?: string[];
  colors?: string[];
  coupons?: string[];
  seller?: {
    name?: string;
    rating?: number;
  };
}

export default function ProductPage() {
  const params = useParams();

  const productId = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  const [product, setProduct] =
    useState<Product | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [currentImage, setCurrentImage] =
    useState(0);

  const [selectedSize, setSelectedSize] =
    useState("M");

  const [selectedColor, setSelectedColor] =
    useState("#7c3aed");

  const [wishlist, setWishlist] =
    useState(false);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const productRef = doc(
          db,
          "products",
          String(productId)
        );

        const snapshot =
          await getDoc(productRef);

        if (snapshot.exists()) {
          const data =
            snapshot.data() as Omit<
              Product,
              "id"
            >;

          setProduct({
            id: snapshot.id,

            ...data,

            images:
              data.images?.length
                ? data.images
                : data.image
                ? [data.image]
                : [],

            sizes:
              data.sizes || [
                "S",
                "M",
                "L",
                "XL",
                "XXL"
              ],

            colors:
              data.colors || [
                "#ffffff",
                "#000000",
                "#93c5fd",
                "#d6c6a5"
              ],

            coupons:
              data.coupons || [
                "SAVE50",
                "FREESHIP",
                "EXTRA100"
              ],

            seller:
              data.seller || {
                name:
                  "JembeeKart Official",
                rating: 4.6
              }
          });
        }

        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    }

    fetchProduct();
  }, [productId]);

  const discount = useMemo(() => {
    if (!product) return 0;

    return Math.round(
      (((product.price || 0) -
        (product.discountPrice ||
          0)) /
        (product.price || 1)) *
        100
    );
  }, [product]);

  const deliveryDate = useMemo(() => {
    const date = new Date();

    date.setDate(
      date.getDate() + 4
    );

    return date.toDateString();
  }, []);

  async function addToCart() {
    if (!product) return;

    try {
      await addDoc(
        collection(db, "cart"),
        {
          productId: product.id,
          title: product.title,
          image:
            product.images?.[0],
          price:
            product.discountPrice,
          size: selectedSize,
          color: selectedColor,
          quantity: 1,
          createdAt: Date.now()
        }
      );

      alert("Added To Cart");
    } catch (error) {
      console.error(error);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f5f5]">
        <h1 className="text-xl font-bold">
          Loading...
        </h1>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f5f5]">
        <h1 className="text-xl font-bold text-red-500">
          Product Not Found
        </h1>
      </main>
    );
  }

  const images =
    product.images || [];

  return (
    <main className="min-h-screen bg-[#f6f6f6] pb-[110px]">

      {/* TOPBAR */}

      <div className="sticky top-0 z-50 bg-[#f6f6f6] p-3">

        <div className="flex items-center justify-between rounded-[22px] bg-white px-4 py-3 shadow-sm">

          <div className="flex items-center gap-3">

            <Link
              href="/"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100"
            >
              <ArrowLeft size={22} />
            </Link>

            <h1 className="text-2xl font-black text-purple-600">
              JembeeKart
            </h1>

          </div>

          <div className="flex items-center gap-4">

            <button
              onClick={() =>
                setWishlist(
                  !wishlist
                )
              }
            >
              <Heart
                size={24}
                fill={
                  wishlist
                    ? "red"
                    : "transparent"
                }
                className={
                  wishlist
                    ? "text-red-500"
                    : ""
                }
              />
            </button>

            <button>
              <Share2 size={22} />
            </button>

          </div>

        </div>

      </div>

      <section className="px-3">

        {/* IMAGE CARD */}

        <div className="rounded-[28px] bg-white p-3 shadow-sm">

          <div className="relative overflow-hidden rounded-[24px]">

            <img
              src={
                images[
                  currentImage
                ] ||
                "/placeholder.png"
              }
              alt={product.title}
              className="h-[320px] w-full object-cover"
            />

            <div className="absolute left-3 top-3 rounded-xl bg-red-500 px-3 py-2 text-sm font-bold text-white">

              {discount}% OFF

            </div>

            <button
              onClick={() =>
                setWishlist(
                  !wishlist
                )
              }
              className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-white"
            >

              <Heart
                size={22}
                fill={
                  wishlist
                    ? "red"
                    : "transparent"
                }
                className={
                  wishlist
                    ? "text-red-500"
                    : ""
                }
              />

            </button>

            {currentImage >
              0 && (
              <button
                onClick={() =>
                  setCurrentImage(
                    currentImage -
                      1
                  )
                }
                className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white"
              >
                <ChevronLeft size={24} />
              </button>
            )}

            {currentImage <
              images.length -
                1 && (
              <button
                onClick={() =>
                  setCurrentImage(
                    currentImage +
                      1
                  )
                }
                className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white"
              >
                <ChevronRight size={24} />
              </button>
            )}

            <div className="absolute bottom-3 right-3 rounded-full bg-black/70 px-3 py-1 text-sm font-bold text-white">

              {currentImage + 1}/
              {
                images.length
              }

            </div>

          </div>

          {/* THUMBNAILS */}

          <div className="mt-4 flex gap-3 overflow-x-auto pb-1">

            {images.map(
              (
                image,
                index
              ) => (
                <button
                  key={index}
                  onClick={() =>
                    setCurrentImage(
                      index
                    )
                  }
                  className={`overflow-hidden rounded-2xl border-2 ${
                    currentImage ===
                    index
                      ? "border-purple-600"
                      : "border-transparent"
                  }`}
                >

                  <img
                    src={image}
                    alt="thumb"
                    className="h-16 w-16 object-cover"
                  />

                </button>
              )
            )}

          </div>

        </div>

        {/* DETAILS */}

        <div className="mt-5">

          <p className="text-base font-bold text-purple-600">

            {
              product.category
            }

          </p>

          <h1 className="mt-1 text-3xl font-black leading-tight">

            {product.title}

          </h1>

          <div className="mt-3 flex items-center gap-2 text-sm">

            <div className="flex items-center gap-1 text-green-600">

              <Star
                size={16}
                fill="green"
              />

              <span className="font-bold">

                {product.rating ||
                  4.5}

              </span>

            </div>

            <span className="text-gray-500">

              (128 Reviews)

            </span>

            <span className="text-gray-300">

              |

            </span>

            <span className="text-gray-500">

              5k+ sold

            </span>

          </div>

          {/* PRICE */}

          <div className="mt-4 flex items-center gap-3">

            <h2 className="text-3xl font-black">

              ₹
              {
                product.discountPrice
              }

            </h2>

            <p className="text-xl font-bold text-gray-400 line-through">

              ₹
              {product.price}

            </p>

          </div>

          <p className="mt-1 text-lg font-bold text-green-600">

            You save ₹
            {(product.price ||
              0) -
              (product.discountPrice ||
                0)}
            {" "}
            ({discount}%)

          </p>

          {/* DELIVERY */}

          <div className="mt-5 flex items-center gap-3 rounded-[22px] border bg-white p-4">

            <Truck className="text-purple-600" />

            <div>

              <h3 className="text-lg font-bold text-purple-600">

                Free Delivery

              </h3>

              <p className="text-sm text-gray-500">

                On orders above ₹499

              </p>

            </div>

          </div>

          {/* SIZE */}

          <div className="mt-6">

            <h2 className="mb-3 text-2xl font-bold">

              Select Size

            </h2>

            <div className="flex flex-wrap gap-3">

              {product.sizes?.map(
                (size) => (
                  <button
                    key={size}
                    onClick={() =>
                      setSelectedSize(
                        size
                      )
                    }
                    className={`min-w-[60px] rounded-2xl border px-5 py-3 text-base font-bold ${
                      selectedSize ===
                      size
                        ? "bg-purple-600 text-white"
                        : "bg-white"
                    }`}
                  >

                    {size}

                  </button>
                )
              )}

            </div>

          </div>

          {/* COLORS */}

          <div className="mt-6">

            <h2 className="mb-3 text-2xl font-bold">

              Select Color

            </h2>

            <div className="flex gap-4">

              {product.colors?.map(
                (color) => (
                  <button
                    key={color}
                    onClick={() =>
                      setSelectedColor(
                        color
                      )
                    }
                    style={{
                      background:
                        color
                    }}
                    className={`h-12 w-12 rounded-full border-[3px] ${
                      selectedColor ===
                      color
                        ? "border-purple-600"
                        : "border-gray-200"
                    }`}
                  />
                )
              )}

            </div>

          </div>

        </div>

        {/* FEATURES */}

        <div className="mt-6 grid grid-cols-2 gap-4 rounded-[24px] bg-white p-4 shadow-sm">

          <div className="flex items-center gap-3">

            <ShieldCheck className="text-green-600" />

            <div>

              <h3 className="font-bold">
                100% Original
              </h3>

              <p className="text-sm text-gray-500">
                Authentic
              </p>

            </div>

          </div>

          <div className="flex items-center gap-3">

            <RotateCcw className="text-violet-600" />

            <div>

              <h3 className="font-bold">
                7 Days Return
              </h3>

              <p className="text-sm text-gray-500">
                Easy Returns
              </p>

            </div>

          </div>

          <div className="flex items-center gap-3">

            <BadgeCheck className="text-blue-600" />

            <div>

              <h3 className="font-bold">
                Secure Payment
              </h3>

              <p className="text-sm text-gray-500">
                Protected
              </p>

            </div>

          </div>

          <div className="flex items-center gap-3">

            <Headphones className="text-orange-500" />

            <div>

              <h3 className="font-bold">
                24/7 Support
              </h3>

              <p className="text-sm text-gray-500">
                Always Here
              </p>

            </div>

          </div>

        </div>

        {/* DELIVERY */}

        <div className="mt-6 space-y-4">

          <div className="rounded-[24px] bg-white p-5 shadow-sm">

            <div className="flex gap-3">

              <Truck className="text-green-600" />

              <div>

                <h3 className="font-bold">
                  Delivery
                </h3>

                <p className="mt-2 text-2xl font-black text-green-600">

                  {deliveryDate}

                </p>

                <p className="text-gray-500">

                  Order within 3h 45m

                </p>

              </div>

            </div>

          </div>

          <div className="rounded-[24px] bg-white p-5 shadow-sm">

            <div className="flex gap-3">

              <Zap className="text-orange-500" />

              <div>

                <h3 className="font-bold">
                  Cash on Delivery
                </h3>

                <p className="mt-2 text-gray-500">
                  Pay when you receive
                </p>

              </div>

            </div>

          </div>

        </div>

        {/* COUPONS */}

        <div className="mt-7">

          <div className="mb-4 flex items-center justify-between">

            <h2 className="text-2xl font-black">

              Offers & Coupons

            </h2>

            <button className="font-bold text-purple-600">

              View All

            </button>

          </div>

          <div className="space-y-4">

            {product.coupons?.map(
              (coupon) => (
                <div
                  key={coupon}
                  className="rounded-[24px] border border-dashed border-purple-300 bg-white p-5"
                >

                  <h3 className="text-2xl font-black">

                    {coupon}

                  </h3>

                  <p className="mt-2 text-gray-500">

                    Get extra discount on orders

                  </p>

                  <button className="mt-4 rounded-xl bg-purple-600 px-5 py-2 font-bold text-white">

                    Apply

                  </button>

                </div>
              )
            )}

          </div>

        </div>

        {/* SELLER */}

        <div className="mt-7 rounded-[24px] bg-white p-5 shadow-sm">

          <h2 className="text-2xl font-black">

            Seller Details

          </h2>

          <div className="mt-4 flex items-center justify-between">

            <div className="flex items-center gap-4">

              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-purple-100">

                <Store className="text-purple-600" />

              </div>

              <div>

                <h3 className="text-xl font-black">

                  {
                    product.seller
                      ?.name
                  }

                </h3>

                <p className="text-gray-500">

                  {
                    product.seller
                      ?.rating
                  }
                  ★ Seller Rating

                </p>

              </div>

            </div>

            <button className="rounded-2xl border border-purple-500 px-4 py-3 font-bold text-purple-600">

              View Store

            </button>

          </div>

        </div>

        {/* DESCRIPTION */}

        <div className="mt-7 rounded-[24px] bg-white p-5 shadow-sm">

          <h2 className="text-2xl font-black">

            Product Details

          </h2>

          <p className="mt-4 leading-7 text-gray-600">

            {
              product.description
            }

          </p>

        </div>

      </section>

      {/* BOTTOM BAR */}

      <div className="fixed bottom-0 left-0 z-50 w-full border-t bg-white p-3">

        <div className="flex items-center gap-3">

          <div>

            <h2 className="text-2xl font-black">

              ₹
              {
                product.discountPrice
              }

            </h2>

            <p className="font-bold text-green-600">

              {discount}% OFF

            </p>

          </div>

          <button
            onClick={addToCart}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 py-3 text-base font-bold"
          >

            <ShoppingCart size={20} />

            Add to Cart

          </button>

          <button className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-500 py-3 text-base font-bold text-white">

            <Zap size={20} />

            Buy Now

          </button>

        </div>

      </div>

    </main>
  );
}
