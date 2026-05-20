"use client";

export const dynamic = "force-dynamic";

import {
  useEffect,
  useRef,
  useState
} from "react";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc
} from "firebase/firestore";

import { db } from "@/firebase/config";

/* ======================================================
TYPES
====================================================== */

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
}

/* ======================================================
COMPONENT
====================================================== */

export default function ProductsAdminPage() {
  const [products, setProducts] =
    useState<Product[]>([]);

  const [categories, setCategories] =
    useState<string[]>([]);

  const [loading, setLoading] =
    useState(true);

  const fileInputRefs =
    useRef<{
      [key: string]:
        | HTMLInputElement
        | null;
    }>({});

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
                  id: document.id,

                  ...(document.data() as Omit<
                    Product,
                    "id"
                  >)
                };
              }
            );

          const sorted =
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
            sorted
          );

          setLoading(false);
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
          const categoryList =
            snapshot.docs.map(
              (document) => {
                return String(
                  document.data()
                    .title || ""
                );
              }
            );

          setCategories(
            categoryList
          );
        }
      );

    return () =>
      unsubscribe();
  }, []);

  /* ======================================================
  ADD PRODUCT
  ====================================================== */

  async function addProduct() {
    try {
      await addDoc(
        collection(
          db,
          "products"
        ),
        {
          title:
            "New Product",

          description:
            "Premium Product",

          image: "",

          category:
            categories[0] ||
            "Fashion",

          price: 2999,

          discountPrice: 1999,

          stock: 100,

          rating: 4.5,

          featured: false,

          visible: true,

          position:
            products.length + 1
        }
      );
    } catch (error) {
      console.error(error);
    }
  }

  /* ======================================================
  UPDATE PRODUCT
  ====================================================== */

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

  /* ======================================================
  DELETE PRODUCT
  ====================================================== */

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

  /* ======================================================
  IMAGE COMPRESS
  ====================================================== */

  async function compressImage(
    file: File
  ) {
    return new Promise<File>(
      (resolve) => {
        const canvas =
          document.createElement(
            "canvas"
          );

        const ctx =
          canvas.getContext(
            "2d"
          );

        const img =
          new window.Image();

        img.onload = () => {
          let width =
            img.width;

          let height =
            img.height;

          const maxWidth =
            700;

          if (
            width >
            maxWidth
          ) {
            height =
              (height *
                maxWidth) /
              width;

            width =
              maxWidth;
          }

          canvas.width =
            width;

          canvas.height =
            height;

          ctx?.drawImage(
            img,
            0,
            0,
            width,
            height
          );

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                resolve(file);

                return;
              }

              const compressedFile =
                new File(
                  [blob],
                  file.name,
                  {
                    type:
                      "image/jpeg"
                  }
                );

              resolve(
                compressedFile
              );
            },

            "image/jpeg",

            0.6
          );
        };

        img.src =
          URL.createObjectURL(
            file
          );
      }
    );
  }

  /* ======================================================
  UPLOAD IMAGE
  ====================================================== */

  async function uploadImage(
    productId: string,
    file: File
  ) {
    try {
      const compressedFile =
        await compressImage(
          file
        );

      const formData =
        new FormData();

      formData.append(
        "file",
        compressedFile
      );

      formData.append(
        "upload_preset",

        process.env
          .NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ||
          ""
      );

      const response =
        await fetch(
          `https://api.cloudinary.com/v1_1/${
            process.env
              .NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
          }/image/upload`,
          {
            method:
              "POST",

            body:
              formData
          }
        );

      const data =
        await response.json();

      await updateProduct(
        productId,
        "image",
        data.secure_url
      );

      alert(
        "Image Uploaded"
      );
    } catch (error) {
      console.error(error);

      alert(
        "Upload Failed"
      );
    }
  }

  /* ======================================================
  UI
  ====================================================== */

  return (
    <main className="min-h-screen bg-gray-100 p-4">

      <div className="mx-auto max-w-6xl">

        {/* HEADER */}

        <div className="mb-8 flex items-center justify-between">

          <div>

            <h1 className="text-4xl font-black text-gray-900">
              Products Admin
            </h1>

            <p className="mt-2 text-gray-500">
              Manage Products
            </p>

          </div>

          <button
            onClick={
              addProduct
            }
            className="
              rounded-2xl
              bg-blue-600
              px-6
              py-4
              font-bold
              text-white
            "
          >
            Add Product
          </button>

        </div>

        {/* LOADING */}

        {loading ? (
          <div className="text-center text-xl font-bold">
            Loading...
          </div>
        ) : (
          <div className="space-y-6">

            {products.map(
              (product) => {
                return (
                  <div
                    key={product.id}
                    className="
                      rounded-[30px]
                      bg-white
                      p-5
                      shadow-xl
                    "
                  >

                    <div className="grid gap-5 md:grid-cols-2">

                      {/* TITLE */}

                      <div>

                        <label className="mb-2 block font-bold">
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
                          className="
                            w-full
                            rounded-2xl
                            border
                            bg-gray-100
                            p-4
                          "
                        />

                      </div>

                      {/* IMAGE */}

                      <div>

                        <label className="mb-2 block font-bold">
                          Product Image
                        </label>

                        <button
                          onClick={() => {
                            fileInputRefs.current[
                              product.id
                            ]?.click();
                          }}
                          className="
                            rounded-2xl
                            bg-blue-600
                            px-5
                            py-4
                            font-bold
                            text-white
                          "
                        >
                          Upload Image
                        </button>

                        <input
                          ref={(
                            element
                          ) => {
                            fileInputRefs.current[
                              product.id
                            ] =
                              element;
                          }}
                          type="file"
                          accept="image/*"
                          capture="environment"
                          hidden
                          onChange={async (
                            event
                          ) => {
                            const file =
                              event
                                .target
                                .files?.[0];

                            if (
                              file
                            ) {
                              await uploadImage(
                                product.id,
                                file
                              );
                            }
                          }}
                        />

                        {product.image && (
                          <img
                            src={
                              product.image
                            }
                            alt={
                              product.title
                            }
                            className="
                              mt-4
                              h-32
                              w-32
                              rounded-2xl
                              object-cover
                            "
                          />
                        )}

                      </div>

                      {/* CATEGORY */}

                      <div>

                        <label className="mb-2 block font-bold">
                          Category
                        </label>

                        <select
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
                          className="
                            w-full
                            rounded-2xl
                            border
                            bg-gray-100
                            p-4
                          "
                        >

                          {categories.map(
                            (
                              category
                            ) => {
                              return (
                                <option
                                  key={
                                    category
                                  }
                                  value={
                                    category
                                  }
                                >
                                  {
                                    category
                                  }
                                </option>
                              );
                            }
                          )}

                        </select>

                      </div>

                      {/* PRICE */}

                      <div>

                        <label className="mb-2 block font-bold">
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
                          className="
                            w-full
                            rounded-2xl
                            border
                            bg-gray-100
                            p-4
                          "
                        />

                      </div>

                      {/* DISCOUNT PRICE */}

                      <div>

                        <label className="mb-2 block font-bold">
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
                          className="
                            w-full
                            rounded-2xl
                            border
                            bg-gray-100
                            p-4
                          "
                        />

                      </div>

                      {/* STOCK */}

                      <div>

                        <label className="mb-2 block font-bold">
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
                          className="
                            w-full
                            rounded-2xl
                            border
                            bg-gray-100
                            p-4
                          "
                        />

                      </div>

                    </div>

                    {/* FEATURED */}

                    <div className="mt-6 flex gap-6">

                      <div className="flex items-center gap-3">

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
                          className="h-5 w-5"
                        />

                        <p className="font-bold">
                          Featured
                        </p>

                      </div>

                      <div className="flex items-center gap-3">

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
                          className="h-5 w-5"
                        />

                        <p className="font-bold">
                          Visible
                        </p>

                      </div>

                    </div>

                    {/* DELETE */}

                    <button
                      onClick={() => {
                        deleteProduct(
                          product.id
                        );
                      }}
                      className="
                        mt-6
                        rounded-2xl
                        bg-red-600
                        px-5
                        py-3
                        font-bold
                        text-white
                      "
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
