/* ======================================================
FILE:
src/app/page.tsx

NEW FEATURES ADDED:

✅ Category Name Outside Card
✅ Voice Search Mic
✅ Real Voice Recognition
✅ Category Theme Color From Admin Panel
✅ Product Sync
✅ Product Filter
✅ Product Sort
✅ Firebase Live Sync
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
  Mic,
  MicOff,
  Search,
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

  const [
    search,
    setSearch
  ] = useState("");

  const [
    listening,
    setListening
  ] = useState(false);

  /* ======================================================
  VOICE SEARCH
  ====================================================== */

  function startVoiceSearch() {

    if (
      typeof window ===
      "undefined"
    ) {
      return;
    }

    const SpeechRecognition =
      (
        window as any
      ).SpeechRecognition ||

      (
        window as any
      ).webkitSpeechRecognition;

    if (
      !SpeechRecognition
    ) {

      alert(
        "Voice search not supported"
      );

      return;
    }

    const recognition =
      new SpeechRecognition();

    recognition.lang =
      "en-IN";

    recognition.start();

    setListening(
      true
    );

    recognition.onresult =
      (
        event: any
      ) => {

        const transcript =
          event.results[0][0]
            .transcript;

        setSearch(
          transcript
        );
      };

    recognition.onend =
      () => {

        setListening(
          false
        );
      };
  }

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

      /* SEARCH */

      if (
        search
      ) {

        filtered =
          filtered.filter(
            (product) =>
              product.title
                .toLowerCase()
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
        SEARCH + MIC
        ====================================================== */}

        <section
          className="
            mt-5
            px-4
          "
        >

          <div
            className="
              flex
              items-center
              gap-3
              rounded-3xl
              bg-white
              px-4
              py-4
              shadow-sm
            "
          >

            <Search
              size={20}
              className="
                text-gray-400
              "
            />

            <input
              type="text"

              value={search}

              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }

              placeholder="
                Search products...
              "

              className="
                flex-1
                bg-transparent
                text-sm
                font-semibold
                outline-none
              "
            />

            <button
              onClick={
                startVoiceSearch
              }
              className={`
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-full

                ${
                  listening

                    ? "bg-red-500 text-white"

                    : "bg-indigo-600 text-white"
                }
              `}
            >

              {listening ? (

                <MicOff
                  size={18}
                />

              ) : (

                <Mic
                  size={18}
                />

              )}

            </button>

          </div>

        </section>

        {/* ======================================================
        CATEGORY SECTION
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
                "
              >

                Categories

              </h2>

              <p
                className="
                  text-sm
                  text-gray-500
                "
              >

                Browse categories

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
              gap-5
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
                shrink-0
              "
            >

              <div
                className={`
                  flex
                  h-20
                  w-20
                  items-center
                  justify-center
                  rounded-[28px]
                  text-3xl
                  shadow-sm

                  ${
                    selectedCategory ===
                    "All"

                      ? "bg-indigo-600"

                      : "bg-white"
                  }
                `}
              >

                🛍️

              </div>

              <p
                className={`
                  mt-3
                  text-center
                  text-sm
                  font-black

                  ${
                    selectedCategory ===
                    "All"

                      ? "text-indigo-600"

                      : "text-black"
                  }
                `}
              >

                All

              </p>

            </button>

            {/* DYNAMIC */}

            {categories.map(
              (category) => {

                const active =
                  selectedCategory ===
                  category.title;

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
                      shrink-0
                    "
                  >

                    {/* CARD */}

                    <div
                      style={{
                        background:
                          active

                            ? category.themeColor ||
                              "#4f46e5"

                            : "#ffffff"
                      }}

                      className="
                        flex
                        h-20
                        w-20
                        items-center
                        justify-center
                        overflow-hidden
                        rounded-[28px]
                        shadow-sm
                        transition-all
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

                    {/* NAME OUTSIDE */}

                    <p
                      className={`
                        mt-3
                        w-20
                        truncate
                        text-center
                        text-sm
                        font-black

                        ${
                          active

                            ? "text-indigo-600"

                            : "text-black"
                        }
                      `}
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
                "
              >

                Products

              </h2>

              <p
                className="
                  text-sm
                  text-gray-500
                "
              >

                Live synced products

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

        {/* ======================================================
        FLOATING
        ====================================================== */}

        <WhatsAppButton />

        <BottomNavbar />

      </main>

    </>

  );
}
