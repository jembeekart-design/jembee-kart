/* ======================================================
FILE:
src/app/page.tsx
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

import { useTheme } from "@/context/ThemeContext";

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

  rating?: number;

  sold?: number;
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

  const [
    wishlist,
    setWishlist
  ] = useState<string[]>([]);

  const [
    search,
    setSearch
  ] = useState("");

  /* ======================================================
  HOMEPAGE SECTIONS
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
              (document) => ({

                id:
                  document.id,

                ...(document.data() as Omit<
                  HomepageSection,
                  "id"
                >)

              })
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
  CATEGORIES
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
              (document) => ({

                id:
                  document.id,

                ...(document.data() as Omit<
                  Category,
                  "id"
                >)

              })
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
  PRODUCTS
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
              (document) => ({

                id:
                  document.id,

                ...(document.data() as Omit<
                  Product,
                  "id"
                >)

              })
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

      /* CATEGORY FILTER */

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

      /* SEARCH FILTER */

      if (
        search.trim()
      ) {

        filtered =
          filtered.filter(
            (product) =>

              product.title
                ?.toLowerCase()
                .includes(
                  search.toLowerCase()
                ) ||

              product.category
                ?.toLowerCase()
                .includes(
                  search.toLowerCase()
                )
          );
      }

      /* SORT */

      switch (
        sortBy
      ) {

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
      sortBy,
      search
    ]);

  /* ======================================================
  WISHLIST
  ====================================================== */

  function toggleWishlist(
    id: string
  ) {

    if (
      wishlist.includes(id)
    ) {

      setWishlist(
        wishlist.filter(
          (item) =>
            item !== id
        )
      );

    } else {

      setWishlist([
        ...wishlist,
        id
      ]);
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
          overflow-x-hidden
          bg-[#f6f7fb]
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

          search={search}
          setSearch={setSearch}
        />

        {/* ======================================================
        SEARCH PRODUCTS
        HEADER KE NICHE
        ====================================================== */}

        {search.trim() ? (

          <section
            className="
              px-4
              pt-6
            "
          >

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

                  Search Results

                </h2>

                <p
                  className="
                    mt-1
                    text-sm
                    text-gray-500
                  "
                >

                  {
                    filteredProducts.length
                  }
                  {" "}
                  products found

                </p>

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

                  const isLiked =
                    wishlist.includes(
                      product.id
                    );

                  return (

                    <div
                      key={
                        product.id
                      }
                    >

                      <Link
                        href={`/product/${product.id}`}
                        className="
                          group
                          relative
                          block
                          overflow-hidden
                          rounded-[36px]
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
                            rounded-[34px]
                            bg-white
                            p-3
                          "
                        >

                          <div
                            className="
                              relative
                              overflow-hidden
                              rounded-[30px]
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
                                  product.images?.[0] ||

                                  "https://placehold.co/600x600"
                                }

                                alt=""

                                className="
                                  h-full
                                  w-full
                                  object-cover
                                  transition-all
                                  duration-500

                                  group-hover:scale-110
                                "
                              />

                            </div>

                            {/* WISHLIST */}

                            <button

                              onClick={(
                                event
                              ) => {

                                event.preventDefault();

                                toggleWishlist(
                                  product.id
                                );
                              }}

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
                                shadow-lg
                              "
                            >

                              <Heart
                                size={18}
                                className={`
                                  transition-all

                                  ${
                                    isLiked

                                      ? "fill-pink-500 text-pink-500"

                                      : "text-gray-600"
                                  }
                                `}
                              />

                            </button>

                          </div>

                        </div>

                      </Link>

                      {/* DETAILS */}

                      <div
                        className="
                          px-1
                          pt-4
                        "
                      >

                        <p
                          className="
                            text-[11px]
                            font-black
                            uppercase
                            tracking-[1px]
                            text-indigo-600
                          "
                        >

                          {
                            product.category
                          }

                        </p>

                        <Link
                          href={`/product/${product.id}`}
                        >

                          <h3
                            className="
                              mt-2
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

        ) : (

          <>

            {/* HERO */}

            <HomepageSlider />

            {/* CATEGORY SECTION */}

            <section
              className="
                mt-7
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
                      border-[4px]
                      bg-white
                      text-3xl
                      shadow-lg

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

                {/* CATEGORIES */}

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
                            border-[4px]
                            bg-white
                            shadow-lg

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

          </>

        )}

        {/* ======================================================
        PRODUCTS SECTION
        ====================================================== */}

        {!search.trim() && (

          <section
            className="
              mt-9
              px-4
            "
          >

            {/* TOP */}

            <div
              className="
                mb-6
                flex
                items-center
                justify-between
              "
            >

              <h2
                className="
                  text-2xl
                  font-black
                  text-black
                "
              >

                Trending Products

              </h2>

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

            {/* PRODUCT GRID */}

            <div
              className="
                grid
                grid-cols-2
                gap-5
              "
            >

              {filteredProducts.map(
                (product) => {

                  const isLiked =
                    wishlist.includes(
                      product.id
                    );

                  return (

                    <div
                      key={
                        product.id
                      }
                    >

                      <Link
                        href={`/product/${product.id}`}
                        className="
                          group
                          relative
                          block
                          overflow-hidden
                          rounded-[36px]
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
                            rounded-[34px]
                            bg-white
                            p-3
                          "
                        >

                            <div
                              className="
                                relative
                                overflow-hidden
                                rounded-[30px]
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
                                    product.images?.[0] ||

                                    "https://placehold.co/600x600"
                                  }

                                  alt=""

                                  className="
                                    h-full
                                    w-full
                                    object-cover
                                    transition-all
                                    duration-500

                                    group-hover:scale-110
                                  "
                                />

                              </div>

                              {/* WISHLIST */}

                              <button

                                onClick={(
                                  event
                                ) => {

                                  event.preventDefault();

                                  toggleWishlist(
                                    product.id
                                  );
                                }}

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
                                  shadow-lg
                                "
                              >

                                <Heart
                                  size={18}
                                  className={`
                                    transition-all

                                    ${
                                      isLiked

                                        ? "fill-pink-500 text-pink-500"

                                        : "text-gray-600"
                                    }
                                  `}
                                />

                              </button>

                            </div>

                        </div>

                      </Link>

                      {/* DETAILS */}

                      <div
                        className="
                          px-1
                          pt-4
                        "
                      >

                        <p
                          className="
                            text-[11px]
                            font-black
                            uppercase
                            tracking-[1px]
                            text-indigo-600
                          "
                        >

                          {
                            product.category
                          }

                        </p>

                        <Link
                          href={`/product/${product.id}`}
                        >

                          <h3
                            className="
                              mt-2
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

        )}

        {/* OTHER SECTIONS */}

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
