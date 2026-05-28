/* ======================================================
FILE:
src/app/page.tsx

UPDATED:

✅ Product Image Clickable
✅ Product Name Clickable
✅ Search Bar Removed
✅ Gradient Product Card
✅ Wishlist Button
✅ Category Image Back
✅ Firebase Sync
✅ Category Filter
✅ Product Sort
✅ Responsive UI
====================================================== */

"use client";

export const dynamic = "force-dynamic";

import {
  useEffect,
  useMemo,
  useState
} from "react";

import Link from "next/link";

import {
  collection,
  onSnapshot
} from "firebase/firestore";

import {
  ArrowDownUp,
  Heart,
  SlidersHorizontal
} from "lucide-react";

import { db }
from "@/firebase/config";

import Header
from "@/components/navigation/Header";

import HomepageSlider
from "@/components/homepage/HomepageSlider";

import TipsSection
from "@/components/homepage/TipsSection";

import FooterSection
from "@/components/homepage/FooterSection";

import BottomNavbar
from "@/components/navigation/BottomNavbar";

import WhatsAppButton
from "@/components/navigation/WhatsAppButton";

import PromoBanner
from "@/components/PromoBanner";

/* ======================================================
TYPES
====================================================== */

interface HomepageSection {

  id: string;

  sectionType: string;

  visible: boolean;

  position?: number;

  headerBackgroundColor?: string;

  headerTextColor?: string;

  searchBarColor?: string;

  statusBarColor?: string;
}

interface Category {

  id: string;

  title: string;

  image?: string;

  themeColor?: string;
}

interface Product {

  id: string;

  title: string;

  category: string;

  description?: string;

  price: number;

  discountPrice: number;

  images: string[];

  visible: boolean;
}

/* ======================================================
COMPONENT
====================================================== */

