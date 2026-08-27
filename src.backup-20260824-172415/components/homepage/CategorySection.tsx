"use client";

import {
  useEffect,
  useState
} from "react";

import {
  collection,
  onSnapshot
} from "firebase/firestore";

import { db } from "@/firebase/config";

/* ======================================================
TYPES
====================================================== */

interface CategoryItem {
  id: string;

  title: string;

  image: string;

  backgroundColor: string;

  textColor: string;

  borderRadius: string;

  cardWidth: string;

  cardHeight: string;

  imageHeight: string;

  titleSize: string;

  visible: boolean;

  position: number;
}

/* ======================================================
COMPONENT
====================================================== */

export default function CategorySection() {
  const [categories, setCategories] =
    useState<CategoryItem[]>([]);

  /* ======================================================
  GET DATA
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
                  id: document.id,

                  ...(document.data() as Omit<
                    CategoryItem,
                    "id"
                  >)
                };
              }
            );

          const filtered =
            data
              .filter(
                (item) =>
                  item.visible
              )
              .sort(
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

          setCategories(
            filtered
          );
        }
      );

    return () =>
      unsubscribe();
  }, []);

  /* ======================================================
  UI
  ====================================================== */

  return (
    <section className="px-5 py-5">

      {/* TITLE */}

      <h2
        className="
          mb-5
          text-3xl
          font-black
          text-[var(--text-color)]
        "
      >
        Shop By Category
      </h2>

      {/* CATEGORY LIST */}

      <div
        className="
          flex
          gap-5
          overflow-x-auto
          scrollbar-hide
        "
      >

        {categories.map(
          (category) => {
            return (
              <div
                key={
                  category.id
                }
                className="
                  flex
                  flex-col
                  items-center
                  gap-2
                  shrink-0
                "
              >

                {/* IMAGE CARD */}

                <div
                  style={{
                    background:
                      category.backgroundColor,

                    borderRadius:
                      category.borderRadius,

                    width:
                      category.cardWidth,

                    height:
                      category.cardHeight
                  }}
                  className="
                    overflow-hidden
                    shadow-lg
                  "
                >

                  {/* IMAGE */}

                  {category.image && (
                    <img
                      src={
                        category.image
                      }
                      alt={
                        category.title
                      }
                      className="
                        h-full
                        w-full
                        object-cover
                      "
                    />
                  )}

                </div>

                {/* CATEGORY TITLE */}

                <p
                  style={{
                    color:
                      category.textColor,

                    fontSize:
                      category.titleSize
                  }}
                  className="
                    max-w-[110px]
                    text-center
                    font-semibold
                    leading-tight
                  "
                >
                  {
                    category.title
                  }
                </p>

              </div>
            );
          }
        )}

      </div>

    </section>
  );
}
