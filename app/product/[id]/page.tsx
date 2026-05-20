"use client";

import {
  useEffect,
  useState
} from "react";

import Image from "next/image";

import Link from "next/link";

import {
  useParams
} from "next/navigation";

import {
  doc,
  onSnapshot
} from "firebase/firestore";

import {
  Heart,
  Share2,
  ShoppingCart,
  Star
} from "lucide-react";

import { db } from "@/firebase/config";

/* ======================================================
TYPES
====================================================== */

interface Product {
  id: string;

  title?: string;

  description?: string;

  images?: string[];

  videos?: string[];

  category?: string;

  price?: number;

  discountPrice?: number;

  rating?: number;

  reviews?: number;

  stock?: number;

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
    String(params.id);

  const [product, setProduct] =
    useState<Product | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [
    selectedImage,
    setSelectedImage
  ] = useState("");

  /* ======================================================
  GET PRODUCT
  ====================================================== */

  useEffect(() => {
    const unsubscribe =
      onSnapshot(
        doc(
          db,
          "products",
          productId
        ),
        (snapshot) => {
          if (
            snapshot.exists()
          ) {
            const data = {
              id: snapshot.id,

              ...(snapshot.data() as Omit<
                Product,
                "id"
              >)
            };

            setProduct(data);

            setSelectedImage(
              data.images?.[0] ||
                ""
            );
          }

          setLoading(false);
        }
      );

    return () =>
      unsubscribe();
  }, [productId]);

  /* ======================================================
  LOADING
  ====================================================== */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">

        <p className="text-lg font-bold">
          Loading Product...
        </p>

      </div>
    );
  }

  /* ======================================================
  EMPTY
  ====================================================== */

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">

        <p className="text-lg font-bold text-red-500">
          Product Not Found
        </p>

      </div>
    );
  }

  /* ======================================================
  PRICE
  ====================================================== */

  const discount =
    Math.round(
      (((product.price ||
        0) -
        (product.discountPrice ||
          0)) /
        (product.price ||
          1)) *
        100
    );

  /* ======================================================
  UI
  ====================================================== */

  return (
    <main className="min-h-screen bg-[#f1f3f6] pb-32">

      {/* TOP BAR */}

      <div
        className="
          sticky
          top-0
          z-50
          flex
          items-center
          justify-between
          bg-white
          px-4
          py-4
          shadow-sm
        "
      >

        <Link
          href="/"
          className="text-xl font-black"
        >
          ←
        </Link>

        <h1
          className="
            truncate
            px-4
            text-sm
            font-bold
          "
        >
          {product.title}
        </h1>

        <button>
          <Share2 size={20} />
        </button>

      </div>

      {/* IMAGE SECTION */}

      <section className="bg-white p-4">

        {/* MAIN IMAGE */}

        <div
          className="
            relative
            overflow-hidden
            rounded-b-[45px]
            rounded-t-[25px]
            bg-white
          "
        >

          <div className="relative h-[420px] w-full">

            <Image
              src={
                selectedImage
              }
              alt={
                product.title ||
                ""
              }
              fill
              priority
              className="
                object-cover
              "
            />

          </div>

          {/* WISHLIST */}

          <button
            className="
              absolute
              right-3
              top-3
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-full
              bg-white
              shadow-xl
            "
          >

            <Heart
              size={20}
            />

          </button>

        </div>

        {/* THUMBNAILS */}

        <div
          className="
            mt-4
            flex
            gap-3
            overflow-x-auto
            pb-2
          "
        >

          {product.images?.map(
            (
              image,
              index
            ) => {
              return (
                <button
                  key={index}
                  onClick={() => {
                    setSelectedImage(
                      image
                    );
                  }}
                  className={`
                    relative
                    h-24
                    min-w-[90px]
                    overflow-hidden
                    rounded-2xl
                    border-2

                    ${
                      selectedImage ===
                      image
                        ? "border-blue-600"
                        : "border-transparent"
                    }
                  `}
                >

                  <Image
                    src={image}
                    alt=""
                    fill
                    className="object-cover"
                  />

                </button>
              );
            }
          )}

        </div>

      </section>

      {/* PRODUCT INFO */}

      <section className="mt-3 bg-white p-4">

        {/* TITLE */}

        <h1
          className="
            text-xl
            font-black
            leading-tight
            text-black
          "
        >

          {product.title}

        </h1>

        {/* RATING */}

        <div
          className="
            mt-3
            flex
            items-center
            gap-2
          "
        >

          <div
            className="
              flex
              items-center
              gap-1
              rounded-lg
              bg-green-600
              px-2
              py-1
              text-sm
              font-bold
              text-white
            "
          >

            {product.rating}

            <Star
              size={13}
              fill="white"
            />

          </div>

          <p
            className="
              text-sm
              font-semibold
              text-gray-500
            "
          >

            {product.reviews}
            + Ratings

          </p>

        </div>

        {/* PRICE */}

        <div
          className="
            mt-4
            flex
            items-center
            gap-3
          "
        >

          <span
            className="
              text-3xl
              font-black
              text-black
            "
          >

            ₹
            {
              product.discountPrice
            }

          </span>

          <span
            className="
              text-lg
              text-gray-400
              line-through
            "
          >

            ₹
            {product.price}

          </span>

          <span
            className="
              text-lg
              font-black
              text-green-600
            "
          >

            {discount}% OFF

          </span>

        </div>

        {/* DESCRIPTION */}

        <div className="mt-6">

          <h2
            className="
              text-lg
              font-black
            "
          >

            Product Details

          </h2>

          <p
            className="
              mt-3
              text-sm
              leading-7
              text-gray-600
            "
          >

            {
              product.description
            }

          </p>

        </div>

      </section>

      {/* VIDEOS */}

      {product.videos &&
        product.videos.length >
          0 && (
          <section className="mt-3 bg-white p-4">

            <h2
              className="
                mb-4
                text-lg
                font-black
              "
            >

              Product Videos

            </h2>

            <div
              className="
                flex
                gap-4
                overflow-x-auto
              "
            >

              {product.videos.map(
                (
                  video,
                  index
                ) => {
                  return (
                    <video
                      key={index}
                      src={video}
                      controls
                      className="
                        h-60
                        min-w-[220px]
                        rounded-[25px]
                        object-cover
                      "
                    />
                  );
                }
              )}

            </div>

          </section>
        )}

      {/* BOTTOM BUTTONS */}

      <div
        className="
          fixed
          bottom-0
          left-0
          z-50
          flex
          w-full
          bg-white
          p-3
          shadow-[0_-4px_20px_rgba(0,0,0,0.08)]
        "
      >

        {/* CART */}

        <button
          className="
            flex
            flex-1
            items-center
            justify-center
            gap-2
            rounded-l-2xl
            bg-yellow-400
            py-4
            text-sm
            font-black
            text-black
          "
        >

          <ShoppingCart
            size={20}
          />

          Add To Cart

        </button>

        {/* BUY */}

        <button
          className="
            flex-1
            rounded-r-2xl
            bg-orange-500
            py-4
            text-sm
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
