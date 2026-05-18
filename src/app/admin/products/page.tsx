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

interface Product {
  id: string;

  title?: string;

  description?: string;

  image?: string;

  category?: string;

  price?: number;

  discountPrice?: number;

  stock?: number;

  rating?: number;

  featured?: boolean;

  visible?: boolean;

  position?: number;

  backgroundColor?: string;

  textColor?: string;

  buttonColor?: string;

  buttonTextColor?: string;

  borderRadius?: string;

  cardWidth?: string;

  imageHeight?: string;
}

export default function ProductsAdminPage() {
  const [products, setProducts] =
    useState<Product[]>([]);

  const [loading, setLoading] =
    useState(true);

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
                  id: document.id,

                  ...(document.data() as Omit<
                    Product,
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

          setProducts(
            sortedData
          );

          setLoading(false);
        }
      );

    return () => unsubscribe();
  }, []);

  async function addProduct() {
    try {
      await addDoc(
        collection(
          db,
          "products"
        ),
        {
          title: "New Product",

          description:
            "Premium Product",

          image: "",

          category: "Fashion",

          price: 2999,

          discountPrice: 1999,

          stock: 100,

          rating: 4.5,

          featured: false,

          visible: true,

          position:
            products.length + 1,

          backgroundColor:
            "#ffffff",

          textColor:
            "#111827",

          buttonColor:
            "#2563eb",

          buttonTextColor:
            "#ffffff",

          borderRadius:
            "28px",

          cardWidth:
            "100%",

          imageHeight:
            "240px"
        }
      );
    } catch (error) {
      console.error(error);
    }
  }

  async function updateProduct(
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
          "products",
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

  async function deleteProduct(
    id: string
  ) {
    try {
      await deleteDoc(
        doc(
          db,
          "products",
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
              Products Admin
            </h1>

            <p className="mt-2 text-gray-500">
              Manage ecommerce products
            </p>

          </div>

          <button
            onClick={
              addProduct
            }
            className="rounded-2xl bg-blue-600 px-6 py-4 text-lg font-bold text-white shadow-xl transition-all duration-300 hover:bg-blue-700"
          >
            Add Product
          </button>

        </div>

        {/* LOADING */}

        {loading ? (
          <div className="text-center text-xl font-bold text-gray-500">
            Loading...
          </div>
        ) : (
          <div className="space-y-6">

            {products.map(
              (product) => {
                return (
                  <div
                    key={product.id}
                    className="rounded-[30px] bg-white p-6 shadow-xl"
                  >

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                      {/* TITLE */}

                      <div>

                        <label className="mb-3 block text-lg font-bold text-gray-700">
                          Product Title
                        </label>

                        <input
                          type="text"
                          value={
                            product.title ||
                            ""
                          }
                          onChange={(
                            event
                          ) => {
                            updateProduct(
                              product.id,
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
                          Product Image
                        </label>

                        <input
                          type="text"
                          value={
                            product.image ||
                            ""
                          }
                          onChange={(
                            event
                          ) => {
                            updateProduct(
                              product.id,
                              "image",
                              event
                                .target
                                .value
                            );
                          }}
                          className="w-full rounded-2xl border border-gray-200 bg-gray-100 px-5 py-4 outline-none"
                        />

                      </div>

                      {/* CATEGORY */}

                      <div>

                        <label className="mb-3 block text-lg font-bold text-gray-700">
                          Category
                        </label>

                        <input
                          type="text"
                          value={
                            product.category ||
                            ""
                          }
                          onChange={(
                            event
                          ) => {
                            updateProduct(
                              product.id,
                              "category",
                              event
                                .target
                                .value
                            );
                          }}
                          className="w-full rounded-2xl border border-gray-200 bg-gray-100 px-5 py-4 outline-none"
                        />

                      </div>

                      {/* PRICE */}

                      <div>

                        <label className="mb-3 block text-lg font-bold text-gray-700">
                          Original Price
                        </label>

                        <input
                          type="number"
                          value={
                            product.price ||
                            0
                          }
                          onChange={(
                            event
                          ) => {
                            updateProduct(
                              product.id,
                              "price",
                              Number(
                                event.target
                                  .value
                              )
                            );
                          }}
                          className="w-full rounded-2xl border border-gray-200 bg-gray-100 px-5 py-4 outline-none"
                        />

                      </div>

                      {/* DISCOUNT PRICE */}

                      <div>

                        <label className="mb-3 block text-lg font-bold text-gray-700">
                          Discount Price
                        </label>

                        <input
                          type="number"
                          value={
                            product.discountPrice ||
                            0
                          }
                          onChange={(
                            event
                          ) => {
                            updateProduct(
                              product.id,
                              "discountPrice",
                              Number(
                                event.target
                                  .value
                              )
                            );
                          }}
                          className="w-full rounded-2xl border border-gray-200 bg-gray-100 px-5 py-4 outline-none"
                        />

                      </div>

                      {/* STOCK */}

                      <div>

                        <label className="mb-3 block text-lg font-bold text-gray-700">
                          Stock
                        </label>

                        <input
                          type="number"
                          value={
                            product.stock ||
                            0
                          }
                          onChange={(
                            event
                          ) => {
                            updateProduct(
                              product.id,
                              "stock",
                              Number(
                                event.target
                                  .value
                              )
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
                            product.position ||
                            0
                          }
                          onChange={(
                            event
                          ) => {
                            updateProduct(
                              product.id,
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

                      {/* FEATURED */}

                      <div className="flex items-center gap-4">

                        <label className="text-lg font-bold text-gray-700">
                          Featured
                        </label>

                        <input
                          type="checkbox"
                          checked={Boolean(
                            product.featured
                          )}
                          onChange={(
                            event
                          ) => {
                            updateProduct(
                              product.id,
                              "featured",
                              event.target
                                .checked
                            );
                          }}
                          className="h-6 w-6"
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
                            product.visible
                          )}
                          onChange={(
                            event
                          ) => {
                            updateProduct(
                              product.id,
                              "visible",
                              event.target
                                .checked
                            );
                          }}
                          className="h-6 w-6"
                        />

                      </div>

                    </div>

                    {/* DELETE BUTTON */}

                    <button
                      onClick={() => {
                        deleteProduct(
                          product.id
                        );
                      }}
                      className="mt-8 rounded-2xl bg-red-600 px-6 py-4 text-lg font-bold text-white transition-all duration-300 hover:bg-red-700"
                    >
                      Delete Product
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
