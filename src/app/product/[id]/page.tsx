"use client";

export const dynamic = "force-dynamic";

import {
  useEffect,
  useMemo,
  useState
} from "react";

import Link from "next/link";

import { useParams } from "next/navigation";

import {
  addDoc,
  collection,
  doc,
  getDoc
} from "firebase/firestore";

import {
  TransformWrapper,
  TransformComponent
} from "react-zoom-pan-pinch";

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

/* ======================================================
TYPES
====================================================== */

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

/* ======================================================
COMPONENT
====================================================== */

export default function ProductPage() {

  const params = useParams();

  const productId =
    Array.isArray(params.id)
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

  const [fullscreenImage, setFullscreenImage] =
    useState(false);

  /* ======================================================
  GET PRODUCT
  ====================================================== */

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

            id:
              snapshot.id,

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

  /* ======================================================
  DISCOUNT
  ====================================================== */

  const discount =
    useMemo(() => {

      if (!product) return 0;

      return Math.round(
        (
          (
            (
              product.price || 0
            ) -
            (
              product.discountPrice || 0
            )
          ) /
          (
            product.price || 1
          )
        ) * 100
      );

    }, [product]);

  /* ======================================================
  DELIVERY DATE
  ====================================================== */

  const deliveryDate =
    useMemo(() => {

      const date = new Date();

      date.setDate(
        date.getDate() + 4
      );

      return date.toDateString();

    }, []);

  /* ======================================================
  ADD TO CART
  ====================================================== */

  async function addToCart() {

    if (!product) return;

    try {

      await addDoc(
        collection(db, "cart"),
        {

          productId:
            product.id,

          title:
            product.title,

          image:
            product.images?.[0],

          price:
            product.discountPrice,

          size:
            selectedSize,

          color:
            selectedColor,

          quantity: 1,

          createdAt:
            Date.now()

        }
      );

      alert(
        "Added To Cart"
      );

    } catch (error) {

      console.error(error);

    }

  }

  /* ======================================================
  LOADING
  ====================================================== */

  if (loading) {

    return (

      <main className="flex min-h-screen items-center justify-center bg-[#f6f6f6]">

        <h1 className="text-sm font-bold">

          Loading...

        </h1>

      </main>

    );

  }

  /* ======================================================
  PRODUCT NOT FOUND
  ====================================================== */

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

  /* ======================================================
  UI
  ====================================================== */

  return (

    <main className="min-h-screen bg-[#f6f6f6] pb-[85px]">

      {/* ======================================================
      TOPBAR
      ====================================================== */}

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

      {/* ======================================================
      CONTENT
      ====================================================== */}

      <section className="space-y-4 px-3 pt-2">

        {/* IMAGE */}

        <div className="rounded-[20px] bg-white p-2.5 shadow-sm">

          <div className="relative overflow-hidden rounded-[18px]">

            <img
              src={
                images[currentImage] ||
                "/placeholder.png"
              }
              alt={
                product.title
              }
              onClick={() =>
                setFullscreenImage(true)
              }
              className="
                h-[240px]
                w-full
                cursor-zoom-in
                rounded-[18px]
                bg-gray-100
                object-cover
              "
            />

            {/* DISCOUNT */}

            <div className="absolute left-2 top-2 rounded-lg bg-red-500 px-2.5 py-1 text-[10px] font-bold text-white">

              {discount}% OFF

            </div>

            {/* WISHLIST */}

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

            {/* LEFT */}

            {
              currentImage > 0 && (

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

              )
            }

            {/* RIGHT */}

            {
              currentImage <
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

              )
            }

            {/* COUNT */}

            <div className="absolute bottom-2 right-2 rounded-full bg-black/70 px-2 py-1 text-[10px] font-bold text-white">

              {currentImage + 1}/
              {images.length}

            </div>

          </div>

          {/* THUMBNAILS */}

          <div className="mt-3 flex gap-2 overflow-x-auto">

            {
              images.map(
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
              )
            }

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

        </div>

      </section>

      {/* ======================================================
      BOTTOM BAR
      ====================================================== */}

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

      {/* ======================================================
      FULLSCREEN IMAGE VIEWER
      ====================================================== */}

      {
        fullscreenImage && (

          <div className="
            fixed
            inset-0
            z-[9999]
            flex
            items-center
            justify-center
            bg-black
          ">

            {/* CLOSE */}

            <button
              onClick={() =>
                setFullscreenImage(false)
              }
              className="
                absolute
                right-4
                top-4
                z-50
                rounded-full
                bg-white
                px-4
                py-2
                text-sm
                font-black
              "
            >

              Close

            </button>

            {/* LEFT */}

            {
              currentImage > 0 && (

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
                    -translate-y-1/2
                    rounded-full
                    bg-white
                    p-3
                  "
                >

                  <ChevronLeft />

                </button>

              )
            }

            {/* RIGHT */}

            {
              currentImage <
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
                    -translate-y-1/2
                    rounded-full
                    bg-white
                    p-3
                  "
                >

                  <ChevronRight />

                </button>

              )
            }

            {/* ZOOM */}

            <TransformWrapper>

              <TransformComponent>

                <img
                  src={
                    images[currentImage]
                  }
                  alt="zoom"
                  className="
                    max-h-screen
                    max-w-full
                    object-contain
                  "
                />

              </TransformComponent>

            </TransformWrapper>

          </div>

        )
      }

    </main>

  );

}
