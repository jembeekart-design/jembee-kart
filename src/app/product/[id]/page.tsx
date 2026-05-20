"use client";

export const dynamic =
  "force-dynamic";

import {
  useEffect,
  useMemo,
  useState
} from "react";

import Link from "next/link";

import {
  useParams
} from "next/navigation";

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
  Heart,
  Share2,
  ShoppingCart,
  Star,
  Truck,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  BadgePercent,
  Store,
  ArrowLeft,
  CheckCircle2
} from "lucide-react";

import { db } from "@/firebase/config";

/* ======================================================
TYPES
====================================================== */

interface Review {
  name: string;

  rating: number;

  message: string;
}

interface Seller {
  name?: string;

  rating?: number;
}

interface Product {
  id: string;

  title?: string;

  description?: string;

  image?: string;

  images?: string[];

  video?: string;

  category?: string;

  price?: number;

  discountPrice?: number;

  stock?: number;

  rating?: number;

  reviews?: Review[];

  seller?: Seller;

  sizes?: string[];

  colors?: string[];

  coupons?: string[];

  featured?: boolean;

  visible?: boolean;
}

/* ======================================================
COMPONENT
====================================================== */

export default function ProductDetailsPage() {
  const params =
    useParams();

  const productId =
    Array.isArray(
      params.id
    )
      ? params.id[0]
      : params.id;

  const [product, setProduct] =
    useState<Product | null>(
      null
    );

  const [similarProducts, setSimilarProducts] =
    useState<Product[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [currentImage, setCurrentImage] =
    useState(0);

  const [selectedSize, setSelectedSize] =
    useState("");

  const [selectedColor, setSelectedColor] =
    useState("");

  const [wishlist, setWishlist] =
    useState(false);

  const [buyAnimation, setBuyAnimation] =
    useState(false);

  /* ======================================================
FETCH PRODUCT
====================================================== */

  useEffect(() => {
    async function fetchProduct() {
      try {
        if (!productId) {
          return;
        }

        const productRef =
          doc(
            db,
            "products",
            String(productId)
          );

        const snapshot =
          await getDoc(
            productRef
          );

        if (
          snapshot.exists()
        ) {
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
                : []
          };

          setProduct(
            finalProduct
          );

          setSelectedSize(
            data.sizes?.[0] ||
              "M"
          );

          setSelectedColor(
            data.colors?.[0] ||
              "#000000"
          );

          /* ======================================================
SIMILAR PRODUCTS
====================================================== */

          if (
            finalProduct.category
          ) {
            const productsRef =
              collection(
                db,
                "products"
              );

            const q = query(
              productsRef,
              where(
                "category",
                "==",
                finalProduct.category
              )
            );

            const similarSnapshot =
              await getDocs(q);

            const similarData =
              similarSnapshot.docs
                .map(
                  (
                    document
                  ) => {
                    return {
                      id: document.id,

                      ...(document.data() as Omit<
                        Product,
                        "id"
                      >)
                    };
                  }
                )
                .filter(
                  (
                    item
                  ) =>
                    item.id !==
                    finalProduct.id
                )
                .slice(0, 4);

            setSimilarProducts(
              similarData
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

  /* ======================================================
DISCOUNT
====================================================== */

  const discount =
    useMemo(() => {
      if (!product) {
        return 0;
      }

      return Math.round(
        (((product.price ||
          0) -
          (product.discountPrice ||
            0)) /
          (product.price ||
            1)) *
          100
      );
    }, [product]);

  /* ======================================================
DELIVERY DATE
====================================================== */

  const deliveryDate =
    useMemo(() => {
      const date =
        new Date();

      date.setDate(
        date.getDate() + 4
      );

      return date.toDateString();
    }, []);

  /* ======================================================
ADD TO CART
====================================================== */

  async function addToCart() {
    if (!product) {
      return;
    }

    try {
      await addDoc(
        collection(
          db,
          "cart"
        ),
        {
          productId:
            product.id,

          title:
            product.title,

          image:
            product.images?.[0] ||
            "",

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

      alert(
        "Failed"
      );
    }
  }

  /* ======================================================
BUY NOW
====================================================== */

  function handleBuyNow() {
    setBuyAnimation(true);

    setTimeout(() => {
      setBuyAnimation(
        false
      );

      alert(
        "Proceeding To Checkout"
      );
    }, 1200);
  }

  /* ======================================================
SHARE
====================================================== */

  async function handleShare() {
    try {
      await navigator.share({
        title:
          product?.title,

        text:
          product?.description,

        url:
          window.location.href
      });
    } catch (error) {
      console.error(error);
    }
  }

  /* ======================================================
LOADING
====================================================== */

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f5f5]">

        <h1 className="text-2xl font-black">
          Loading...
        </h1>

      </main>
    );
  }

  /* ======================================================
NOT FOUND
====================================================== */

  if (!product) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f5f5]">

        <h1 className="text-2xl font-black text-red-500">
          Product Not Found
        </h1>

      </main>
    );
  }

  const images =
    product.images ||
    [];

  return (
    <main className="min-h-screen bg-[#f7f7f7]">

      <div className="sticky top-0 z-50 flex items-center justify-between bg-white px-4 py-4 shadow-sm">

        <div className="flex items-center gap-4">

          <Link
            href="/"
            className="rounded-full bg-gray-100 p-2"
          >

            <ArrowLeft />

          </Link>

          <h1 className="text-3xl font-black text-purple-600">

            JembeeKart

          </h1>

        </div>

        <div className="flex items-center gap-4">

          <button
            onClick={() => {
              setWishlist(
                !wishlist
              );
            }}
          >

            <Heart
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
            onClick={
              handleShare
            }
          >

            <Share2 />

          </button>

        </div>

      </div>

      <section className="bg-white p-4">

        <div className="relative overflow-hidden rounded-[35px]">

          <img
            src={
              images[
                currentImage
              ] ||
              "/placeholder.png"
            }
            alt={
              product.title
            }
            className="
              h-[420px]
              w-full
              object-cover
            "
          />

          <div className="absolute left-3 top-3 rounded-xl bg-red-500 px-3 py-2 text-sm font-black text-white">

            {discount}% OFF

          </div>

          <div className="absolute bottom-3 right-3 rounded-full bg-black/70 px-4 py-2 text-white">

            {currentImage + 1}
            /
            {images.length}

          </div>

          {currentImage >
            0 && (
            <button
              onClick={() => {
                setCurrentImage(
                  currentImage -
                    1
                );
              }}
              className="absolute left-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white"
            >

              <ChevronLeft />

            </button>
          )}

          {currentImage <
            images.length -
              1 && (
            <button
              onClick={() => {
                setCurrentImage(
                  currentImage +
                    1
                );
              }}
              className="absolute right-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white"
            >

              <ChevronRight />

            </button>
          )}

        </div>

        <div className="mt-4 flex gap-3 overflow-x-auto">

          {images.map(
            (
              image,
              index
            ) => {
              return (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentImage(
                      index
                    );
                  }}
                  className={`
                    overflow-hidden
                    rounded-2xl
                    border-2

                    ${
                      currentImage ===
                      index
                        ? "border-purple-600"
                        : "border-transparent"
                    }
                  `}
                >

                  <img
                    src={image}
                    alt="thumb"
                    className="h-20 w-20 object-cover"
                  />

                </button>
              );
            }
          )}

        </div>

      </section>

    </main>
  );
}
