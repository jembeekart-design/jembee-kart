"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";

import Link from "next/link";

import { useParams } from "next/navigation";

import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where
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

  const [relatedProducts, setRelatedProducts] =
    useState<Product[]>([]);

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

  const [quantity, setQuantity] =
    useState(1);

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

          const finalProduct = {
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
          };

          setProduct(finalProduct);

          if (data.category) {

            const q = query(
              collection(
                db,
                "products"
              ),
              where(
                "category",
                "==",
                data.category
              )
            );

            const relatedSnap =
              await getDocs(q);

            const related =
              relatedSnap.docs
                .filter(
                  (doc) =>
                    doc.id !==
                    snapshot.id
                )
                .map((doc) => ({
                  id: doc.id,
                  ...doc.data()
                })) as Product[];

            setRelatedProducts(
              related.slice(0, 6)
            );
          }
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
          quantity,
          createdAt: Date.now()
        }
      );

      alert("Added To Cart");

    } catch (error) {

      console.error(error);
    }
  }

  async function toggleWishlist() {

    setWishlist(!wishlist);

    alert(
      !wishlist
        ? "Added To Wishlist"
        : "Removed From Wishlist"
    );
  }

  async function shareProduct() {

    if (!product) return;

    try {

      await navigator.share({
        title: product.title,
        text: product.description,
        url: window.location.href
      });

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

    <main className="min-h-screen bg-[#f6f6f6] pb-[90px]">

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
              onClick={toggleWishlist}
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

            <button
              onClick={shareProduct}
            >
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
                images[
                  currentImage
                ] ||
                "/placeholder.png"
              }
              alt={product.title}
              className="h-[240px] w-full rounded-[18px] bg-gray-100 object-cover"
            />

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

        {/* COUPONS */}

        <div>

          <div className="mb-3 flex items-center justify-between">

            <h2 className="text-[15px] font-black">

              Offers & Coupons

            </h2>

            <button className="text-[11px] font-bold text-purple-600">

              View All

            </button>

          </div>

          <div className="space-y-3">

            {product.coupons?.map(
              (coupon) => (

                <div
                  key={coupon}
                  className="flex items-center justify-between rounded-[16px] border border-dashed border-purple-300 bg-white px-4 py-3 shadow-sm"
                >

                  {/* LEFT */}

                  <div className="min-w-0 flex-1">

                    <h3 className="truncate text-[15px] font-black leading-none">

                      {coupon}

                    </h3>

                    <p className="mt-1 text-[10px] text-gray-500">

                      Extra discount available

                    </p>

                  </div>

                  {/* RIGHT */}

                  <button
                    className="ml-3 shrink-0 rounded-[10px] bg-gradient-to-r from-violet-600 to-fuchsia-500 px-4 py-2 text-[11px] font-bold text-white shadow-sm"
                  >

                    Apply

                  </button>

                </div>

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

    </main>
  );
}
