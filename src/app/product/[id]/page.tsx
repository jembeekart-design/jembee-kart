"use client";

import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  addDoc,
  collection,
  doc,
  getDoc
} from "firebase/firestore";

import {
  Heart,
  Minus,
  Plus,
  Share2,
  ShoppingCart,
  Star,
  Truck,
  ShieldCheck,
  ChevronLeft,
  ChevronRight
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

  const [selectedSize, setSelectedSize] =
    useState("");

  const [selectedColor, setSelectedColor] =
    useState("");

  const [wishlist, setWishlist] =
    useState(false);

  const [zoomed, setZoomed] =
    useState(false);

  const [buyAnimation, setBuyAnimation] =
    useState(false);

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
          const data =
            snapshot.data() as Omit<
              Product,
              "id"
            >;

          setProduct({
            id: snapshot.id,

            ...data
          });

          setSelectedSize(
            data.sizes?.[0] ||
              ""
          );

          setSelectedColor(
            data.colors?.[0] ||
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
  CART
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
        "Cart Failed"
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
        "Proceed To Checkout"
      );
    }, 900);
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

        <h1 className="text-xl font-black text-gray-500">
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

  /* ======================================================
  IMAGES
  ====================================================== */

  const images =
    product.images || [];

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
            onClick={() => {
              setZoomed(
                !zoomed
              );
            }}
            className={`
              w-full
              rounded-b-[45px]
              bg-white
              object-cover
              transition-all
              duration-300

              ${
                zoomed
                  ? "h-[520px] scale-125"
                  : "h-[420px]"
              }
            `}
          />

          {/* LEFT */}

          {currentImage >
            0 && (
            <button
              onClick={() => {
                setCurrentImage(
                  currentImage -
                    1
                );
              }}
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
                bg-white
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
              onClick={() => {
                setCurrentImage(
                  currentImage +
                    1
                );
              }}
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
                bg-white
                shadow-lg
              "
            >

              <ChevronRight />

            </button>
          )}

          {/* TOP BUTTONS */}

          <div className="absolute right-4 top-4 flex gap-3">

            <button
              onClick={() => {
                setWishlist(
                  !wishlist
                );
              }}
              className="
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
              className="
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

        <div className="mt-4 flex items-center gap-3">

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

          <p className="font-semibold text-gray-500">

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

          <p className="font-black text-green-600">

            {discount}% OFF

          </p>

        </div>

        {/* DELIVERY */}

        <div
          className="
            mt-5
            flex
            items-center
            gap-3
            rounded-3xl
            bg-white
            p-4
            shadow-sm
          "
        >

          <Truck />

          <div>

            <p className="font-black">
              Delivery By
            </p>

            <p className="text-sm text-gray-500">
              {deliveryDate}
            </p>

          </div>

        </div>

        {/* COD */}

        <div
          className="
            mt-4
            flex
            items-center
            gap-3
            rounded-3xl
            bg-white
            p-4
            shadow-sm
          "
        >

          <ShieldCheck />

          <div>

            <p className="font-black">
              Cash On Delivery
            </p>

            <p className="text-sm text-gray-500">
              Available
            </p>

          </div>

        </div>

        {/* SIZE */}

        <div className="mt-7">

          <h2 className="mb-3 text-xl font-black">
            Select Size
          </h2>

          <div className="flex flex-wrap gap-3">

            {product.sizes?.map(
              (size) => {
                return (
                  <button
                    key={size}
                    onClick={() => {
                      setSelectedSize(
                        size
                      );
                    }}
                    className={`
                      rounded-2xl
                      border
                      px-5
                      py-3
                      font-bold

                      ${
                        selectedSize ===
                        size
                          ? "border-black bg-black text-white"
                          : "bg-white"
                      }
                    `}
                  >

                    {size}

                  </button>
                );
              }
            )}

          </div>

        </div>

        {/* COLOR */}

        <div className="mt-7">

          <h2 className="mb-3 text-xl font-black">
            Select Color
          </h2>

          <div className="flex gap-4">

            {product.colors?.map(
              (color) => {
                return (
                  <button
                    key={color}
                    onClick={() => {
                      setSelectedColor(
                        color
                      );
                    }}
                    style={{
                      background:
                        color
                    }}
                    className={`
                      h-12
                      w-12
                      rounded-full
                      border-4

                      ${
                        selectedColor ===
                        color
                          ? "border-black"
                          : "border-white"
                      }
                    `}
                  />
                );
              }
            )}

          </div>

        </div>

        {/* COUPONS */}

        <div className="mt-7">

          <h2 className="mb-3 text-xl font-black">
            Offers & Coupons
          </h2>

          <div className="space-y-3">

            {product.coupons?.map(
              (coupon) => {
                return (
                  <div
                    key={coupon}
                    className="
                      rounded-3xl
                      border-2
                      border-dashed
                      border-green-500
                      bg-green-50
                      p-4
                    "
                  >

                    <p className="font-black text-green-700">

                      {coupon}

                    </p>

                  </div>
                );
              }
            )}

          </div>

        </div>

        {/* SELLER */}

        <div
          className="
            mt-7
            rounded-[30px]
            bg-white
            p-5
            shadow-sm
          "
        >

          <h2 className="text-xl font-black">
            Seller Details
          </h2>

          <div className="mt-4">

            <p className="text-lg font-black">
              {
                product.seller
                  ?.name
              }
            </p>

            <p className="mt-1 text-gray-500">
              Seller Rating :
              {" "}
              {
                product.seller
                  ?.rating
              }
            </p>

          </div>

        </div>

        {/* VIDEO */}

        {product.video && (
          <div className="mt-7">

            <h2 className="mb-3 text-xl font-black">
              Product Reel
            </h2>

            <video
              src={product.video}
              controls
              autoPlay
              muted
              loop
              className="
                w-full
                rounded-[35px]
              "
            />

          </div>
        )}

        {/* DESCRIPTION */}

        <div
          className="
            mt-7
            rounded-[30px]
            bg-white
            p-5
            shadow-sm
          "
        >

          <h2 className="text-xl font-black">
            Product Details
          </h2>

          <p className="mt-4 leading-7 text-gray-600">

            {
              product.description
            }

          </p>

        </div>

        {/* REVIEWS */}

        <div
          className="
            mt-7
            rounded-[30px]
            bg-white
            p-5
            shadow-sm
          "
        >

          <h2 className="text-xl font-black">
            Customer Reviews
          </h2>

          <div className="mt-5 space-y-5">

            {product.reviews?.map(
              (
                review,
                index
              ) => {
                return (
                  <div
                    key={index}
                    className="border-b pb-4"
                  >

                    <div className="flex items-center gap-2">

                      <p className="font-black">
                        {
                          review.name
                        }
                      </p>

                      <div
                        className="
                          rounded-full
                          bg-green-600
                          px-2
                          py-[2px]
                          text-xs
                          font-bold
                          text-white
                        "
                      >

                        {
                          review.rating
                        }
                        ★

                      </div>

                    </div>

                    <p className="mt-2 text-gray-600">

                      {
                        review.message
                      }

                    </p>

                  </div>
                );
              }
            )}

          </div>

        </div>

      </section>

      {/* ======================================================
      STICKY BUY BAR
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
          onClick={
            addToCart
          }
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

          Add To Cart

        </button>

        <button
          onClick={
            handleBuyNow
          }
          className={`
            flex-1
            rounded-2xl
            py-4
            text-lg
            font-black
            text-white
            transition-all
            duration-300

            ${
              buyAnimation
                ? "scale-95 bg-green-600"
                : "bg-blue-600"
            }
          `}
        >

          {buyAnimation
            ? "Processing..."
            : "Buy Now"}

        </button>

      </div>

    </main>
  );
}
