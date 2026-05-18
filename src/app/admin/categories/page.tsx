"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc
} from "firebase/firestore";

import { db } from "@/firebase/config";

interface Category {
  id: string;

  title?: string;

  image?: string;

  backgroundColor?: string;

  textColor?: string;

  position?: number;

  visible?: boolean;

  cardStyle?: string;

  borderRadius?: string;

  cardHeight?: string;

  cardWidth?: string;

  imageHeight?: string;

  titleSize?: string;
}

export default function CategoriesAdminPage() {
  const [categories, setCategories] =
    useState<Category[]>([]);

  const [loading, setLoading] =
    useState(true);

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
                    Category,
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

          setCategories(
            sortedData
          );

          setLoading(false);
        }
      );

    return () => unsubscribe();
  }, []);

  async function addCategory() {
    try {
      await addDoc(
        collection(
          db,
          "categories"
        ),
        {
          title: "New Category",

          image: "",

          backgroundColor:
            "#2563eb",

          textColor:
            "#ffffff",

          position:
            categories.length +
            1,

          visible: true,

          cardStyle: "rounded",

          borderRadius: "28px",

          cardHeight: "260px",

          cardWidth: "100%",

          imageHeight: "190px",

          titleSize: "38px"
        }
      );
    } catch (error) {
      console.error(error);
    }
  }

  async function updateCategory(
    id: string,
    field: string,
    value:
      | string
      | number
      | boolean
  ) {
    try {
      await updateDoc(
        doc(
          db,
          "categories",
          id
        ),
        {
          [field]: value
        }
      );
    } catch (error) {
      console.error(error);
    }
  }

  async function deleteCategory(
    id: string
  ) {
    try {
      await deleteDoc(
        doc(
          db,
          "categories",
          id
        )
      );
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8">

      <div className="mx-auto max-w-6xl">

        {/* HEADER */}

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>

            <h1 className="text-3xl font-black text-gray-900 md:text-5xl">
              Categories Admin
            </h1>

            <p className="mt-2 text-gray-500">
              Manage ecommerce categories
            </p>

          </div>

          <button
            onClick={
              addCategory
            }
            className="rounded-2xl bg-blue-600 px-6 py-4 text-lg font-bold text-white shadow-xl transition-all duration-300 hover:bg-blue-700"
          >
            Add Category
          </button>

        </div>

        {/* LOADING */}

        {loading ? (
          <div className="text-center text-xl font-bold text-gray-500">
            Loading...
          </div>
        ) : (
          <div className="space-y-6">

            {categories.map(
              (category) => {
                return (
                  <div
                    key={
                      category.id
                    }
                    className="rounded-[30px] bg-white p-6 shadow-xl"
                  >

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                      {/* TITLE */}

                      <div>

                        <label className="mb-3 block text-lg font-bold text-gray-700">
                          Title
                        </label>

                        <input
                          type="text"
                          value={
                            category.title ||
                            ""
                          }
                          onChange={(
                            event
                          ) => {
                            updateCategory(
                              category.id,
                              "title",
                              event
                                .target
                                .value
                            );
                          }}
                          className="w-full rounded-2xl border border-gray-200 bg-gray-100 px-5 py-4 outline-none"
                        />

                      </div>

                      {/* IMAGE */}

                      <div>

                        <label className="mb-3 block text-lg font-bold text-gray-700">
                          Image URL
                        </label>

                        <input
                          type="text"
                          value={
                            category.image ||
                            ""
                          }
                          onChange={(
                            event
                          ) => {
                            updateCategory(
                              category.id,
                              "image",
                              event
                                .target
                                .value
                            );
                          }}
                          className="w-full rounded-2xl border border-gray-200 bg-gray-100 px-5 py-4 outline-none"
                        />

                      </div>

                      {/* BACKGROUND COLOR */}

                      <div>

                        <label className="mb-3 block text-lg font-bold text-gray-700">
                          Background Color
                        </label>

                        <div className="flex items-center gap-4">

                          <input
                            type="color"
                            value={
                              category.backgroundColor ||
                              "#2563eb"
                            }
                            onChange={(
                              event
                            ) => {
                              updateCategory(
                                category.id,
                                "backgroundColor",
                                event
                                  .target
                                  .value
                              );
                            }}
                            className="h-14 w-20 rounded-xl"
                          />

                          <input
                            type="text"
                            value={
                              category.backgroundColor ||
                              ""
                            }
                            onChange={(
                              event
                            ) => {
                              updateCategory(
                                category.id,
                                "backgroundColor",
                                event
                                  .target
                                  .value
                              );
                            }}
                            className="flex-1 rounded-2xl border border-gray-200 bg-gray-100 px-5 py-4 outline-none"
                          />

                        </div>

                      </div>

                      {/* TEXT COLOR */}

                      <div>

                        <label className="mb-3 block text-lg font-bold text-gray-700">
                          Text Color
                        </label>

                        <div className="flex items-center gap-4">

                          <input
                            type="color"
                            value={
                              category.textColor ||
                              "#ffffff"
                            }
                            onChange={(
                              event
                            ) => {
                              updateCategory(
                                category.id,
                                "textColor",
                                event
                                  .target
                                  .value
                              );
                            }}
                            className="h-14 w-20 rounded-xl"
                          />

                          <input
                            type="text"
                            value={
                              category.textColor ||
                              ""
                            }
                            onChange={(
                              event
                            ) => {
                              updateCategory(
                                category.id,
                                "textColor",
                                event
                                  .target
                                  .value
                              );
                            }}
                            className="flex-1 rounded-2xl border border-gray-200 bg-gray-100 px-5 py-4 outline-none"
                          />

                        </div>

                      </div>

                      {/* BORDER RADIUS */}

                      <div>

                        <label className="mb-3 block text-lg font-bold text-gray-700">
                          Border Radius
                        </label>

                        <input
                          type="text"
                          value={
                            category.borderRadius ||
                            ""
                          }
                          onChange={(
                            event
                          ) => {
                            updateCategory(
                              category.id,
                              "borderRadius",
                              event.target.value
                            );
                          }}
                          className="w-full rounded-2xl border border-gray-200 bg-gray-100 px-5 py-4 outline-none"
                        />

                      </div>

                      {/* CARD HEIGHT */}

                      <div>

                        <label className="mb-3 block text-lg font-bold text-gray-700">
                          Card Height
                        </label>

                        <input
                          type="text"
                          value={
                            category.cardHeight ||
                            ""
                          }
                          onChange={(
                            event
                          ) => {
                            updateCategory(
                              category.id,
                              "cardHeight",
                              event.target.value
                            );
                          }}
                          className="w-full rounded-2xl border border-gray-200 bg-gray-100 px-5 py-4 outline-none"
                        />

                      </div>

                      {/* CARD WIDTH */}

                      <div>

                        <label className="mb-3 block text-lg font-bold text-gray-700">
                          Card Width
                        </label>

                        <input
                          type="text"
                          value={
                            category.cardWidth ||
                            ""
                          }
                          onChange={(
                            event
                          ) => {
                            updateCategory(
                              category.id,
                              "cardWidth",
                              event.target.value
                            );
                          }}
                          className="w-full rounded-2xl border border-gray-200 bg-gray-100 px-5 py-4 outline-none"
                        />

                      </div>

                      {/* IMAGE HEIGHT */}

                      <div>

                        <label className="mb-3 block text-lg font-bold text-gray-700">
                          Image Height
                        </label>

                        <input
                          type="text"
                          value={
                            category.imageHeight ||
                            ""
                          }
                          onChange={(
                            event
                          ) => {
                            updateCategory(
                              category.id,
                              "imageHeight",
                              event.target.value
                            );
                          }}
                          className="w-full rounded-2xl border border-gray-200 bg-gray-100 px-5 py-4 outline-none"
                        />

                      </div>

                      {/* TITLE SIZE */}

                      <div>

                        <label className="mb-3 block text-lg font-bold text-gray-700">
                          Title Size
                        </label>

                        <input
                          type="text"
                          value={
                            category.titleSize ||
                            ""
                          }
                          onChange={(
                            event
                          ) => {
                            updateCategory(
                              category.id,
                              "titleSize",
                              event.target.value
                            );
                          }}
                          className="w-full rounded-2xl border border-gray-200 bg-gray-100 px-5 py-4 outline-none"
                        />

                      </div>

                      {/* POSITION */}

                      <div>

                        <label className="mb-3 block text-lg font-bold text-gray-700">
                          Position
                        </label>

                        <input
                          type="number"
                          value={
                            category.position ||
                            0
                          }
                          onChange={(
                            event
                          ) => {
                            updateCategory(
                              category.id,
                              "position",
                              Number(
                                event.target
                                  .value
                              )
                            );
                          }}
                          className="w-full rounded-2xl border border-gray-200 bg-gray-100 px-5 py-4 outline-none"
                        />

                      </div>

                      {/* VISIBLE */}

                      <div className="flex items-center gap-4">

                        <label className="text-lg font-bold text-gray-700">
                          Visible
                        </label>

                        <input
                          type="checkbox"
                          checked={Boolean(
                            category.visible
                          )}
                          onChange={(
                            event
                          ) => {
                            updateCategory(
                              category.id,
                              "visible",
                              event.target.checked
                            );
                          }}
                          className="h-6 w-6"
                        />

                      </div>

                    </div>

                    {/* DELETE BUTTON */}

                    <button
                      onClick={() => {
                        deleteCategory(
                          category.id
                        );
                      }}
                      className="mt-8 rounded-2xl bg-red-600 px-6 py-4 text-lg font-bold text-white transition-all duration-300 hover:bg-red-700"
                    >
                      Delete Category
                    </button>

                  </div>
                );
              }
            )}

          </div>
        )}

      </div>

    </main>
  );
}
