"use client";

import {
  useEffect,
  useMemo,
  useState
} from "react";

import Link from "next/link";

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
        const productRef = doc(
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

          const finalProduct = {
            id: snapshot.id,

            ...data
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

          /* SIMILAR PRODUCTS */

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

  /* ======================================================
UI
====================================================== */

  return (
    <main className="min-h-screen bg-[#f7f7f7] pb-[120px]">

      {/* ======================================================
TOP BAR
====================================================== */}

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

      {/* ======================================================
IMAGE SECTION
====================================================== */}

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

          {/* DISCOUNT */}

          <div
            className="
              absolute
              left-3
              top-3
              rounded-xl
              bg-red-500
              px-3
              py-2
              text-sm
              font-black
              text-white
            "
          >

            {discount}% OFF

          </div>

          {/* IMAGE COUNT */}

          <div
            className="
              absolute
              bottom-3
              right-3
              rounded-full
              bg-black/70
              px-4
              py-2
              text-white
            "
          >

            {currentImage + 1}
            /
            {images.length}

          </div>

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
                h-12
                w-12
                -translate-y-1/2
                items-center
                justify-center
                rounded-full
                bg-white
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
                h-12
                w-12
                -translate-y-1/2
                items-center
                justify-center
                rounded-full
                bg-white
              "
            >

              <ChevronRight />

            </button>
          )}

        </div>

        {/* THUMBNAILS */}

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

        <p className="font-bold text-purple-600">

          {product.category}

        </p>

        {/* TITLE */}

        <h1 className="mt-2 text-5xl font-black text-black">

          {product.title}

        </h1>

        {/* RATING */}

        <div className="mt-4 flex items-center gap-3">

          <div className="flex items-center gap-1 text-green-600">

            <Star
              fill="green"
              size={18}
            />

            <span className="font-black">
              {product.rating}
            </span>

          </div>

          <span className="text-gray-500">
            (128 Reviews)
          </span>

          <span className="text-gray-400">
            |
          </span>

          <span className="text-gray-500">
            5k+ sold
          </span>

        </div>

        {/* PRICE */}

        <div className="mt-5 flex items-center gap-3">

          <h2 className="text-5xl font-black">

            ₹
            {
              product.discountPrice
            }

          </h2>

          <p className="text-3xl font-bold text-gray-400 line-through">

            ₹
            {product.price}

          </p>

        </div>

        <p className="mt-2 font-bold text-green-600">

          You save ₹
          {(product.price ||
            0) -
            (product.discountPrice ||
              0)}
          {" "}
          (
          {discount}%)

        </p>

        {/* FREE DELIVERY */}

        <div
          className="
            mt-6
            flex
            items-center
            gap-4
            rounded-[28px]
            border
            bg-white
            p-5
          "
        >

          <Truck className="text-purple-600" />

          <div>

            <h3 className="font-black text-purple-600">

              Free Delivery

            </h3>

            <p className="text-gray-500">
              On orders above ₹499
            </p>

          </div>

        </div>

        {/* SIZE */}

        <div className="mt-7">

          <h2 className="mb-4 text-2xl font-black">

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
                      min-w-[60px]
                      rounded-2xl
                      border
                      px-5
                      py-3
                      font-black

                      ${
                        selectedSize ===
                        size
                          ? "bg-purple-600 text-white"
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

          <h2 className="mb-4 text-2xl font-black">

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
                          ? "border-purple-600"
                          : "border-white"
                      }
                    `}
                  />
                );
              }
            )}

          </div>

        </div>

        {/* FEATURES */}

        <div
          className="
            mt-8
            grid
            grid-cols-2
            gap-4
            rounded-[35px]
            bg-white
            p-5
          "
        >

          <div className="flex items-center gap-3">

            <ShieldCheck className="text-green-600" />

            <div>

              <h3 className="font-black">
                100% Original
              </h3>

              <p className="text-sm text-gray-500">
                Authentic Product
              </p>

            </div>

          </div>

          <div className="flex items-center gap-3">

            <Truck className="text-purple-600" />

            <div>

              <h3 className="font-black">
                7 Days Return
              </h3>

              <p className="text-sm text-gray-500">
                Easy Return
              </p>

            </div>

          </div>

          <div className="flex items-center gap-3">

            <CheckCircle2 className="text-blue-600" />

            <div>

              <h3 className="font-black">
                Secure Payment
              </h3>

              <p className="text-sm text-gray-500">
                100% Protected
              </p>

            </div>

          </div>

          <div className="flex items-center gap-3">

            <BadgePercent className="text-orange-600" />

            <div>

              <h3 className="font-black">
                24/7 Support
              </h3>

              <p className="text-sm text-gray-500">
                Always Here
              </p>

            </div>

          </div>

        </div>

        {/* DELIVERY & COD */}

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">

          <div className="rounded-[30px] bg-white p-5">

            <h3 className="font-black">
              Delivery
            </h3>

            <p className="mt-2 text-2xl font-black text-green-600">

              {deliveryDate}

            </p>

          </div>

          <div className="rounded-[30px] bg-white p-5">

            <h3 className="font-black">
              Cash On Delivery
            </h3>

            <p className="mt-2 text-gray-500">
              COD Available
            </p>

          </div>

        </div>

        {/* COUPONS */}

        <div className="mt-8">

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
              (coupon) => {
                return (
                  <div
                    key={coupon}
                    className="
                      rounded-[30px]
                      border-2
                      border-dashed
                      border-purple-300
                      bg-white
                      p-5
                    "
                  >

                    <p className="text-xl font-black text-purple-600">

                      {coupon}

                    </p>

                  </div>
                );
              }
            )}

          </div>

        </div>

        {/* SELLER */}

        <div className="mt-8 rounded-[35px] bg-white p-5">

          <h2 className="text-2xl font-black">

            Seller Details

          </h2>

          <div className="mt-5 flex items-center justify-between">

            <div className="flex items-center gap-4">

              <div
                className="
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-full
                  bg-purple-100
                "
              >

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
                  Seller Rating :
                  {" "}
                  {
                    product.seller
                      ?.rating
                  }
                </p>

              </div>

            </div>

            <button
              className="
                rounded-2xl
                border
                border-purple-500
                px-5
                py-3
                font-black
                text-purple-600
              "
            >

              View Store

            </button>

          </div>

        </div>

        {/* DESCRIPTION */}

        <div className="mt-8 rounded-[35px] bg-white p-5">

          <h2 className="text-2xl font-black">

            Product Details

          </h2>

          <p className="mt-4 leading-8 text-gray-600">

            {
              product.description
            }

          </p>

        </div>

        {/* REVIEWS */}

        <div className="mt-8 rounded-[35px] bg-white p-5">

          <div className="mb-5 flex items-center justify-between">

            <h2 className="text-2xl font-black">

              Customer Reviews

            </h2>

            <button className="font-bold text-purple-600">

              View All

            </button>

          </div>

          <div className="space-y-5">

            {product.reviews?.map(
              (
                review,
                index
              ) => {
                return (
                  <div
                    key={index}
                    className="border-b pb-5"
                  >

                    <div className="flex items-center gap-3">

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
                          py-1
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

                    <p className="mt-3 text-gray-600">

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

        {/* SIMILAR PRODUCTS */}

        <div className="mt-8">

          <h2 className="mb-5 text-2xl font-black">

            Similar Products

          </h2>

          <div className="grid grid-cols-2 gap-4">

            {similarProducts.map(
              (
                item
              ) => {
                return (
                  <Link
                    key={item.id}
                    href={`/product/${item.id}`}
                    className="
                      overflow-hidden
                      rounded-[30px]
                      bg-white
                    "
                  >

                    <img
                      src={
                        item.images?.[0]
                      }
                      alt={
                        item.title
                      }
                      className="
                        h-44
                        w-full
                        object-cover
                      "
                    />

                    <div className="p-4">

                      <h3 className="font-black">

                        {item.title}

                      </h3>

                      <p className="mt-2 text-xl font-black">

                        ₹
                        {
                          item.discountPrice
                        }

                      </p>

                    </div>

                  </Link>
                );
              }
            )}

          </div>

        </div>

      </section>

      {/* ======================================================
BOTTOM BAR
====================================================== */}

      <div
        className="
          fixed
          bottom-0
          left-0
          z-50
          flex
          w-full
          items-center
          gap-3
          border-t
          bg-white
          p-4
        "
      >

        <div>

          <h2 className="text-3xl font-black">

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
            border-2
            py-4
            text-xl
            font-black
          "
        >

          <ShoppingCart />

          Add to Cart

        </button>

        <button
          onClick={
            handleBuyNow
          }
          className={`
            flex-1
            rounded-2xl
            py-4
            text-xl
            font-black
            text-white
            transition-all
            duration-300

            ${
              buyAnimation
                ? "scale-95 bg-green-600"
                : "bg-purple-600"
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
