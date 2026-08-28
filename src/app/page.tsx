
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


import FooterSection
from "@/components/homepage/FooterSection";

import BottomNavbar
from "@/components/navigation/BottomNavbar";

import WhatsAppButton
from "@/components/navigation/WhatsAppButton";

import AdSlot from "@/components/ads/AdSlot";

import { useTheme } from "@/context/ThemeContext";
import { useWishlist } from "@/hooks/useWishlist";


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


export default function HomePage() {
  const { theme } = useTheme();
  const { wishlistItems, toggleWishlist } = useWishlist();


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

    const [showFilter, setShowFilter] = useState(false);

  const [
    search,
    setSearch
  ] = useState("");


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
        },
        (error) => {
          console.error("Error fetching homepage sections:", error);
        }
      );

    return () =>
      unsubscribe();

  }, []);


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
        },
        (error) => {
          console.error("Error fetching categories:", error);
        }
      );

    return () =>
      unsubscribe();

  }, []);


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
        },
        (error) => {
          console.error("Error fetching products:", error);
        }
      );

    return () =>
      unsubscribe();

  }, []);


  const filteredProducts =
    useMemo(() => {

      let filtered =
        products.filter(
          (product) =>
            product.visible
        );


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



  return (

    <>


      <main
        className="
          min-h-screen
          overflow-x-hidden
          pb-32
          pt-[130px]

          md:pt-[130px]
        "
        style={{
  backgroundColor: theme.backgroundColor,
  color: theme.textColor,
}}
      >


        <Header
  headerBackgroundColor={theme.headerBackground}
  headerTextColor={theme.headerTextColor}
  searchBarColor={theme.searchBarColor}
  statusBarColor={theme.headerBackground}

  search={search}
  setSearch={setSearch}
/>

        <AdSlot />


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
                    text-[var(--text-color)]
                  "
                >

                  Search Results

                </h2>

                <p
                  className="
                    mt-1
                    text-sm
                    text-[var(--muted-text-color)]
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
                    wishlistItems.includes(
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
    p-[2px]
    shadow-xl
  "
  style={{
    background:
      "linear-gradient(135deg, var(--color-primary), var(--color-secondary), var(--color-primary-button))"
  }}
>

                        <div
                          className="
                            rounded-[34px]
                            bg-[var(--color-card-background)]
                            p-0
                          "
                        >

                          <div
                            className="
                              relative
                              overflow-hidden
                              rounded-[30px]
                              bg-[var(--color-page-background)]
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


                            <button

                              onClick={(
                                event
                              ) => {

                                event.preventDefault();

                                toggleWishlist(product);
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
                                bg-[var(--color-card-background)]/90
                                shadow-lg
                              "
                            >

                              <Heart
                                size={18}
                                className={`
                                  transition-all

                                  ${
                                    isLiked

                                      ? "fill-pink-500 text-[var(--color-danger)]"

                                      : "text-[var(--text-secondary)]"
                                  }
                                `}
                              />

                            </button>

                          </div>

                        </div>

                      </Link>


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
                            text-[var(--primary-color)]
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
                              text-[var(--text-color)]
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
                              text-[var(--text-color)]
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
                                text-[var(--muted-text-color)]
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


            <HomepageSlider />


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
                      bg-[var(--card-color)]
                      text-3xl
                      shadow-lg

                      ${
                        selectedCategory === "All"
  ? ""
  : "border-[var(--border-color)]"
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
                            bg-[var(--card-color)]
                            shadow-lg

                            ${
                              selectedCategory === category.title
  ? ""
  : "border-[var(--border-color)]"
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


        {!search.trim() && (

          <section
            className="
              mt-9
              px-4
            "
          >


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
                  text-[var(--text-color)]
                "
              >

                Trending Products

              </h2>


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
                    bg-[var(--card-color)]
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
                    type="button"
          onClick={() => setShowFilter(true)}
                  className="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-2xl
                    bg-[var(--card-color)]
                    shadow-sm
                  "
                >

                  <SlidersHorizontal
                    size={18}
                  />

                </button>

              </div>

        {showFilter && (
          <div className="mb-5 rounded-2xl bg-[var(--card-color)] p-4 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-[var(--text-primary)]">Filter Products</h3>
              <button
                type="button"
                onClick={() => setShowFilter(false)}
                className="rounded-xl px-3 py-1 text-sm font-semibold bg-[var(--background-color)] text-[var(--text-primary)]"
              >
                Close
              </button>
            </div>
            <p className="mb-2 text-sm font-semibold text-[var(--text-secondary)]">Category</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedCategory("All")}
                className="rounded-xl px-3 py-2 text-sm font-semibold bg-[var(--primary-color)] text-[var(--button-text-color)]"
              >
                All Categories
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setSelectedCategory(category.title || category.id)}
                  className="rounded-xl px-3 py-2 text-sm font-semibold bg-[var(--background-color)] text-[var(--text-primary)]"
                >
                  {category.title}
                </button>
              ))}
            </div>
          </div>
        )}

            </div>


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
                    wishlistItems.includes(
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
    p-[4px]
    shadow-xl
  "
>

                        <div
                          className="
                            rounded-[34px]
                            bg-transparent
                            p-0
                          "
                        >

                            <div
                              className="
                                relative
                                overflow-hidden
                                rounded-[34px]
                                p-[2px]
                              "
                              style={{
                                background:
                                  "linear-gradient(135deg, var(--color-primary), var(--color-secondary), var(--color-primary-button))"
                              }}
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


                              <button

                                onClick={(
                                  event
                                ) => {

                                  event.preventDefault();

                                  toggleWishlist(product);
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
                                  bg-[var(--color-card-background)]/90
                                  shadow-lg
                                "
                              >

                                <Heart
                                  size={18}
                                  className={`
                                    transition-all

                                    ${
                                      isLiked

                                        ? "fill-pink-500 text-[var(--color-danger)]"

                                        : "text-[var(--text-secondary)]"
                                    }
                                  `}
                                />

                              </button>

                            </div>

                        </div>

                      </Link>


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
                            text-[var(--primary-color)]
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
                              text-[var(--text-color)]
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
                              text-[var(--text-color)]
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
                                text-[var(--muted-text-color)]
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


        <WhatsAppButton />

        <BottomNavbar />

      </main>

    </>

  );

}

