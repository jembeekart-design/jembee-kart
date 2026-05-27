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

import {
  Plus,
  Package2,
  Trash2,
  Pencil,
  Eye,
  EyeOff,
  ImagePlus,
  Video,
  X
} from "lucide-react";

import { db } from "@/firebase/config";

/* ======================================================
TYPES
====================================================== */

interface Product {

  id: string;

  title: string;

  category: string;

  price: number;

  discountPrice: number;

  stock: number;

  images: string[];

  videos: string[];

  visible: boolean;
}

/* ======================================================
COMPONENT
====================================================== */

export default function ProductsAdminPage() {

  const [
    products,
    setProducts
  ] = useState<Product[]>([]);

  const [
    loading,
    setLoading
  ] = useState(true);

  const [
    selectedCategory,
    setSelectedCategory
  ] = useState("All");

  const [
    activeTab,
    setActiveTab
  ] = useState<
    "products" | "add"
  >("products");

  const [
    editingProductId,
    setEditingProductId
  ] = useState("");

  /* ======================================================
  ADD FORM
  ====================================================== */

  const [
    title,
    setTitle
  ] = useState("");

  const [
    category,
    setCategory
  ] = useState("");

  const [
    price,
    setPrice
  ] = useState("");

  const [
    discountPrice,
    setDiscountPrice
  ] = useState("");

  const [
    stock,
    setStock
  ] = useState("");

  const imageInputRefs =
    useRef<{
      [key: string]:
        HTMLInputElement | null;
    }>({});

  const videoInputRefs =
    useRef<{
      [key: string]:
        HTMLInputElement | null;
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

          setLoading(
            false
          );
        }
      );

    return () =>
      unsubscribe();

  }, []);

  /* ======================================================
  CATEGORY LIST
  ====================================================== */

  const categories = [

    "All",

    ...new Set(
      products.map(
        (product) =>
          product.category
      )
    )
  ];

  /* ======================================================
  FILTER PRODUCTS
  ====================================================== */

  const filteredProducts =
    selectedCategory ===
    "All"

      ? products

      : products.filter(
          (product) =>
            product.category ===
            selectedCategory
        );

  /* ======================================================
  ADD PRODUCT
  ====================================================== */

  async function addProduct() {

    if (
      !title ||
      !category
    ) {

      alert(
        "Fill all fields"
      );

      return;
    }

    await addDoc(

      collection(
        db,
        "products"
      ),

      {

        title,

        category,

        price:
          Number(price),

        discountPrice:
          Number(
            discountPrice
          ),

        stock:
          Number(stock),

        images: [],

        videos: [],

        visible: true
      }
    );

    setTitle("");

    setCategory("");

    setPrice("");

    setDiscountPrice("");

    setStock("");

    setActiveTab(
      "products"
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
        [field]:
          value
      }
    );
  }

  /* ======================================================
  DELETE PRODUCT
  ====================================================== */

  async function deleteProduct(
    id: string
  ) {

    const confirmDelete =
      confirm(
        "Delete Product?"
      );

    if (
      !confirmDelete
    ) {
      return;
    }

    await deleteDoc(

      doc(
        db,
        "products",
        id
      )
    );
  }

  /* ======================================================
  UPLOAD IMAGES
  ====================================================== */

  async function uploadImages(
    product: Product,
    files: FileList
  ) {

    try {

      const uploaded:
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

        uploaded.push(
          data.secure_url
        );
      }

      await updateProduct(

        product.id,

        "images",

        [
          ...(product.images ||
            []),

          ...uploaded
        ]
      );

    } catch (error) {

      console.error(
        error
      );
    }
  }

  /* ======================================================
  UPLOAD VIDEOS
  ====================================================== */

  async function uploadVideos(
    product: Product,
    files: FileList
  ) {

    try {

      const uploaded:
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

        uploaded.push(
          data.secure_url
        );
      }

      await updateProduct(

        product.id,

        "videos",

        [
          ...(product.videos ||
            []),

          ...uploaded
        ]
      );

    } catch (error) {

      console.error(
        error
      );
    }
  }

  /* ======================================================
  UI
  ====================================================== */

  return (

    <main className="min-h-screen bg-[#f4f4f4] p-4">

      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <div className="mb-6 flex items-center justify-between">

          <div>

            <h1 className="text-5xl font-black">
              Products Admin
            </h1>

            <p className="mt-2 text-gray-500">
              Manage Products
            </p>

          </div>

          {/* TOP BUTTONS */}

          <div className="flex gap-3">

            <button
              onClick={() =>
                setActiveTab(
                  "products"
                )
              }
              className={`
                flex
                items-center
                gap-2
                rounded-3xl
                px-6
                py-5
                text-lg
                font-black

                ${
                  activeTab ===
                  "products"

                    ? "bg-black text-white"

                    : "bg-white text-black"
                }
              `}
            >

              <Package2
                size={22}
              />

              Products

            </button>

            <button
              onClick={() =>
                setActiveTab(
                  "add"
                )
              }
              className={`
                flex
                items-center
                gap-2
                rounded-3xl
                px-6
                py-5
                text-lg
                font-black

                ${
                  activeTab ===
                  "add"

                    ? "bg-blue-600 text-white"

                    : "bg-white text-black"
                }
              `}
            >

              <Plus
                size={22}
              />

              Add Product

            </button>

          </div>

        </div>

        {/* ======================================================
        ADD PRODUCT FORM
        ====================================================== */}

        {activeTab ===
          "add" && (

          <div
            className="
              rounded-[35px]
              bg-white
              p-6
              shadow-xl
            "
          >

            <h2
              className="
                text-3xl
                font-black
              "
            >

              Add New Product

            </h2>

            <div className="mt-6 grid gap-5">

              <input
                type="text"
                value={title}
                onChange={(e) =>
                  setTitle(
                    e.target.value
                  )
                }
                placeholder="Product Title"
                className="
                  rounded-2xl
                  border
                  p-5
                  text-lg
                "
              />

              <input
                type="text"
                value={category}
                onChange={(e) =>
                  setCategory(
                    e.target.value
                  )
                }
                placeholder="Category"
                className="
                  rounded-2xl
                  border
                  p-5
                  text-lg
                "
              />

              <input
                type="number"
                value={price}
                onChange={(e) =>
                  setPrice(
                    e.target.value
                  )
                }
                placeholder="Price"
                className="
                  rounded-2xl
                  border
                  p-5
                  text-lg
                "
              />

              <input
                type="number"
                value={
                  discountPrice
                }
                onChange={(e) =>
                  setDiscountPrice(
                    e.target.value
                  )
                }
                placeholder="Discount Price"
                className="
                  rounded-2xl
                  border
                  p-5
                  text-lg
                "
              />

              <input
                type="number"
                value={stock}
                onChange={(e) =>
                  setStock(
                    e.target.value
                  )
                }
                placeholder="Stock"
                className="
                  rounded-2xl
                  border
                  p-5
                  text-lg
                "
              />

              <button
                onClick={
                  addProduct
                }
                className="
                  rounded-3xl
                  bg-blue-600
                  px-6
                  py-5
                  text-xl
                  font-black
                  text-white
                "
              >

                Save Product

              </button>

            </div>

          </div>

        )}

        {/* ======================================================
        PRODUCTS LIST
        ====================================================== */}

        {activeTab ===
          "products" && (

          <>

            {/* CATEGORY */}

            <div className="mb-7 mt-3 flex gap-3 overflow-x-auto pb-2">

              {categories.map(
                (category) => {

                  return (

                    <button
                      key={
                        category
                      }
                      onClick={() =>
                        setSelectedCategory(
                          category
                        )
                      }
                      className={`
                        whitespace-nowrap
                        rounded-full
                        px-5
                        py-3
                        text-sm
                        font-bold

                        ${
                          selectedCategory ===
                          category

                            ? "bg-black text-white"

                            : "bg-white text-black"
                        }
                      `}
                    >

                      {category}

                    </button>
                  );
                }
              )}

            </div>

            {/* LOADING */}

            {loading ? (

              <div className="text-center text-2xl font-black">

                Loading...

              </div>

            ) : (

              <div className="grid gap-5">

                {filteredProducts.map(
                  (
                    product
                  ) => {

                    const editing =
                      editingProductId ===
                      product.id;

                    return (

                      <div
                        key={
                          product.id
                        }
                        className="
                          rounded-[35px]
                          bg-white
                          p-5
                          shadow-lg
                        "
                      >

                        {/* TOP */}

                        <div className="flex items-start justify-between gap-4">

                          <div className="flex gap-4">

                            <img
                              src={
                                product
                                  .images?.[0] ||
                                "https://placehold.co/200x200"
                              }
                              alt=""
                              className="
                                h-28
                                w-28
                                rounded-3xl
                                object-cover
                              "
                            />

                            <div>

                              {editing ? (

                                <input
                                  type="text"
                                  value={
                                    product.title
                                  }
                                  onChange={(
                                    e
                                  ) =>
                                    updateProduct(
                                      product.id,
                                      "title",
                                      e.target
                                        .value
                                    )
                                  }
                                  className="
                                    rounded-2xl
                                    border
                                    p-3
                                    text-xl
                                    font-black
                                  "
                                />

                              ) : (

                                <h2 className="text-2xl font-black">

                                  {
                                    product.title
                                  }

                                </h2>

                              )}

                              <p className="mt-2 text-sm font-bold text-gray-500">

                                {
                                  product.category
                                }

                              </p>

                              <div className="mt-3 flex gap-3">

                                <p className="text-lg font-black text-green-600">

                                  ₹
                                  {
                                    product.discountPrice
                                  }

                                </p>

                                <p className="text-sm font-bold text-gray-400 line-through">

                                  ₹
                                  {
                                    product.price
                                  }

                                </p>

                              </div>

                              <p className="mt-2 text-sm font-bold">

                                Stock:
                                {" "}
                                {
                                  product.stock
                                }

                              </p>

                            </div>

                          </div>

                          {/* BUTTONS */}

                          <div className="flex flex-col gap-3">

                            <button
                              onClick={() => {

                                if (
                                  editing
                                ) {

                                  setEditingProductId(
                                    ""
                                  );

                                } else {

                                  setEditingProductId(
                                    product.id
                                  );
                                }
                              }}
                              className="
                                flex
                                items-center
                                gap-2
                                rounded-2xl
                                bg-blue-600
                                px-4
                                py-3
                                font-bold
                                text-white
                              "
                            >

                              <Pencil size={18} />

                              {editing
                                ? "Save"
                                : "Edit"}

                            </button>

                            <button
                              onClick={() => {

                                updateProduct(
                                  product.id,
                                  "visible",

                                  !product.visible
                                );
                              }}
                              className={`
                                flex
                                items-center
                                gap-2
                                rounded-2xl
                                px-4
                                py-3
                                font-bold
                                text-white

                                ${
                                  product.visible
                                    ? "bg-green-600"
                                    : "bg-gray-500"
                                }
                              `}
                            >

                              {product.visible ? (
                                <Eye
                                  size={
                                    18
                                  }
                                />
                              ) : (
                                <EyeOff
                                  size={
                                    18
                                  }
                                />
                              )}

                              Visible

                            </button>

                            <button
                              onClick={() =>
                                deleteProduct(
                                  product.id
                                )
                              }
                              className="
                                flex
                                items-center
                                gap-2
                                rounded-2xl
                                bg-red-600
                                px-4
                                py-3
                                font-bold
                                text-white
                              "
                            >

                              <Trash2
                                size={
                                  18
                                }
                              />

                              Delete

                            </button>

                          </div>

                        </div>

                        {/* EDIT AREA */}

                        {editing && (

                          <div className="mt-6 space-y-5">

                            <div className="grid gap-4 md:grid-cols-3">

                              <input
                                type="number"
                                value={
                                  product.price
                                }
                                onChange={(
                                  e
                                ) =>
                                  updateProduct(
                                    product.id,
                                    "price",
                                    Number(
                                      e.target
                                        .value
                                    )
                                  )
                                }
                                placeholder="Price"
                                className="
                                  rounded-2xl
                                  border
                                  p-4
                                "
                              />

                              <input
                                type="number"
                                value={
                                  product.discountPrice
                                }
                                onChange={(
                                  e
                                ) =>
                                  updateProduct(
                                    product.id,
                                    "discountPrice",
                                    Number(
                                      e.target
                                        .value
                                    )
                                  )
                                }
                                placeholder="Discount Price"
                                className="
                                  rounded-2xl
                                  border
                                  p-4
                                "
                              />

                              <input
                                type="number"
                                value={
                                  product.stock
                                }
                                onChange={(
                                  e
                                ) =>
                                  updateProduct(
                                    product.id,
                                    "stock",
                                    Number(
                                      e.target
                                        .value
                                    )
                                  )
                                }
                                placeholder="Stock"
                                className="
                                  rounded-2xl
                                  border
                                  p-4
                                "
                              />

                            </div>

                            {/* UPLOAD */}

                            <div className="flex flex-wrap gap-4">

                              {/* IMAGE */}

                              <button
                                onClick={() => {

                                  imageInputRefs.current[
                                    product.id
                                  ]?.click();
                                }}
                                className="
                                  flex
                                  items-center
                                  gap-2
                                  rounded-2xl
                                  bg-blue-600
                                  px-5
                                  py-4
                                  font-bold
                                  text-white
                                "
                              >

                                <ImagePlus size={20} />

                                Upload Images

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
                                hidden
                                multiple
                                accept="image/*"
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

                              {/* VIDEO */}

                              <button
                                onClick={() => {

                                  videoInputRefs.current[
                                    product.id
                                  ]?.click();
                                }}
                                className="
                                  flex
                                  items-center
                                  gap-2
                                  rounded-2xl
                                  bg-purple-600
                                  px-5
                                  py-4
                                  font-bold
                                  text-white
                                "
                              >

                                <Video size={20} />

                                Upload Videos

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
                                hidden
                                multiple
                                accept="video/*"
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

                            </div>

                          </div>

                        )}

                        {/* IMAGES */}

                        <div className="mt-5 flex gap-3 overflow-x-auto">

                          {product.images?.map(
                            (
                              image,
                              index
                            ) => {

                              return (

                                <div
                                  key={
                                    index
                                  }
                                  className="relative"
                                >

                                  <img
                                    src={
                                      image
                                    }
                                    alt=""
                                    className="
                                      h-28
                                      w-28
                                      rounded-2xl
                                      object-cover
                                    "
                                  />

                                  <button
                                    onClick={async () => {

                                      const updated =
                                        product.images.filter(
                                          (
                                            _,
                                            i
                                          ) =>
                                            i !==
                                            index
                                        );

                                      await updateProduct(
                                        product.id,
                                        "images",
                                        updated
                                      );
                                    }}
                                    className="
                                      absolute
                                      right-1
                                      top-1
                                      rounded-full
                                      bg-red-600
                                      p-1
                                      text-white
                                    "
                                  >

                                    <X
                                      size={
                                        14
                                      }
                                    />

                                  </button>

                                </div>
                              );
                            }
                          )}

                        </div>

                        {/* VIDEOS */}

                        <div className="mt-5 flex gap-3 overflow-x-auto">

                          {product.videos?.map(
                            (
                              video,
                              index
                            ) => {

                              return (

                                <div
                                  key={
                                    index
                                  }
                                  className="relative"
                                >

                                  <video
                                    src={
                                      video
                                    }
                                    controls
                                    className="
                                      h-40
                                      w-32
                                      rounded-2xl
                                      object-cover
                                    "
                                  />

                                  <button
                                    onClick={async () => {

                                      const updated =
                                        product.videos.filter(
                                          (
                                            _,
                                            i
                                          ) =>
                                            i !==
                                            index
                                        );

                                      await updateProduct(
                                        product.id,
                                        "videos",
                                        updated
                                      );
                                    }}
                                    className="
                                      absolute
                                      right-1
                                      top-1
                                      rounded-full
                                      bg-red-600
                                      p-1
                                      text-white
                                    "
                                  >

                                    <X
                                      size={
                                        14
                                      }
                                    />

                                  </button>

                                </div>
                              );
                            }
                          )}

                        </div>

                      </div>
                    );
                  }
                )}

              </div>

            )}

          </>

        )}

      </div>

    </main>
  );
}
