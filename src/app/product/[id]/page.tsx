"use client";

import {
  useEffect,
  useState
} from "react";

import {
  doc,
  getDoc
} from "firebase/firestore";

import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  ShoppingCart,
  Star
} from "lucide-react";

import { db } from "@/firebase/config";

/* ======================================================
TYPES
====================================================== */

interface ProductPageProps {
  params: {
    id: string;
  };
}

interface Product {
  id: string;

  title?: string;

  description?: string;

  images?: string[];

  video?: string;

  category?: string;

  price?: number;

  discountPrice?: number;

  stock?: number;

  rating?: number;

  featured?: boolean;

  visible?: boolean;
}

/* ======================================================
COMPONENT
====================================================== */

export default function ProductDetailsPage({
  params
}: ProductPageProps) {
  const [product, setProduct] =
    useState<Product | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [currentImage, setCurrentImage] =
    useState(0);

  /* ======================================================
  FETCH PRODUCT
  ====================================================== */

  useEffect(() => {
    async function fetchProduct() {
      try {
        const productRef =
          doc(
            db,
            "products",
            params.id
          );

        const snapshot =
          await getDoc(
            productRef
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

  /* ======================================================
  LOADING
  ====================================================== */

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f5f5]">

        <h1 className="text-xl font-black text-gray-500">
          Loading Product...
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

  /* ======================================================
  IMAGES
  ====================================================== */

  const images =
    product.images ||
    [];

  const discount =
    Math.round(
      (((product.price || 0) -
        (product.discountPrice ||
          0)) /
        (product.price || 1)) *
        100
    );

  /* ======================================================
  NEXT IMAGE
  ====================================================== */

  function nextImage() {
    if (
      currentImage <
      images.length - 1
    ) {
      setCurrentImage(
        currentImage + 1
      );
    }
  }

  /* ======================================================
  PREV IMAGE
  ====================================================== */

  function prevImage() {
    if (currentImage > 0) {
      setCurrentImage(
        currentImage - 1
      );
    }
  }

  /* ======================================================
  UI
  ====================================================== */

  return (
    <main className="min-h-screen bg-[#f5f5f5] pb-[120px]">

      {/* ======================================================
      IMAGE SECTION
      ====================================================== */}

      <section className="relative overflow-hidden bg-white">

        {/* MAIN IMAGE */}

        <div className="relative">

          {images.length > 0 ? (
            <img
              src={
                images[
                  currentImage
                ]
              }
              alt={
                product.title
              }
              className="
                h-[420px]
                w-full
                object-cover
                rounded-b-[40px]
              "
            />
          ) : (
            <div
              className="
                flex
                h-[420px]
                items-center
                justify-center
                bg-gray-200
                rounded-b-[40px]
              "
            >

              No Image

            </div>
          )}

          {/* LEFT */}

          {currentImage >
            0 && (
            <button
              onClick={
                prevImage
              }
              className="
                absolute
                left-3
                top-1/2
                flex
                h-10
                w-10
                -translate-y-1/2
                items-center
                justify-center
                rounded-full
                bg-white/80
                shadow-lg
              "
            >

              <ChevronLeft />

            </button>
          )}

          {/* RIGHT */}

          {currentImage <
            images.length -
              1 && (
            <button
              onClick={
                nextImage
              }
              className="
                absolute
                right-3
                top-1/2
                flex
                h-10
                w-10
                -translate-y-1/2
                items-center
                justify-center
                rounded-full
                bg-white/80
                shadow-lg
              "
            >

              <ChevronRight />

            </button>
          )}

          {/* TOP BUTTONS */}

          <div className="absolute right-3 top-3 flex gap-2">

            <button
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-full
                bg-white
                shadow-lg
              "
            >

              <Heart />

            </button>

            <button
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-full
                bg-white
                shadow-lg
              "
            >

              <Share2 />

            </button>

          </div>

          {/* IMAGE COUNT */}

          <div
            className="
              absolute
              bottom-4
              right-4
              rounded-full
              bg-black/70
              px-4
              py-2
              text-sm
              font-bold
              text-white
            "
          >

            {currentImage + 1}
            /
            {images.length}

          </div>

        </div>

        {/* THUMBNAILS */}

        <div className="flex gap-3 overflow-x-auto px-4 py-4">

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
                        ? "border-blue-600"
                        : "border-transparent"
                    }
                  `}
                >

                  <img
                    src={image}
                    alt="thumb"
                    className="
                      h-20
                      w-20
                      object-cover
                    "
                  />

                </button>
              );
            }
          )}

        </div>

      </section>

      {/* ======================================================
      DETAILS
      ====================================================== */}

      <section className="px-4 pt-5">

        {/* CATEGORY */}

        <div
          className="
            inline-flex
            rounded-full
            bg-blue-100
            px-4
            py-2
            text-sm
            font-black
            text-blue-700
          "
        >

          {product.category}

        </div>

        {/* TITLE */}

        <h1
          className="
            mt-4
            text-3xl
            font-black
            leading-tight
            text-gray-900
          "
        >

          {product.title}

        </h1>

        {/* RATING */}

        <div className="mt-4 flex items-center gap-2">

          <div
            className="
              flex
              items-center
              gap-1
              rounded-full
              bg-green-600
              px-3
              py-1
              text-sm
              font-bold
              text-white
            "
          >

            <Star
              size={14}
              fill="white"
            />

            {product.rating}

          </div>

          <p className="text-sm font-semibold text-gray-500">

            Premium Quality

          </p>

        </div>

        {/* PRICE */}

        <div className="mt-5 flex items-center gap-3">

          <p className="text-4xl font-black text-black">

            ₹
            {
              product.discountPrice
            }

          </p>

          <p
            className="
              text-xl
              font-bold
              text-gray-400
              line-through
            "
          >

            ₹
            {product.price}

          </p>

          <p className="text-lg font-black text-green-600">

            {discount}% OFF

          </p>

        </div>

        {/* STOCK */}

        <div className="mt-4">

          <span
            className="
              rounded-full
              bg-green-100
              px-4
              py-2
              text-sm
              font-bold
              text-green-700
            "
          >

            In Stock :
            {" "}
            {product.stock}

          </span>

        </div>

        {/* DESCRIPTION */}

        <div className="mt-8">

          <h2 className="text-xl font-black text-black">

            Product Details

          </h2>

          <p
            className="
              mt-3
              text-[15px]
              leading-7
              text-gray-600
            "
          >

            {
              product.description
            }

          </p>

        </div>

        {/* VIDEO */}

        {product.video && (
          <div className="mt-8">

            <h2 className="mb-3 text-xl font-black">

              Product Video

            </h2>

            <video
              src={product.video}
              controls
              className="
                w-full
                rounded-[28px]
              "
            />

          </div>
        )}

      </section>

      {/* ======================================================
      STICKY BUTTONS
      ====================================================== */}

      <div
        className="
          fixed
          bottom-0
          left-0
          z-50
          flex
          w-full
          gap-3
          border-t
          bg-white
          p-4
        "
      >

        <button
          className="
            flex
            flex-1
            items-center
            justify-center
            gap-2
            rounded-2xl
            bg-black
            py-4
            text-lg
            font-black
            text-white
          "
        >

          <ShoppingCart />

          Cart

        </button>

        <button
          className="
            flex-1
            rounded-2xl
            bg-blue-600
            py-4
            text-lg
            font-black
            text-white
          "
        >

          Buy Now

        </button>

      </div>

    </main>
  );
}
