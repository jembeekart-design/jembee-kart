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
  X,
  UploadCloud
} from "lucide-react";

import { db } from "@/firebase/config";

/* ======================================================
TYPES
====================================================== */

interface Product {

  id: string;

  title: string;

  category: string;

  description: string;

  price: number;

  discountPrice: number;

  stock: number;

  sku: string;

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
  FORM STATES
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
    description,
    setDescription
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

  const [
    sku,
    setSku
  ] = useState("");

  const [
    selectedSizes,
    setSelectedSizes
  ] = useState<string[]>([]);

  const [
    selectedColor,
    setSelectedColor
  ] = useState("Black");

  const [
    uploading,
    setUploading
  ] = useState(false);

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

        description,

        price:
          Number(price),

        discountPrice:
          Number(
            discountPrice
          ),

        stock:
          Number(stock),

        sku,

        images: [],

        videos: [],

        visible: true
      }
    );

    setTitle("");

    setCategory("");

    setDescription("");

    setPrice("");

    setDiscountPrice("");

    setStock("");

    setSku("");

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

      setUploading(
        true
      );

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

    } finally {

      setUploading(
        false
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

      setUploading(
        true
      );

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

    } finally {

      setUploading(
        false
      );
    }
  }

  /* ======================================================
  TOGGLE SIZE
  ====================================================== */

  function toggleSize(
    size: string
  ) {

    if (
      selectedSizes.includes(
        size
      )
    ) {

      setSelectedSizes(

        selectedSizes.filter(
          (item) =>
            item !== size
        )
      );

    } else {

      setSelectedSizes([
        ...selectedSizes,
        size
      ]);
    }
  }

  /* ======================================================
  UI
  ====================================================== */

  return (

    <main className="min-h-screen bg-[#060312] p-4">

      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <div className="mb-6 flex items-center justify-between">

          <div>

            <h1
              className="
                text-5xl
                font-black
                text-white
              "
            >

              POD Dashboard

            </h1>

            <p
              className="
                mt-2
                text-gray-400
              "
            >

              Qikink / Printrove
              Product Manager

            </p>

          </div>

          {/* TABS */}

          <div className="flex gap-3">

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
                rounded-2xl
                border
                px-5
                py-4
                font-bold

                ${
                  activeTab ===
                  "add"

                    ? "border-purple-500 bg-purple-500/20 text-white shadow-[0_0_20px_rgba(168,85,247,0.7)]"

                    : "border-white/10 bg-white/5 text-gray-300"
                }
              `}
            >

              <Plus size={20} />

              Add Product

            </button>

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
                rounded-2xl
                border
                px-5
                py-4
                font-bold

                ${
                  activeTab ===
                  "products"

                    ? "border-purple-500 bg-purple-500/20 text-white shadow-[0_0_20px_rgba(168,85,247,0.7)]"

                    : "border-white/10 bg-white/5 text-gray-300"
                }
              `}
            >

              <Package2
                size={20}
              />

              My Products
              (
              {
                products.length
              }
              )

            </button>

          </div>

        </div>

        {/* ======================================================
        ADD PRODUCT
        ====================================================== */}

        {activeTab ===
          "add" && (

          <div
            className="
              rounded-[40px]
              border
              border-purple-500/20
              bg-[#0f0b1f]
              p-6
              shadow-[0_0_40px_rgba(168,85,247,0.25)]
            "
          >

            <h2
              className="
                text-3xl
                font-black
                text-white
              "
            >

              Add Product

            </h2>

            {/* TITLE + SKU */}

            <div className="mt-6 grid gap-5 md:grid-cols-2">

              <div>

                <label className="mb-2 block text-sm font-bold text-gray-300">

                  Product Title

                </label>

                <input
                  type="text"
                  value={title}
                  onChange={(e) =>
                    setTitle(
                      e.target.value
                    )
                  }
                  placeholder="Samurai Tee"
                  className="
                    w-full
                    rounded-2xl
                    border
                    border-purple-500/30
                    bg-[#151027]
                    p-4
                    text-white
                    outline-none
                  "
                />

              </div>

              <div>

                <label className="mb-2 block text-sm font-bold text-gray-300">

                  Vendor SKU

                </label>

                <input
                  type="text"
                  value={sku}
                  onChange={(e) =>
                    setSku(
                      e.target.value
                    )
                  }
                  placeholder="TS-1001"
                  className="
                    w-full
                    rounded-2xl
                    border
                    border-purple-500/30
                    bg-[#151027]
                    p-4
                    text-white
                    outline-none
                  "
                />

              </div>

            </div>

            {/* DESCRIPTION */}

            <div className="mt-5">

              <label className="mb-2 block text-sm font-bold text-gray-300">

                Description

              </label>

              <textarea
                value={description}
                onChange={(e) =>
                  setDescription(
                    e.target.value
                  )
                }
                rows={4}
                placeholder="Premium cotton oversized t-shirt..."
                className="
                  w-full
                  rounded-2xl
                  border
                  border-purple-500/30
                  bg-[#151027]
                  p-4
                  text-white
                  outline-none
                "
              />

            </div>

            {/* PRICE */}

            <div className="mt-5 grid gap-5 md:grid-cols-2">

              <div>

                <label className="mb-2 block text-sm font-bold text-gray-300">

                  Base Price

                </label>

                <input
                  type="number"
                  value={price}
                  onChange={(e) =>
                    setPrice(
                      e.target.value
                    )
                  }
                  placeholder="349"
                  className="
                    w-full
                    rounded-2xl
                    border
                    border-purple-500/30
                    bg-[#151027]
                    p-4
                    text-white
                    outline-none
                  "
                />

              </div>

              <div>

                <label className="mb-2 block text-sm font-bold text-gray-300">

                  Discount Price

                </label>

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
                  placeholder="299"
                  className="
                    w-full
                    rounded-2xl
                    border
                    border-purple-500/30
                    bg-[#151027]
                    p-4
                    text-white
                    outline-none
                  "
                />

              </div>

            </div>

            {/* CATEGORY + STOCK */}

            <div className="mt-5 grid gap-5 md:grid-cols-2">

              <div>

                <label className="mb-2 block text-sm font-bold text-gray-300">

                  Category

                </label>

                <select
                  value={category}
                  onChange={(e) =>
                    setCategory(
                      e.target.value
                    )
                  }
                  className="
                    w-full
                    rounded-2xl
                    border
                    border-purple-500/30
                    bg-[#151027]
                    p-4
                    text-white
                    outline-none
                  "
                >

                  <option>
                    Oversized Tee
                  </option>

                  <option>
                    Hoodie
                  </option>

                  <option>
                    Sweatshirt
                  </option>

                </select>

              </div>

              <div>

                <label className="mb-2 block text-sm font-bold text-gray-300">

                  Stock

                </label>

                <input
                  type="number"
                  value={stock}
                  onChange={(e) =>
                    setStock(
                      e.target.value
                    )
                  }
                  placeholder="100"
                  className="
                    w-full
                    rounded-2xl
                    border
                    border-purple-500/30
                    bg-[#151027]
                    p-4
                    text-white
                    outline-none
                  "
                />

              </div>

            </div>

            {/* COLORS */}

            <div className="mt-7">

              <h3
                className="
                  text-lg
                  font-black
                  text-white
                "
              >

                Colors

              </h3>

              <div className="mt-4 flex gap-4">

                {[
                  "Black",
                  "White",
                  "Blue",
                  "Red"
                ].map((color) => {

                  return (

                    <button
                      key={color}
                      onClick={() =>
                        setSelectedColor(
                          color
                        )
                      }
                      className={`
                        h-12
                        w-12
                        rounded-full
                        border-4

                        ${
                          selectedColor ===
                          color

                            ? "border-purple-500"

                            : "border-transparent"
                        }

                        ${
                          color ===
                          "Black"

                            ? "bg-black"

                            : color ===
                              "White"

                            ? "bg-white"

                            : color ===
                              "Blue"

                            ? "bg-blue-600"

                            : "bg-red-600"
                        }
                      `}
                    />
                  );
                })}

              </div>

            </div>

            {/* SIZE */}

            <div className="mt-7">

              <h3
                className="
                  text-lg
                  font-black
                  text-white
                "
              >

                Sizes

              </h3>

              <div className="mt-4 flex flex-wrap gap-3">

                {[
                  "S",
                  "M",
                  "L",
                  "XL",
                  "XXL"
                ].map((size) => {

                  const active =
                    selectedSizes.includes(
                      size
                    );

                  return (

                    <button
                      key={size}
                      onClick={() =>
                        toggleSize(
                          size
                        )
                      }
                      className={`
                        rounded-xl
                        border
                        px-5
                        py-3
                        text-sm
                        font-bold

                        ${
                          active

                            ? "border-purple-500 bg-purple-600 text-white"

                            : "border-white/10 bg-white/5 text-gray-300"
                        }
                      `}
                    >

                      {size}

                    </button>
                  );
                })}

              </div>

            </div>

            {/* MOCKUP */}

            <div className="mt-8">

              <h3
                className="
                  text-lg
                  font-black
                  text-white
                "
              >

                Media

              </h3>

              <div className="mt-5 grid gap-4 md:grid-cols-3">

                <div
                  className="
                    flex
                    h-48
                    flex-col
                    items-center
                    justify-center
                    rounded-3xl
                    border-2
                    border-dashed
                    border-purple-500/30
                    bg-[#151027]
                  "
                >

                  <UploadCloud
                    size={40}
                    className="
                      text-purple-400
                    "
                  />

                  <p
                    className="
                      mt-4
                      text-sm
                      font-bold
                      text-gray-300
                    "
                  >

                    Front Mockup

                  </p>

                </div>

                <div
                  className="
                    flex
                    h-48
                    flex-col
                    items-center
                    justify-center
                    rounded-3xl
                    border-2
                    border-dashed
                    border-purple-500/30
                    bg-[#151027]
                  "
                >

                  <UploadCloud
                    size={40}
                    className="
                      text-purple-400
                    "
                  />

                  <p
                    className="
                      mt-4
                      text-sm
                      font-bold
                      text-gray-300
                    "
                  >

                    Back Mockup

                  </p>

                </div>

                <div
                  className="
                    flex
                    h-48
                    flex-col
                    items-center
                    justify-center
                    rounded-3xl
                    border-2
                    border-dashed
                    border-purple-500/30
                    bg-[#151027]
                  "
                >

                  <UploadCloud
                    size={40}
                    className="
                      text-purple-400
                    "
                  />

                  <p
                    className="
                      mt-4
                      text-sm
                      font-bold
                      text-gray-300
                    "
                  >

                    Design File

                  </p>

                </div>

              </div>

            </div>

            {/* SAVE */}

            <button
              onClick={
                addProduct
              }
              disabled={
                uploading
              }
              className="
                mt-8
                w-full
                rounded-3xl
                bg-gradient-to-r
                from-purple-600
                to-pink-500
                px-6
                py-5
                text-xl
                font-black
                text-white
                shadow-[0_0_30px_rgba(168,85,247,0.8)]
              "
            >

              {uploading
                ? "Uploading..."
                : "Submit & Publish"}

            </button>

          </div>

        )}

        {/* ======================================================
        PRODUCTS TAB
        ====================================================== */}

        {activeTab ===
          "products" && (

          <>

            {/* CATEGORY */}

            <div className="mb-7 flex gap-3 overflow-x-auto">

              {categories.map(
                (category) => {

                  return (

                    <button
                      key={category}
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

                            ? "bg-purple-600 text-white"

                            : "bg-white/5 text-gray-300"
                        }
                      `}
                    >

                      {category}

                    </button>
                  );
                }
              )}

            </div>

            {/* PRODUCTS */}

            {loading ? (

              <div
                className="
                  text-center
                  text-2xl
                  font-black
                  text-white
                "
              >

                Loading...

              </div>

            ) : (

              <div className="grid gap-5">

                {filteredProducts.map(
                  (product) => {

                    return (

                      <div
                        key={
                          product.id
                        }
                        className="
                          rounded-[35px]
                          border
                          border-white/10
                          bg-[#0f0b1f]
                          p-5
                        "
                      >

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

                              <h2
                                className="
                                  text-2xl
                                  font-black
                                  text-white
                                "
                              >

                                {
                                  product.title
                                }

                              </h2>

                              <p
                                className="
                                  mt-2
                                  text-sm
                                  font-bold
                                  text-gray-400
                                "
                              >

                                {
                                  product.category
                                }

                              </p>

                              <div className="mt-3 flex gap-3">

                                <p
                                  className="
                                    text-lg
                                    font-black
                                    text-green-400
                                  "
                                >

                                  ₹
                                  {
                                    product.discountPrice
                                  }

                                </p>

                                <p
                                  className="
                                    text-sm
                                    font-bold
                                    text-gray-500
                                    line-through
                                  "
                                >

                                  ₹
                                  {
                                    product.price
                                  }

                                </p>

                              </div>

                              <p
                                className="
                                  mt-2
                                  text-sm
                                  font-bold
                                  text-gray-300
                                "
                              >

                                Stock:
                                {" "}
                                {
                                  product.stock
                                }

                              </p>

                            </div>

                          </div>

                          {/* ACTIONS */}

                          <div className="flex flex-col gap-3">

                            <button
                              onClick={() =>
                                setEditingProductId(
                                  product.id
                                )
                              }
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

                              <Pencil
                                size={18}
                              />

                              Edit

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

                                    : "bg-gray-600"
                                }
                              `}
                            >

                              {product.visible ? (
                                <Eye
                                  size={18}
                                />
                              ) : (
                                <EyeOff
                                  size={18}
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
                                size={18}
                              />

                              Delete

                            </button>

                          </div>

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
