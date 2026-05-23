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

import {
  TransformWrapper,
  TransformComponent
} from "react-zoom-pan-pinch";

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
  const [showZoom, setShowZoom] =
  useState(false);

const [touchStart, setTouchStart] =
  useState(0);

const [touchEnd, setTouchEnd] =
  useState(0);

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
        (product.discountPrice || 0)) /
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
      <main className="flex min-h-screen items-center justify-center bg-[#f6f6f6]">
        <h1 className="text-sm font-bold">
          Loading...
        </h1>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f6f6f6]">
        <h1 className="text-sm font-bold text-red-500">
          Product Not Found
        </h1>
      </main>
    );
  }

  const images =
    product.images || [];

  return (

    <main className="min-h-screen bg-[#f6f6f6] pb-[85px]">

      {/* TOPBAR */}

      <div className="sticky top-0 z-50 bg-[#f6f6f6]/90 backdrop-blur-md px-3 pt-3">

        <div className="flex items-center justify-between rounded-[18px] bg-white px-3 py-2.5 shadow-sm">

          <div className="flex items-center gap-2">

            <Link
              href="/"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100"
            >
              <ArrowLeft size={16} />
            </Link>

            <h1 className="text-[18px] font-black text-purple-600">
              JembeeKart
            </h1>

          </div>

          <div className="flex items-center gap-3">

            <button
              onClick={() =>
                setWishlist(!wishlist)
              }
            >
              <Heart
                size={18}
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
              <Share2 size={17} />
            </button>

          </div>

        </div>

      </div>

      <section className="space-y-4 px-3 pt-2">

        {/* IMAGE */}

        <div className="rounded-[20px] bg-white p-2.5 shadow-sm">

          <div className="relative overflow-hidden rounded-[18px]">

<img
  src={
    images[currentImage] ||
    "/placeholder.png"
  }
  alt={product.title}

  onClick={() =>
    setShowZoom(true)
  }

  onTouchStart={(e) =>
    setTouchStart(
      e.targetTouches[0].clientX
    )
  }

  onTouchMove={(e) =>
    setTouchEnd(
      e.targetTouches[0].clientX
    )
  }

  onTouchEnd={() => {

    if (
      touchStart - touchEnd >
      50
    ) {

      if (
        currentImage <
        images.length - 1
      ) {

        setCurrentImage(
          currentImage + 1
        );
      }
    }

    if (
      touchEnd - touchStart >
      50
    ) {

      if (
        currentImage > 0
      ) {

        setCurrentImage(
          currentImage - 1
        );
      }
    }
  }}

  className="
    h-[240px]
    w-full
    rounded-[18px]
    bg-gray-100
    object-cover
    cursor-zoom-in
  "
/>

            <div className="absolute left-2 top-2 rounded-lg bg-red-500 px-2.5 py-1 text-[10px] font-bold text-white">

              {discount}% OFF

            </div>

            <button
              onClick={() =>
                setWishlist(!wishlist)
              }
              className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm"
            >

              <Heart
                size={16}
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

            {currentImage > 0 && (
              <button
                onClick={() =>
                  setCurrentImage(
                    currentImage - 1
                  )
                }
                className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-sm"
              >
                <ChevronLeft size={18} />
              </button>
            )}

            {currentImage <
              images.length - 1 && (
              <button
                onClick={() =>
                  setCurrentImage(
                    currentImage + 1
                  )
                }
                className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-sm"
              >
                <ChevronRight size={18} />
              </button>
            )}

            <div className="absolute bottom-2 right-2 rounded-full bg-black/70 px-2 py-1 text-[10px] font-bold text-white">

              {currentImage + 1}/
              {images.length}

            </div>

          </div>

          {/* THUMBNAILS */}

          <div className="mt-3 flex gap-2 overflow-x-auto">

            {images.map(
              (
                image,
                index
              ) => (
                <button
                  key={index}
                  onClick={() =>
                    setCurrentImage(index)
                  }
                  className={`overflow-hidden rounded-lg border ${
                    currentImage === index
                      ? "border-purple-600"
                      : "border-transparent"
                  }`}
                >

                  <img
                    src={image}
                    alt="thumb"
                    className="h-12 w-12 object-cover"
                  />

                </button>
              )
            )}

          </div>

        </div>

        {/* DETAILS */}

        <div>

          <p className="text-[11px] font-bold text-purple-600">

            {product.category}

          </p>

          <h1 className="mt-1 text-[22px] font-black leading-[26px] text-black">

            {product.title}

          </h1>

          <div className="mt-2 flex items-center gap-2 text-[11px]">

            <div className="flex items-center gap-1 text-green-600">

              <Star
                size={12}
                fill="green"
              />

              <span className="font-bold">

                {product.rating || 4.5}

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

          <div className="mt-3 flex items-center gap-2">

            <h2 className="text-[24px] font-black leading-none">

              ₹{product.discountPrice}

            </h2>

            <p className="text-[15px] font-bold text-gray-400 line-through">

              ₹{product.price}

            </p>

          </div>

          <p className="mt-1 text-[13px] font-bold text-green-600">

            You save ₹
            {(product.price || 0) -
              (product.discountPrice || 0)}
            {" "}
            ({discount}%)

          </p>

        </div>

        {/* DELIVERY */}

        <div className="rounded-[18px] bg-white p-3 shadow-sm">

          <div className="flex items-center gap-3">

            <Truck
              size={18}
              className="text-purple-600"
            />

            <div>

              <h3 className="text-sm font-bold text-purple-600">

                Free Delivery

              </h3>

              <p className="text-[11px] text-gray-500">

                Delivery by {deliveryDate}

              </p>

            </div>

          </div>

        </div>

        {/* SIZE */}

        <div>

          <h2 className="mb-2 text-sm font-bold">

            Select Size

          </h2>

          <div className="flex flex-wrap gap-2">

            {product.sizes?.map(
              (size) => (
                <button
                  key={size}
                  onClick={() =>
                    setSelectedSize(size)
                  }
                  className={`min-w-[46px] rounded-[12px] border px-3 py-1.5 text-[12px] font-bold ${
                    selectedSize === size
                      ? "border-purple-600 bg-purple-600 text-white"
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

        <div>

          <h2 className="mb-2 text-sm font-bold">

            Select Color

          </h2>

          <div className="flex gap-3">

            {product.colors?.map(
              (color) => (
                <button
                  key={color}
                  onClick={() =>
                    setSelectedColor(color)
                  }
                  style={{
                    background:
                      color
                  }}
                  className={`h-8 w-8 rounded-full border-2 ${
                    selectedColor === color
                      ? "border-purple-600"
                      : "border-gray-200"
                  }`}
                />
              )
            )}

          </div>

        </div>

        {/* FEATURES */}

        <div className="grid grid-cols-2 gap-3 rounded-[18px] bg-white p-3 shadow-sm">

          <div className="flex items-center gap-2">

            <ShieldCheck
              size={18}
              className="text-green-600"
            />

            <div>

              <h3 className="text-[12px] font-bold">
                Original
              </h3>

              <p className="text-[10px] text-gray-500">
                Authentic
              </p>

            </div>

          </div>

          <div className="flex items-center gap-2">

            <RotateCcw
              size={18}
              className="text-violet-600"
            />

            <div>

              <h3 className="text-[12px] font-bold">
                7 Day Return
              </h3>

              <p className="text-[10px] text-gray-500">
                Easy Return
              </p>

            </div>

          </div>

          <div className="flex items-center gap-2">

            <BadgeCheck
              size={18}
              className="text-blue-600"
            />

            <div>

              <h3 className="text-[12px] font-bold">
                Secure Payment
              </h3>

              <p className="text-[10px] text-gray-500">
                Protected
              </p>

            </div>

          </div>

          <div className="flex items-center gap-2">

            <Headphones
              size={18}
              className="text-orange-500"
            />

            <div>

              <h3 className="text-[12px] font-bold">
                Support
              </h3>

              <p className="text-[10px] text-gray-500">
                24/7 Help
              </p>

            </div>

          </div>

        </div>

        {/* DELIVERY + COD */}

        <div className="space-y-3">

          <div className="rounded-[18px] bg-white p-4 shadow-sm">

            <div className="flex gap-3">

              <Truck
                size={18}
                className="text-green-600"
              />

              <div>

                <h3 className="text-sm font-bold">
                  Delivery
                </h3>

                <p className="mt-1 text-[18px] font-black text-green-600">

                  {deliveryDate}

                </p>

              </div>

            </div>

          </div>

          <div className="rounded-[18px] bg-white p-4 shadow-sm">

            <div className="flex gap-3">

              <Zap
                size={18}
                className="text-orange-500"
              />

              <div>

                <h3 className="text-sm font-bold">
                  Cash on Delivery
                </h3>

                <p className="text-[11px] text-gray-500">

                  Pay when you receive

                </p>

              </div>

            </div>

          </div>

        </div>

        {/* COUPONS */}

        <div>

          <div className="mb-3 flex items-center justify-between">

            <h2 className="text-[18px] font-black">

              Offers & Coupons

            </h2>

            <button className="text-xs font-bold text-purple-600">

              View All

            </button>

          </div>

          <div className="space-y-2">

            {product.coupons?.map(
              (coupon) => (
                <div
                  key={coupon}
                  className="flex items-center justify-between rounded-[16px] border border-dashed border-purple-300 bg-white px-3 py-3 shadow-sm"
                >

                  <div>

                    <h3 className="text-[14px] font-black">

                      {coupon}

                    </h3>

                    <p className="mt-1 text-[10px] text-gray-500">

                      Extra discount available

                    </p>

                  </div>

                  <button className="rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-500 px-3 py-1.5 text-[10px] font-bold text-white">

                    Apply

                  </button>

                </div>
              )
            )}

          </div>

        </div>

        {/* SELLER */}

        <div className="rounded-[18px] bg-white p-4 shadow-sm">

          <h2 className="text-[18px] font-black">

            Seller Details

          </h2>

          <div className="mt-3 flex items-center justify-between">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">

                <Store
                  size={18}
                  className="text-purple-600"
                />

              </div>

              <div>

                <h3 className="text-[13px] font-black">

                  {product.seller?.name}

                </h3>

                <p className="text-[11px] text-gray-500">

                  {product.seller?.rating}
                  ★ Seller Rating

                </p>

              </div>

            </div>

            <button className="rounded-xl border border-purple-400 px-3 py-2 text-[11px] font-bold text-purple-600">

              View Store

            </button>

          </div>

        </div>

        {/* DESCRIPTION */}

        <div className="rounded-[18px] bg-white p-4 shadow-sm">

          <h2 className="text-[18px] font-black">

            Product Details

          </h2>

          <p className="mt-2 text-[12px] leading-6 text-gray-600">

            {product.description}

          </p>

        </div>

      </section>

      {/* BOTTOM BAR */}

      <div className="fixed bottom-0 left-0 z-50 w-full border-t bg-white px-3 py-2">

        <div className="flex items-center gap-2">

          <div>

            <h2 className="text-[20px] font-black">

              ₹{product.discountPrice}

            </h2>

            <p className="text-[10px] font-bold text-green-600">

              {discount}% OFF

            </p>

          </div>

          <button
            onClick={addToCart}
            className="flex flex-1 items-center justify-center gap-1 rounded-[14px] border bg-white py-2 text-[12px] font-bold"
          >

            <ShoppingCart size={15} />

            Cart

          </button>

          <button className="flex flex-1 items-center justify-center gap-1 rounded-[14px] bg-gradient-to-r from-violet-600 to-fuchsia-500 py-2 text-[12px] font-bold text-white">

            <Zap size={14} />

            Buy Now

          </button>

        </div>

      </div>
      {showZoom && (

  <div className="fixed inset-0 z-[999] bg-white/95 backdrop-blur-sm">

    <button
      onClick={() =>
        setShowZoom(false)
      }
      className="
        absolute
        right-4
        top-4
        z-50
        rounded-full
        bg-white
        p-2
      "
    >

      ✕

    </button>

    <div
  className="
    flex
    h-full
    items-center
    justify-center
  "

  onTouchStart={(e) =>
    setTouchStart(
      e.targetTouches[0].clientX
    )
  }

  onTouchMove={(e) =>
    setTouchEnd(
      e.targetTouches[0].clientX
    )
  }

  onTouchEnd={() => {

    if (
      touchStart - touchEnd >
      50
    ) {

      if (
        currentImage <
        images.length - 1
      ) {

        setCurrentImage(
          currentImage + 1
        );
      }
    }

    if (
      touchEnd - touchStart >
      50
    ) {

      if (
        currentImage > 0
      ) {

        setCurrentImage(
          currentImage - 1
        );
      }
    }
  }}
>

      <TransformWrapper
  pinch={{
    disabled: false
  }}
  doubleClick={{
    disabled: true
  }}
  panning={{
    disabled: true
  }}
>

        <TransformComponent>

          <img
            src={
              images[currentImage]
            }
            alt="zoom"
            className="
  max-h-screen
  w-full
  object-contain
  touch-pan-y
"
          />

        </TransformComponent>

{currentImage > 0 && (

  <button
    onClick={() =>
      setCurrentImage(
        currentImage - 1
      )
    }
    className="
      absolute
      left-3
      top-1/2
      z-50
      flex
      h-10
      w-10
      -translate-y-1/2
      items-center
      justify-center
      rounded-full
      bg-black/50
      text-white
    "
  >

    <ChevronLeft size={22} />

  </button>

)}

{currentImage <
  images.length - 1 && (

  <button
    onClick={() =>
      setCurrentImage(
        currentImage + 1
      )
    }
    className="
      absolute
      right-3
      top-1/2
      z-50
      flex
      h-10
      w-10
      -translate-y-1/2
      items-center
      justify-center
      rounded-full
      bg-black/50
      text-white
    "
  >

    <ChevronRight size={22} />

  </button>

)}

</TransformWrapper>

    </div>

  </div>

)}

    </main>
  );
}
