/* ======================================================
FILE:
src/app/page.tsx
FULL HOMEPAGE WITH:

✅ Category Clickable
✅ Product Sync
✅ Product Filter
✅ Product Sort
✅ Firebase Live Sync
✅ Dynamic Homepage Sections
✅ Mobile Responsive
====================================================== */

"use client";

export const dynamic = "force-dynamic";

import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  collection,
  onSnapshot
} from "firebase/firestore";

import {
  ArrowDownUp,
  ChevronRight,
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

          const sortedData =
            data.sort(
              (a, b) => {

                return (
                  Number(
                    a.position || 0
                  ) -
                  Number(
                    b.position || 0
                  )
                );

              }
            );

          setSections(
            sortedData
          );

          const headerData =
            sortedData.find(
              (section) =>
                section.sectionType ===
                "hero"
            );

          setHeaderSection(
            headerData
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
  FILTER + SORT
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

      switch (sortBy) {

        case "low":

          filtered.sort(
            (a, b) =>
              Number(
                a.discountPrice ||
                a.price
              ) -
              Number(
                b.discountPrice ||
                b.price
              )
          );

          break;

        case "high":

          filtered.sort(
            (a, b) =>
              Number(
                b.discountPrice ||
                b.price
              ) -
              Number(
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
  RENDER SECTION
  ====================================================== */

  function renderSection(
    section: HomepageSection
  ) {

    if (
      !section.visible
    ) {

      return null;

    }

    switch (
      section.sectionType
    ) {

      case "tips":

        return (
          <TipsSection />
        );

      case "footer":

        return (
          <FooterSection />
        );

      default:

        return null;

    }

  }

  /* ======================================================
  UI
  ====================================================== */

  return (

    <>

      <PromoBanner />

      <main
        className="
          min-h-screen
          w-full
          overflow-x-hidden
          bg-[#f3f4f6]
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
        HERO SLIDER
        ====================================================== */}

        <HomepageSlider />

        {/* ======================================================
        CATEGORY SECTION
        ====================================================== */}

        <section
          className="
            mt-6
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

                Categories

              </h2>

              <p
                className="
                  mt-1
                  text-sm
                  text-gray-500
                "
              >

                Shop by category

              </p>

            </div>

            <button
              className="
                flex
                items-center
                gap-1
                text-sm
                font-bold
                text-indigo-600
              "
            >

              View All

              <ChevronRight
                size={16}
              />

            </button>

          </div>

          {/* CATEGORY LIST */}

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
              className={`
                flex
                shrink-0
                flex-col
                items-center
                rounded-3xl
                border
                px-4
                py-4
                transition-all

                ${
                  selectedCategory ===
                  "All"

                    ? "border-indigo-600 bg-indigo-600 text-white"

                    : "border-gray-200 bg-white text-black"
                }
              `}
            >

              <div
                className="
                  flex
                  h-16
                  w-16
                  items-center
                  justify-center
                  rounded-full
                  bg-gray-100
                  text-2xl
                "
              >

                🛍️

              </div>

              <p
                className="
                  mt-3
                  text-sm
                  font-black
                "
              >

                All

              </p>

            </button>

            {/* DYNAMIC */}

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

                    className={`
                      flex
                      shrink-0
                      flex-col
                      items-center
                      rounded-3xl
                      border
                      px-4
                      py-4
                      transition-all

                      ${
                        selectedCategory ===
                        category.title

                          ? "border-indigo-600 bg-indigo-600 text-white"

                          : "border-gray-200 bg-white text-black"
                      }
                    `}
                  >

                    <div
                      className="
                        h-16
                        w-16
                        overflow-hidden
                        rounded-full
                        bg-gray-100
                      "
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
                        mt-3
                        w-20
                        truncate
                        text-center
                        text-sm
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
        PRODUCT SECTION
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

                Products

              </h2>

              <p
                className="
                  mt-1
                  text-sm
                  text-gray-500
                "
              >

                Trending products

              </p>

            </div>

            {/* FILTER */}

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
                  shadow-sm
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
                  shadow-sm
                "
              >

                <SlidersHorizontal
                  size={18}
                />

              </button>

            </div>

          </div>

          {/* PRODUCTS */}

          <div
            className="
              grid
              grid-cols-2
              gap-4
            "
          >

            {filteredProducts.map(
              (product) => {

                return (

                  <div
                    key={
                      product.id
                    }

                    className="
                      overflow-hidden
                      rounded-[30px]
                      bg-white
                      shadow-sm
                    "
                  >

                    {/* IMAGE */}

                    <div
                      className="
                        aspect-square
                        overflow-hidden
                        bg-gray-100
                      "
                    >

                      <img
                        src={
                          product
                            .images?.[0] ||

                          "https://placehold.co/500x500"
                        }

                        alt=""

                        className="
                          h-full
                          w-full
                          object-cover
                        "
                      />

                    </div>

                    {/* CONTENT */}

                    <div
                      className="
                        p-4
                      "
                    >

                      <p
                        className="
                          text-xs
                          font-bold
                          text-indigo-600
                        "
                      >

                        {
                          product.category
                        }

                      </p>

                      <h3
                        className="
                          mt-2
                          line-clamp-2
                          text-sm
                          font-black
                          text-black
                        "
                      >

                        {
                          product.title
                        }

                      </h3>

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
                            text-lg
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

                      {/* BUTTON */}

                      <button
                        className="
                          mt-4
                          w-full
                          rounded-2xl
                          bg-indigo-600
                          py-3
                          text-sm
                          font-black
                          text-white
                        "
                      >

                        Add To Cart

                      </button>

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

            return (

              <div
                key={
                  section.id
                }
              >

                {renderSection(
                  section
                )}

              </div>

            );

          }
        )}

        {/* ======================================================
        FLOATING BUTTONS
        ====================================================== */}

        <WhatsAppButton />

        <BottomNavbar />

      </main>

    </>

  );
}