export default function HomePage() {

  /* ======================================================
  STATES
  ====================================================== */

  const [
    sections,
    setSections
  ] = useState<
    HomepageSection[]
  >([]);

  const [
    headerSection,
    setHeaderSection
  ] = useState<
    HomepageSection | undefined
  >(undefined);

  const [
    categories,
    setCategories
  ] = useState<Category[]>([]);

  const [
    products,
    setProducts
  ] = useState<Product[]>([]);

  const [
    selectedCategory,
    setSelectedCategory
  ] = useState("All");

  const [
    sortBy,
    setSortBy
  ] = useState("latest");

  /* ======================================================
  GET HOMEPAGE SECTIONS
  ====================================================== */

  useEffect(() => {

    const unsubscribe =
      onSnapshot(

        collection(
          db,
          "homepage_sections"
        ),

        (snapshot) => {

          const data =
            snapshot.docs.map(
              (document) => {

                return {

                  id:
                    document.id,

                  ...(document.data() as Omit<
                    HomepageSection,
                    "id"
                  >)

                };

              }
            );

          setSections(
            data
          );

          const hero =
            data.find(
              (section) =>
                section.sectionType ===
                "hero"
            );

          setHeaderSection(
            hero
          );

        }
      );

    return () =>
      unsubscribe();

  }, []);

  /* ======================================================
  GET CATEGORIES
  ====================================================== */

  useEffect(() => {

    const unsubscribe =
      onSnapshot(

        collection(
          db,
          "categories"
        ),

        (snapshot) => {

          const data =
            snapshot.docs.map(
              (document) => {

                return {

                  id:
                    document.id,

                  ...(document.data() as Omit<
                    Category,
                    "id"
                  >)

                };

              }
            );

          setCategories(
            data
          );

        }
      );

    return () =>
      unsubscribe();

  }, []);

  /* ======================================================
  GET PRODUCTS
  ====================================================== */

  useEffect(() => {

    const unsubscribe =
      onSnapshot(

        collection(
          db,
          "products"
        ),

        (snapshot) => {

          const data =
            snapshot.docs.map(
              (document) => {

                return {

                  id:
                    document.id,

                  ...(document.data() as Omit<
                    Product,
                    "id"
                  >)

                };

              }
            );

          setProducts(
            data
          );

        }
      );

    return () =>
      unsubscribe();

  }, []);

  /* ======================================================
  FILTER PRODUCTS
  ====================================================== */

  const filteredProducts =
    useMemo(() => {

      let filtered =
        products.filter(
          (product) =>
            product.visible
        );

      /* CATEGORY */

      if (
        selectedCategory !==
        "All"
      ) {

        filtered =
          filtered.filter(
            (product) =>
              product.category ===
              selectedCategory
          );
      }

      /* SORT */

      switch (
        sortBy
      ) {

        case "low":

          filtered.sort(
            (a, b) =>
              (
                a.discountPrice ||
                a.price
              ) -
              (
                b.discountPrice ||
                b.price
              )
          );

          break;

        case "high":

          filtered.sort(
            (a, b) =>
              (
                b.discountPrice ||
                b.price
              ) -
              (
                a.discountPrice ||
                a.price
              )
          );

          break;

        default:

          break;
      }

      return filtered;

    }, [
      products,
      selectedCategory,
      sortBy
    ]);

  /* ======================================================
  UI
  ====================================================== */

  return (

    <>

      <PromoBanner />

      <main
        className="
          min-h-screen
          overflow-x-hidden
          bg-[#f5f5f5]
          pb-32
          pt-[115px]

          md:pt-[150px]
        "
      >

        {/* ======================================================
        HEADER
        ====================================================== */}

        <Header
          headerBackgroundColor={
            headerSection?.headerBackgroundColor
          }
          headerTextColor={
            headerSection?.headerTextColor
          }
          searchBarColor={
            headerSection?.searchBarColor
          }
          statusBarColor={
            headerSection?.statusBarColor
          }
        />

        {/* ======================================================
        HERO
        ====================================================== */}

        <HomepageSlider />

        {/* ======================================================
        CATEGORY SECTION
        ====================================================== */}

        <section
          className="
            mt-8
            px-4
          "
        >

          <div
            className="
              flex
              gap-4
              overflow-x-auto
              pb-2
              scrollbar-hide
            "
          >

            {/* ALL */}

            <button
              onClick={() =>
                setSelectedCategory(
                  "All"
                )
              }
              className="
                flex
                shrink-0
                flex-col
                items-center
              "
            >

              <div
                className={`
                  flex
                  h-20
                  w-20
                  items-center
                  justify-center
                  rounded-full
                  border-4

                  ${
                    selectedCategory ===
                    "All"

                      ? "border-indigo-600"

                      : "border-white"
                  }
                `}
              >

                🛍️

              </div>

              <p
                className="
                  mt-2
                  text-xs
                  font-black
                "
              >

                All

              </p>

            </button>

            {/* CATEGORY */}

            {categories.map(
              (category) => {

                return (

                  <button
                    key={
                      category.id
                    }

                    onClick={() =>
                      setSelectedCategory(
                        category.title
                      )
                    }

                    className="
                      flex
                      shrink-0
                      flex-col
                      items-center
                    "
                  >

                    <div
                      className={`
                        h-20
                        w-20
                        overflow-hidden
                        rounded-full
                        border-4

                        ${
                          selectedCategory ===
                          category.title

                            ? "border-indigo-600"

                            : "border-white"
                        }
                      `}
                    >

                      <img
                        src={
                          category.image ||

                          "https://placehold.co/200x200"
                        }

                        alt=""

                        className="
                          h-full
                          w-full
                          object-cover
                        "
                      />

                    </div>

                    <p
                      className="
                        mt-2
                        w-20
                        truncate
                        text-center
                        text-xs
                        font-black
                      "
                    >

                      {
                        category.title
                      }

                    </p>

                  </button>

                );

              }
            )}

          </div>

        </section>

        {/* ======================================================
        PRODUCTS
        ====================================================== */}

        <section
          className="
            mt-8
            px-4
          "
        >

          {/* TOP */}

          <div
            className="
              mb-5
              flex
              items-center
              justify-between
            "
          >

            <div>

              <h2
                className="
                  text-2xl
                  font-black
                  text-black
                "
              >

                Trending Products

              </h2>

              <p
                className="
                  mt-1
                  text-sm
                  text-gray-500
                "
              >

                Premium live products

              </p>

            </div>

            {/* SORT */}

            <div
              className="
                flex
                items-center
                gap-2
              "
            >

              <div
                className="
                  flex
                  items-center
                  gap-2
                  rounded-2xl
                  bg-white
                  px-3
                  py-2
                "
              >

                <ArrowDownUp
                  size={16}
                />

                <select
                  value={sortBy}

                  onChange={(e) =>
                    setSortBy(
                      e.target.value
                    )
                  }

                  className="
                    bg-transparent
                    text-sm
                    font-bold
                    outline-none
                  "
                >

                  <option value="latest">
                    Latest
                  </option>

                  <option value="low">
                    Price Low
                  </option>

                  <option value="high">
                    Price High
                  </option>

                </select>

              </div>

              <button
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-2xl
                  bg-white
                "
              >

                <SlidersHorizontal
                  size={18}
                />

              </button>

            </div>

          </div>

          {/* PRODUCTS GRID */}

          <div
            className="
              grid
              grid-cols-2
              gap-5
            "
          >

            {filteredProducts.map(
              (product) => {

                return (

                  <div
                    key={
                      product.id
                    }
                  >

                    {/* PRODUCT CLICKABLE */}

                    <Link
                      href={`/product/${product.id}`}
                      className="
                        relative
                        block
                        w-full
                        overflow-hidden
                        rounded-[34px]
                        bg-gradient-to-br
                        from-indigo-500
                        via-purple-500
                        to-pink-500
                        p-[2px]
                        shadow-xl
                      "
                    >

                      <div
                        className="
                          overflow-hidden
                          rounded-[32px]
                          bg-white
                          p-3
                        "
                      >

                        <div
                          className="
                            relative
                            overflow-hidden
                            rounded-[28px]
                            bg-gray-100
                          "
                        >

                          <div
                            className="
                              aspect-square
                            "
                          >

                            <img
                              src={
                                product
                                  .images?.[0] ||

                                "https://placehold.co/600x600"
                              }

                              alt=""

                              className="
                                h-full
                                w-full
                                object-cover
                                transition-transform
                                duration-300
                                hover:scale-110
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
                              h-10
                              w-10
                              items-center
                              justify-center
                              rounded-full
                              bg-white/90
                              shadow-md
                            "
                          >

                            <Heart
                              size={18}
                              className="
                                text-pink-500
                              "
                            />

                          </button>

                        </div>

                      </div>

                    </Link>

                    {/* PRODUCT INFO */}

                    <div
                      className="
                        pt-4
                      "
                    >

                      {/* CATEGORY */}

                      <p
                        className="
                          text-xs
                          font-black
                          uppercase
                          tracking-wide
                          text-indigo-600
                        "
                      >

                        {
                          product.category
                        }

                      </p>

                      {/* PRODUCT NAME */}

                      <Link
                        href={`/product/${product.id}`}
                        className="
                          mt-2
                          block
                        "
                      >

                        <h3
                          className="
                            line-clamp-2
                            text-sm
                            font-black
                            leading-5
                            text-black
                          "
                        >

                          {
                            product.title
                          }

                        </h3>

                      </Link>

                      {/* PRICE */}

                      <div
                        className="
                          mt-3
                          flex
                          items-center
                          gap-2
                        "
                      >

                        <p
                          className="
                            text-xl
                            font-black
                            text-black
                          "
                        >

                          ₹
                          {
                            product.discountPrice ||
                            product.price
                          }

                        </p>

                        {product.discountPrice >
                          0 && (

                          <p
                            className="
                              text-xs
                              font-bold
                              text-gray-400
                              line-through
                            "
                          >

                            ₹
                            {
                              product.price
                            }

                          </p>

                        )}

                      </div>

                    </div>

                  </div>

                );

              }
            )}

          </div>

        </section>

        {/* ======================================================
        OTHER SECTIONS
        ====================================================== */}

        {sections.map(
          (section) => {

            if (
              section.sectionType ===
                "category" ||

              section.sectionType ===
                "products"
            ) {

              return null;
            }

            switch (
              section.sectionType
            ) {

              case "tips":

                return (
                  <TipsSection
                    key={
                      section.id
                    }
                  />
                );

              case "footer":

                return (
                  <FooterSection
                    key={
                      section.id
                    }
                  />
                );

              default:

                return null;
            }

          }
        )}

        {/* FLOATING */}

        <WhatsAppButton />

        <BottomNavbar />

      </main>

    </>

  );

}
