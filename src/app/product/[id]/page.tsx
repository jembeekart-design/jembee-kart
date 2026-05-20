"use client";

import {
  useEffect,
  useState
} from "react";

import {
  doc,
  getDoc
} from "firebase/firestore";

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

  videos?: string[];

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

  const [
    selectedImage,
    setSelectedImage
  ] = useState("");

  /* ======================================================
  GET PRODUCT
  ====================================================== */

  useEffect(() => {
    async function fetchProduct() {
      try {
        const documentRef =
          doc(
            db,
            "products",
            params.id
          );

        const snapshot =
          await getDoc(
            documentRef
          );

        if (
          snapshot.exists()
        ) {
          const productData = {
            id: snapshot.id,

            ...(snapshot.data() as Omit<
              Product,
              "id"
            >)
          };

          setProduct(
            productData
          );

          setSelectedImage(
            productData
              .images?.[0] ||
              ""
          );
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
      <main className="flex min-h-screen items-center justify-center bg-gray-100">

        <h1 className="text-2xl font-black text-gray-500">
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
      <main className="flex min-h-screen items-center justify-center bg-gray-100">

        <h1 className="text-2xl font-black text-red-500">
          Product Not Found
        </h1>

      </main>
    );
  }

  /* ======================================================
  DISCOUNT
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
    <main className="min-h-screen bg-[#f5f5f5] pb-28">

      <div className="mx-auto max-w-7xl">

        {/* MAIN CARD */}

        <div className="bg-white">

          {/* BIG IMAGE */}

          <div
            className="
              relative
              overflow-hidden
              rounded-b-[45px]
              bg-white
            "
          >

            {selectedImage && (
              <img
                src={
                  selectedImage
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
            )}

          </div>

          {/* THUMBNAILS */}

          {product.images &&
            product.images
              .length > 0 && (
              <div
                className="
                  flex
                  gap-3
                  overflow-x-auto
                  px-4
                  py-4
                "
              >

                {product.images.map(
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

                        <img
                          src={
                            image
                          }
                          alt=""
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
            )}

          {/* CONTENT */}

          <div className="px-5 pb-8">

            {/* CATEGORY */}

            <div
              className="
                mb-4
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
                text-3xl
                font-black
                leading-tight
                text-gray-900
              "
            >

              {product.title}

            </h1>

            {/* RATING */}

            <div
              className="
                mt-4
                flex
                items-center
                gap-2
              "
            >

              <span className="text-yellow-500">
                ⭐
              </span>

              <span
                className="
                  text-lg
                  font-bold
                  text-gray-600
                "
              >

                {product.rating}

              </span>

            </div>

            {/* PRICE */}

            <div
              className="
                mt-5
                flex
                items-center
                gap-3
              "
            >

              <span
                className="
                  text-4xl
                  font-black
                  text-blue-600
                "
              >

                ₹
                {
                  product.discountPrice
                }

              </span>

              <span
                className="
                  text-xl
                  font-bold
                  text-gray-400
                  line-through
                "
              >

                ₹
                {product.price}

              </span>

              <span
                className="
                  rounded-full
                  bg-green-100
                  px-3
                  py-1
                  text-sm
                  font-black
                  text-green-700
                "
              >

                {discount}% OFF

              </span>

            </div>

            {/* DESCRIPTION */}

            <p
              className="
                mt-6
                text-base
                leading-8
                text-gray-600
              "
            >

              {
                product.description
              }

            </p>

            {/* STOCK */}

            <div className="mt-6">

              <span
                className="
                  rounded-full
                  bg-green-100
                  px-4
                  py-2
                  text-sm
                  font-black
                  text-green-700
                "
              >

                In Stock :
                {" "}
                {product.stock}

              </span>

            </div>

            {/* VIDEOS */}

            {product.videos &&
              product.videos
                .length > 0 && (
                <div className="mt-8">

                  <h2
                    className="
                      mb-4
                      text-2xl
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
                            key={
                              index
                            }
                            controls
                            className="
                              h-64
                              min-w-[240px]
                              rounded-[28px]
                              object-cover
                            "
                          >

                            <source
                              src={
                                video
                              }
                              type="video/mp4"
                            />

                          </video>
                        );
                      }
                    )}

                  </div>

                </div>
              )}

          </div>

        </div>

      </div>

      {/* FIXED BUTTONS */}

      <div
        className="
          fixed
          bottom-0
          left-0
          z-50
          flex
          w-full
          gap-3
          bg-white
          p-3
          shadow-[0_-4px_20px_rgba(0,0,0,0.1)]
        "
      >

        <button
          className="
            flex-1
            rounded-2xl
            bg-yellow-400
            py-4
            text-lg
            font-black
            text-black
          "
        >

          Add To Cart

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
