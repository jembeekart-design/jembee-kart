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

  images?: string[];

  videos?: string[];

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

  const imageInputRefs =
    useRef<{
      [key: string]:
        | HTMLInputElement
        | null;
    }>({});

  const videoInputRefs =
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

          setProducts(data);

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

        images: [],

        videos: [],

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
  }

  /* ======================================================
  UPDATE PRODUCT
  ====================================================== */

  async function updateProduct(
    id: string,
    field: string,
    value: any
  ) {
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
  }

  /* ======================================================
  DELETE PRODUCT
  ====================================================== */

  async function deleteProduct(
    id: string
  ) {
    await deleteDoc(
      doc(
        db,
        "products",
        id
      )
    );
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

  async function uploadImages(
    product: Product,
    files: FileList
  ) {
    try {
      const uploadedImages:
        string[] = [];

      for (
        let i = 0;
        i < files.length;
        i++
      ) {
        const compressedFile =
          await compressImage(
            files[i]
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

        uploadedImages.push(
          data.secure_url
        );
      }

      await updateProduct(
        product.id,
        "images",
        [
          ...(product.images ||
            []),

          ...uploadedImages
        ]
      );

      alert(
        "Images Uploaded"
      );
    } catch (error) {
      console.error(error);

      alert(
        "Upload Failed"
      );
    }
  }

  /* ======================================================
  UPLOAD VIDEO
  ====================================================== */

  async function uploadVideos(
    product: Product,
    files: FileList
  ) {
    try {
      const uploadedVideos:
        string[] = [];

      for (
        let i = 0;
        i < files.length;
        i++
      ) {
        const formData =
          new FormData();

        formData.append(
          "file",
          files[i]
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
            }/video/upload`,
            {
              method:
                "POST",

              body:
                formData
            }
          );

        const data =
          await response.json();

        uploadedVideos.push(
          data.secure_url
        );
      }

      await updateProduct(
        product.id,
        "videos",
        [
          ...(product.videos ||
            []),

          ...uploadedVideos
        ]
      );

      alert(
        "Videos Uploaded"
      );
    } catch (error) {
      console.error(error);

      alert(
        "Video Upload Failed"
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

            <h1 className="text-4xl font-black">
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
                      rounded-[35px]
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
                            e
                          ) => {
                            updateProduct(
                              product.id,
                              "title",
                              e.target
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
                            e
                          ) => {
                            updateProduct(
                              product.id,
                              "category",
                              e.target
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

                    </div>

                    {/* IMAGE UPLOAD */}

                    <div className="mt-6">

                      <label className="mb-3 block font-bold">
                        Product Images
                      </label>

                      <button
                        onClick={() => {
                          imageInputRefs.current[
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
                        Upload 3-4 Images
                      </button>

                      <input
                        ref={(
                          element
                        ) => {
                          imageInputRefs.current[
                            product.id
                          ] =
                            element;
                        }}
                        type="file"
                        multiple
                        accept="image/*"
                        capture="environment"
                        hidden
                        onChange={async (
                          event
                        ) => {
                          const files =
                            event
                              .target
                              .files;

                          if (
                            files
                          ) {
                            await uploadImages(
                              product,
                              files
                            );
                          }
                        }}
                      />

                      {/* IMAGES */}

                      <div className="mt-5 flex gap-4 overflow-x-auto pb-2">

                        {product.images?.map(
                          (
                            image,
                            index
                          ) => {
                            return (
                              <img
                                key={
                                  index
                                }
                                src={
                                  image
                                }
                                alt=""
                                className="
                                  h-40
                                  w-32
                                  rounded-b-[40px]
                                  rounded-t-[20px]
                                  object-cover
                                  shadow-lg
                                "
                              />
                            );
                          }
                        )}

                      </div>

                    </div>

                    {/* VIDEO UPLOAD */}

                    <div className="mt-8">

                      <label className="mb-3 block font-bold">
                        Product Videos
                      </label>

                      <button
                        onClick={() => {
                          videoInputRefs.current[
                            product.id
                          ]?.click();
                        }}
                        className="
                          rounded-2xl
                          bg-purple-600
                          px-5
                          py-4
                          font-bold
                          text-white
                        "
                      >
                        Upload Video
                      </button>

                      <input
                        ref={(
                          element
                        ) => {
                          videoInputRefs.current[
                            product.id
                          ] =
                            element;
                        }}
                        type="file"
                        multiple
                        accept="video/*"
                        hidden
                        onChange={async (
                          event
                        ) => {
                          const files =
                            event
                              .target
                              .files;

                          if (
                            files
                          ) {
                            await uploadVideos(
                              product,
                              files
                            );
                          }
                        }}
                      />

                      {/* VIDEOS */}

                      <div className="mt-5 flex gap-4 overflow-x-auto pb-2">

                        {product.videos?.map(
                          (
                            video,
                            index
                          ) => {
                            return (
                              <video
                                key={
                                  index
                                }
                                src={
                                  video
                                }
                                controls
                                className="
                                  h-44
                                  w-36
                                  rounded-b-[40px]
                                  rounded-t-[20px]
                                  object-cover
                                  shadow-lg
                                "
                              />
                            );
                          }
                        )}

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
                        mt-8
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
