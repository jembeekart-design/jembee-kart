"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useRef, useState } from "react";
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

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const zoomSwipeStart = useRef(0);
  const zoomSwipeEnd = useRef(0);

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

              onTouchStart={(e) => {
                touchStartX.current =
                  e.targetTouches[0].clientX;
              }}

              onTouchMove={(e) => {
                touchEndX.current =
                  e.targetTouches[0].clientX;
              }}

              onTouchEnd={() => {

                const distance =
                  touchStartX.current -
                  touchEndX.current;

                if (distance > 50) {

                  setCurrentImage((prev) =>
                    prev < images.length - 1
                      ? prev + 1
                      : prev
                  );
                }

                if (distance < -50) {

                  setCurrentImage((prev) =>
                    prev > 0
                      ? prev - 1
                      : prev
                  );
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

      {/* ZOOM VIEW */}

      {showZoom && (

        <div className="fixed inset-0 z-[999] bg-black">

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
              text-black
            "
          >

            ✕

          </button>

          <div
            className="
              flex
              h-full
              w-full
              items-center
              justify-center
            "
          >

            <TransformWrapper

              initialScale={1}

              minScale={1}

              maxScale={5}

              centerOnInit

              doubleClick={{
                disabled: true
              }}

              wheel={{
                disabled: true
              }}

              pinch={{
                step: 5
              }}

              panning={{
                disabled: false
              }}

            >

              {() => (

                <>

                  <TransformComponent
                    wrapperClass="
                      !w-full
                      !h-full
                    "
                    contentClass="
                      flex
                      items-center
                      justify-center
                      w-full
                      h-full
                    "
                  >

                    <img
                      src={
                        images[currentImage]
                      }
                      alt="zoom"

                      onTouchStart={(e) => {
                        zoomSwipeStart.current =
                          e.targetTouches[0].clientX;
                      }}

                      onTouchMove={(e) => {
                        zoomSwipeEnd.current =
                          e.targetTouches[0].clientX;
                      }}

                      onTouchEnd={() => {

                        const distance =
                          zoomSwipeStart.current -
                          zoomSwipeEnd.current;

                        if (distance > 80) {

                          setCurrentImage((prev) =>
                            prev < images.length - 1
                              ? prev + 1
                              : prev
                          );
                        }

                        if (distance < -80) {

                          setCurrentImage((prev) =>
                            prev > 0
                              ? prev - 1
                              : prev
                          );
                        }
                      }}

                      className="
                        max-h-screen
                        w-full
                        object-contain
                        select-none
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
                        bg-white/20
                        text-white
                        backdrop-blur-md
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
                        bg-white/20
                        text-white
                        backdrop-blur-md
                      "
                    >

                      <ChevronRight size={22} />

                    </button>

                  )}

                </>

              )}

            </TransformWrapper>

          </div>

        </div>

      )}

    </main>
  );
}
