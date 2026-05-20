"use client";

import {
  useState
} from "react";

import {
  ChevronDown,
  ChevronUp,
  Grid3X3,
  Plus
} from "lucide-react";

/* ======================================================
TYPES
====================================================== */

interface CategoryItem {
  id: string;

  name: string;

  image: string;

  backgroundColor: string;

  textColor: string;

  visible: boolean;
}

/* ======================================================
COMPONENT
====================================================== */

export default function CategoryAdmin() {
  const [categories, setCategories] =
    useState<CategoryItem[]>([
      {
        id: "1",

        name: "Fashion",

        image:
          "https://images.unsplash.com/photo-1441986300917-64674bd600d8",

        backgroundColor:
          "#ffffff",

        textColor:
          "#000000",

        visible: true
      },

      {
        id: "2",

        name: "Electronics",

        image:
          "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9",

        backgroundColor:
          "#ffffff",

        textColor:
          "#000000",

        visible: true
      }
    ]);

  /* ======================================================
  EXPAND STATE
  ====================================================== */

  const [
    expandedCategories,
    setExpandedCategories
  ] = useState<{
    [key: string]: boolean;
  }>({});

  /* ======================================================
  TOGGLE
  ====================================================== */

  function toggleCategory(
    id: string
  ) {
    setExpandedCategories(
      (previous) => {
        return {
          ...previous,

          [id]:
            !previous[id]
        };
      }
    );
  }

  /* ======================================================
  UPDATE FIELD
  ====================================================== */

  function updateCategoryField(
    id: string,
    field: string,
    value:
      | string
      | boolean
  ) {
    setCategories(
      (previous) => {
        return previous.map(
          (category) => {
            if (
              category.id === id
            ) {
              return {
                ...category,

                [field]:
                  value
              };
            }

            return category;
          }
        );
      }
    );
  }

  /* ======================================================
  CREATE CATEGORY
  ====================================================== */

  function createCategory() {
    const newCategory = {
      id:
        Date.now().toString(),

      name:
        "New Category",

      image:
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30",

      backgroundColor:
        "#ffffff",

      textColor:
        "#000000",

      visible: true
    };

    setCategories(
      (previous) => {
        return [
          ...previous,

          newCategory
        ];
      }
    );
  }

  /* ======================================================
  UI
  ====================================================== */

  return (
    <main className="min-h-screen bg-slate-100 p-4">

      <div className="mx-auto max-w-5xl">

        {/* HEADER */}

        <div className="mb-8 rounded-[30px] bg-gradient-to-r from-blue-700 to-purple-700 p-6 text-white shadow-2xl">

          <h1 className="text-4xl font-black">
            Category Admin
          </h1>

          <p className="mt-2 text-blue-100">
            Compact Category Manager
          </p>

        </div>

        {/* CREATE BUTTON */}

        <button
          onClick={() => {
            createCategory();
          }}
          className="
            mb-8
            flex
            items-center
            gap-3
            rounded-2xl
            bg-black
            px-6
            py-4
            font-black
            text-white
          "
        >
          <Plus />

          Create Category
        </button>

        {/* CATEGORY LIST */}

        <div className="space-y-5">

          {categories.map(
            (category) => {
              const isExpanded =
                expandedCategories[
                  category.id
                ];

              return (
                <div
                  key={
                    category.id
                  }
                  className="
                    overflow-hidden
                    rounded-[28px]
                    bg-white
                    shadow-xl
                  "
                >

                  {/* TOP BAR */}

                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      p-4
                    "
                  >

                    {/* LEFT */}

                    <div
                      className="
                        flex
                        items-center
                        gap-4
                      "
                    >

                      {/* CATEGORY ICON */}

                      <div
                        className="
                          flex
                          h-16
                          w-16
                          items-center
                          justify-center
                          overflow-hidden
                          rounded-2xl
                          bg-gray-100
                        "
                      >

                        <img
                          src={
                            category.image
                          }
                          alt={
                            category.name
                          }
                          className="
                            h-full
                            w-full
                            object-cover
                          "
                        />

                      </div>

                      {/* TITLE */}

                      <div>

                        <h2
                          className="
                            text-xl
                            font-black
                          "
                        >
                          {
                            category.name
                          }
                        </h2>

                        <p
                          className="
                            text-sm
                            text-gray-500
                          "
                        >
                          Category Item
                        </p>

                      </div>

                    </div>

                    {/* RIGHT */}

                    <button
                      onClick={() => {
                        toggleCategory(
                          category.id
                        );
                      }}
                      className="
                        flex
                        h-12
                        w-12
                        items-center
                        justify-center
                        rounded-2xl
                        bg-black
                        text-white
                      "
                    >
                      {isExpanded ? (
                        <ChevronUp />
                      ) : (
                        <Grid3X3 />
                      )}
                    </button>

                  </div>

                  {/* FORM */}

                  {isExpanded && (
                    <div className="border-t border-gray-100 p-5">

                      <div className="grid gap-5 md:grid-cols-2">

                        {/* NAME */}

                        <div>

                          <h3 className="mb-2 font-black">
                            Category Name
                          </h3>

                          <input
                            type="text"
                            value={
                              category.name
                            }
                            onChange={(
                              event
                            ) => {
                              updateCategoryField(
                                category.id,
                                "name",
                                event
                                  .target
                                  .value
                              );
                            }}
                            className="
                              w-full
                              rounded-2xl
                              border
                              border-gray-200
                              px-4
                              py-3
                              outline-none
                            "
                          />

                        </div>

                        {/* IMAGE */}

                        <div>

                          <h3 className="mb-2 font-black">
                            Image URL
                          </h3>

                          <input
                            type="text"
                            value={
                              category.image
                            }
                            onChange={(
                              event
                            ) => {
                              updateCategoryField(
                                category.id,
                                "image",
                                event
                                  .target
                                  .value
                              );
                            }}
                            className="
                              w-full
                              rounded-2xl
                              border
                              border-gray-200
                              px-4
                              py-3
                              outline-none
                            "
                          />

                        </div>

                        {/* BACKGROUND */}

                        <div>

                          <h3 className="mb-2 font-black">
                            Background Color
                          </h3>

                          <input
                            type="color"
                            value={
                              category.backgroundColor
                            }
                            onChange={(
                              event
                            ) => {
                              updateCategoryField(
                                category.id,
                                "backgroundColor",
                                event
                                  .target
                                  .value
                              );
                            }}
                            className="
                              h-14
                              w-full
                              rounded-2xl
                            "
                          />

                        </div>

                        {/* TEXT COLOR */}

                        <div>

                          <h3 className="mb-2 font-black">
                            Text Color
                          </h3>

                          <input
                            type="color"
                            value={
                              category.textColor
                            }
                            onChange={(
                              event
                            ) => {
                              updateCategoryField(
                                category.id,
                                "textColor",
                                event
                                  .target
                                  .value
                              );
                            }}
                            className="
                              h-14
                              w-full
                              rounded-2xl
                            "
                          />

                        </div>

                      </div>

                    </div>
                  )}

                </div>
              );
            }
          )}

        </div>

      </div>

    </main>
  );
}
