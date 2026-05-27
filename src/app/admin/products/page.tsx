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
  UploadCloud,
  Menu,
  Search,
  Settings,
  Home,
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

  description: string;

  price: number;

  discountPrice: number;

  stock: number;

  sku: string;

  images: string[];

  videos: string[];

  visible: boolean;

  productType?: string;

  createdAt?: number;
}

/* ======================================================
COMPONENT
====================================================== */

export default function ProductsAdminPage() {

  /* ======================================================
  STATES
  ====================================================== */

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
  >("add");

  const [
    search,
    setSearch
  ] = useState("");

  const [
    editingProduct,
    setEditingProduct
  ] = useState<Product | null>(null);

  const [
    uploading,
    setUploading
  ] = useState(false);

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
  ] = useState("Men's T-Shirts");

  const [
    productType,
    setProductType
  ] = useState("Oversized Tee");

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
    productImages,
    setProductImages
  ] = useState<string[]>([]);

  const [
    frontMockup,
    setFrontMockup
  ] = useState("");

  const [
    backMockup,
    setBackMockup
  ] = useState("");

  const fileInputRef =
    useRef<HTMLInputElement | null>(
      null
    );

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

          setProducts(data);

          setLoading(false);
        }
      );

    return () =>
      unsubscribe();

  }, []);

  /* ======================================================
  FILTERS
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

  const filteredProducts =
    products.filter((p) => {

      const matchCategory =
        selectedCategory ===
          "All" ||
        p.category ===
          selectedCategory;

      const matchSearch =
        p.title
          .toLowerCase()
          .includes(
            search.toLowerCase()
          );

      return (
        matchCategory &&
        matchSearch
      );
    });

  /* ======================================================
  SIZE SELECT
  ====================================================== */

  function toggleSize(
    size: string
  ) {

    setSelectedSizes(
      (prev) => {

        if (
          prev.includes(size)
        ) {

          return prev.filter(
            (s) =>
              s !== size
          );
        }

        return [
          ...prev,
          size
        ];
      }
    );
  }

  /* ======================================================
  IMAGE UPLOAD
  ====================================================== */

  async function uploadImages(
    files: FileList
  ) {

    try {

      setUploading(true);

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

      setProductImages(
        (prev) => [
          ...prev,
          ...uploaded
        ]
      );

      if (
        uploaded[0]
      ) {

        setFrontMockup(
          uploaded[0]
        );
      }

      if (
        uploaded[1]
      ) {

        setBackMockup(
          uploaded[1]
        );
      }

      setUploading(false);

    } catch (error) {

      console.error(error);

      setUploading(false);
    }
  }

  /* ======================================================
  ADD PRODUCT
  ====================================================== */

  async function addProduct() {

    if (
      !title ||
      !sku
    ) {

      alert(
        "Please fill title & sku"
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

        productType,

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

        images:
          productImages,

        videos: [],

        visible: true,

        createdAt:
          Date.now()
      }
    );

    alert(
      "Product Added"
    );

    setTitle("");

    setDescription("");

    setPrice("");

    setDiscountPrice("");

    setStock("");

    setSku("");

    setProductImages([]);

    setFrontMockup("");

    setBackMockup("");

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
  UI
  ====================================================== */

  return (

    <main
      className="
        min-h-screen
        bg-gradient-to-br
        from-[#070518]
        via-[#0d0a21]
        to-[#12082f]
        pb-28
        text-white
      "
    >

      {/* HEADER */}

      <header
        className="
          sticky
          top-0
          z-50
          border-b
          border-white/10
          bg-[#0d0a21]/80
          backdrop-blur-xl
        "
      >

        <div
          className="
            mx-auto
            flex
            max-w-md
            items-center
            justify-between
            px-4
            py-4
          "
        >

          <div
            className="
              flex
              items-center
              gap-3
            "
          >

            <button>

              <Menu size={20} />

            </button>

            <h1
              className="
                text-sm
                font-black
              "
            >

              POD Connect Dashboard

            </h1>

          </div>

          <div
            className="
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-full
              bg-gradient-to-r
              from-indigo-500
              to-purple-500
              font-black
            "
          >

            J

          </div>

        </div>

      </header>

      {/* CONTENT */}

      <div
        className="
          mx-auto
          max-w-md
          px-4
          py-4
        "
      >

        {/* STATS */}

        <div
          className="
            mb-4
            grid
            grid-cols-3
            gap-3
          "
        >

          <div
            className="
              rounded-2xl
              border
              border-white/10
              bg-white/5
              p-3
              backdrop-blur-xl
            "
          >

            <p
              className="
                text-[10px]
                text-gray-400
              "
            >

              Total

            </p>

            <h2
              className="
                mt-1
                text-xl
                font-black
              "
            >

              {products.length}

            </h2>

          </div>

          <div
            className="
              rounded-2xl
              border
              border-white/10
              bg-white/5
              p-3
            "
          >

            <p
              className="
                text-[10px]
                text-gray-400
              "
            >

              Visible

            </p>

            <h2
              className="
                mt-1
                text-xl
                font-black
                text-green-400
              "
            >

              {
                products.filter(
                  p =>
                    p.visible
                ).length
              }

            </h2>

          </div>

          <div
            className="
              rounded-2xl
              border
              border-white/10
              bg-white/5
              p-3
            "
          >

            <p
              className="
                text-[10px]
                text-gray-400
              "
            >

              Hidden

            </p>

            <h2
              className="
                mt-1
                text-xl
                font-black
                text-red-400
              "
            >

              {
                products.filter(
                  p =>
                    !p.visible
                ).length
              }

            </h2>

          </div>

        </div>

        {/* TABS */}

        <div
          className="
            mb-5
            grid
            grid-cols-2
            gap-2
            rounded-2xl
            border
            border-white/10
            bg-white/5
            p-1
          "
        >

          <button
            onClick={() =>
              setActiveTab(
                "add"
              )
            }
            className={`
              flex
              items-center
              justify-center
              gap-2
              rounded-xl
              py-3
              text-xs
              font-black
              transition-all

              ${
                activeTab ===
                "add"

                  ? "bg-indigo-600 text-white"

                  : "text-gray-400"
              }
            `}
          >

            <Plus size={15} />

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
              justify-center
              gap-2
              rounded-xl
              py-3
              text-xs
              font-black
              transition-all

              ${
                activeTab ===
                "products"

                  ? "bg-indigo-600 text-white"

                  : "text-gray-400"
              }
            `}
          >

            <Package2
              size={15}
            />

            Products

          </button>

        </div>

        {/* ======================================================
        ADD PRODUCT FORM
        ====================================================== */}

        {activeTab ===
          "add" && (

          <div
            className="
              rounded-3xl
              border
              border-white/10
              bg-white/5
              p-5
              backdrop-blur-xl
            "
          >

            <h2
              className="
                mb-5
                text-lg
                font-black
              "
            >

              Add Product

            </h2>

            {/* TITLE + SKU */}

            <div
              className="
                grid
                grid-cols-2
                gap-3
              "
            >

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
                  w-full
                  rounded-xl
                  border
                  border-indigo-500/20
                  bg-[#151133]/80
                  p-3
                  text-sm
                  text-white
                  outline-none
                  transition-all
                  focus:border-indigo-400
                  focus:shadow-[0_0_15px_rgba(99,102,241,0.5)]
                "
              />

              <input
                type="text"
                value={sku}
                onChange={(e) =>
                  setSku(
                    e.target.value
                  )
                }
                placeholder="SKU"
                className="
                  w-full
                  rounded-xl
                  border
                  border-indigo-500/20
                  bg-[#151133]/80
                  p-3
                  text-sm
                  text-white
                  outline-none
                "
              />

            </div>

            {/* DESCRIPTION */}

            <textarea
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
              placeholder="Description"
              rows={4}
              className="
                mt-4
                w-full
                rounded-xl
                border
                border-indigo-500/20
                bg-[#151133]/80
                p-3
                text-sm
                text-white
                outline-none
              "
            />

            {/* PRICE */}

            <div
              className="
                mt-4
                grid
                grid-cols-2
                gap-3
              "
            >

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
                  rounded-xl
                  border
                  border-indigo-500/20
                  bg-[#151133]/80
                  p-3
                  text-sm
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
                  rounded-xl
                  border
                  border-indigo-500/20
                  bg-[#151133]/80
                  p-3
                  text-sm
                "
              />

            </div>

            {/* CATEGORY */}

            <div
              className="
                mt-4
                grid
                grid-cols-2
                gap-3
              "
            >

              <select
                value={category}
                onChange={(e) =>
                  setCategory(
                    e.target.value
                  )
                }
                className="
                  rounded-xl
                  border
                  border-indigo-500/20
                  bg-[#151133]/80
                  p-3
                  text-sm
                "
              >

                <option>
                  Men's T-Shirts
                </option>

                <option>
                  Hoodies
                </option>

              </select>

              <select
                value={
                  productType
                }
                onChange={(e) =>
                  setProductType(
                    e.target.value
                  )
                }
                className="
                  rounded-xl
                  border
                  border-indigo-500/20
                  bg-[#151133]/80
                  p-3
                  text-sm
                "
              >

                <option>
                  Oversized Tee
                </option>

                <option>
                  Hoodie
                </option>

              </select>

            </div>

            {/* SIZES */}

            <div className="mt-5">

              <p
                className="
                  mb-2
                  text-xs
                  font-bold
                  text-gray-400
                "
              >

                Sizes

              </p>

              <div
                className="
                  flex
                  gap-2
                "
              >

                {[
                  "S",
                  "M",
                  "L",
                  "XL"
                ].map(
                  (size) => (

                    <button
                      key={size}
                      type="button"
                      onClick={() =>
                        toggleSize(
                          size
                        )
                      }
                      className={`
                        rounded-lg
                        px-4
                        py-2
                        text-xs
                        font-black

                        ${
                          selectedSizes.includes(
                            size
                          )

                            ? "bg-indigo-600"

                            : "bg-white/10"
                        }
                      `}
                    >

                      {size}

                    </button>
                  )
                )}

              </div>

            </div>

            {/* MEDIA */}

            <div className="mt-6">

              <p
                className="
                  mb-3
                  text-xs
                  font-bold
                  text-gray-400
                "
              >

                Media

              </p>

              <div
                className="
                  grid
                  grid-cols-2
                  gap-3
                "
              >

                {/* FRONT */}

                <div
                  className="
                    relative
                    flex
                    h-32
                    items-center
                    justify-center
                    overflow-hidden
                    rounded-2xl
                    border
                    border-white/10
                    bg-[#151133]
                  "
                >

                  {
                    frontMockup ? (

                      <img
                        src={
                          frontMockup
                        }
                        alt=""
                        className="
                          h-full
                          w-full
                          object-cover
                        "
                      />

                    ) : (

                      <div
                        className="
                          text-4xl
                        "
                      >
                        👕
                      </div>

                    )
                  }

                </div>

                {/* BACK */}

                <div
                  className="
                    relative
                    flex
                    h-32
                    items-center
                    justify-center
                    overflow-hidden
                    rounded-2xl
                    border
                    border-white/10
                    bg-[#151133]
                  "
                >

                  {
                    backMockup ? (

                      <img
                        src={
                          backMockup
                        }
                        alt=""
                        className="
                          h-full
                          w-full
                          object-cover
                        "
                      />

                    ) : (

                      <div
                        className="
                          text-4xl
                        "
                      >
                        📦
                      </div>

                    )
                  }

                </div>

              </div>

              {/* UPLOAD */}

              <label
                className="
                  mt-4
                  flex
                  cursor-pointer
                  items-center
                  justify-center
                  gap-2
                  rounded-2xl
                  border
                  border-dashed
                  border-indigo-500/30
                  bg-[#151133]
                  p-4
                  text-xs
                  font-bold
                  text-indigo-300
                "
              >

                <UploadCloud
                  size={16}
                />

                Upload Images

                <input
                  ref={
                    fileInputRef
                  }
                  type="file"
                  hidden
                  multiple
                  accept="image/*"
                  onChange={async (
                    e
                  ) => {

                    const files =
                      e.target
                        .files;

                    if (
                      files
                    ) {

                      await uploadImages(
                        files
                      );
                    }
                  }}
                />

              </label>

            </div>

            {/* SUBMIT */}

            <button
              onClick={
                addProduct
              }
              disabled={
                uploading
              }
              className="
                mt-6
                w-full
                rounded-2xl
                bg-gradient-to-r
                from-indigo-500
                via-purple-500
                to-pink-500
                py-4
                text-sm
                font-black
                text-white
                shadow-lg
                shadow-purple-500/20
                transition-all
                hover:scale-[1.02]
                active:scale-[0.98]
              "
            >

              {
                uploading

                  ? "Uploading..."

                  : "Submit & Publish"
              }

            </button>

          </div>

        )}

        {/* ======================================================
        PRODUCTS LIST
        ====================================================== */}

        {activeTab ===
          "products" && (

          <>

            {/* SEARCH */}

            <div
              className="
                relative
                mb-4
              "
            >

              <Search
                size={16}
                className="
                  absolute
                  left-3
                  top-1/2
                  -translate-y-1/2
                  text-gray-500
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
                placeholder="Search products..."
                className="
                  w-full
                  rounded-2xl
                  border
                  border-white/10
                  bg-white/5
                  py-3
                  pl-10
                  pr-4
                  text-sm
                  text-white
                  outline-none
                "
              />

            </div>

            {/* CATEGORIES */}

            <div
              className="
                mb-4
                flex
                gap-2
                overflow-x-auto
              "
            >

              {categories.map(
                (category) => (

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
                      px-4
                      py-2
                      text-xs
                      font-black

                      ${
                        selectedCategory ===
                        category

                          ? "bg-indigo-600"

                          : "bg-white/10"
                      }
                    `}
                  >

                    {category}

                  </button>
                )
              )}

            </div>

            {/* PRODUCTS */}

            <div
              className="
                grid
                gap-4
              "
            >

              {filteredProducts.map(
                (
                  product
                ) => (

                  <div
                    key={
                      product.id
                    }
                    className="
                      relative
                      rounded-3xl
                      border
                      border-white/10
                      bg-white/5
                      p-4
                      backdrop-blur-xl
                    "
                  >

                    <div
                      className="
                        flex
                        gap-3
                      "
                    >

                      <img
                        src={
                          product
                            .images?.[0] ||

                          "https://placehold.co/200x200"
                        }
                        alt=""
                        className="
                          h-24
                          w-24
                          rounded-2xl
                          object-cover
                        "
                      />

                      <div
                        className="
                          flex-1
                        "
                      >

                        <h2
                          className="
                            text-sm
                            font-black
                          "
                        >

                          {
                            product.title
                          }

                        </h2>

                        <p
                          className="
                            mt-1
                            text-[11px]
                            text-gray-400
                          "
                        >

                          {
                            product.category
                          }

                        </p>

                        <div
                          className="
                            mt-2
                            flex
                            items-center
                            gap-2
                          "
                        >

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
                              text-xs
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
                            text-[11px]
                            text-gray-400
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

                    <div
                      className="
                        mt-4
                        flex
                        justify-end
                        gap-2
                      "
                    >

                      <button
                        onClick={() =>
                          setEditingProduct(
                            product
                          )
                        }
                        className="
                          rounded-xl
                          bg-blue-600/20
                          p-2
                          text-blue-400
                        "
                      >

                        <Pencil
                          size={15}
                        />

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
                          rounded-xl
                          p-2

                          ${
                            product.visible

                              ? "bg-green-600/20 text-green-400"

                              : "bg-gray-600/20 text-gray-400"
                          }
                        `}
                      >

                        {
                          product.visible

                            ? (
                              <Eye
                                size={15}
                              />
                            )

                            : (
                              <EyeOff
                                size={15}
                              />
                            )
                        }

                      </button>

                      <button
                        onClick={() =>
                          deleteProduct(
                            product.id
                          )
                        }
                        className="
                          rounded-xl
                          bg-red-600/20
                          p-2
                          text-red-400
                        "
                      >

                        <Trash2
                          size={15}
                        />

                      </button>

                    </div>

                  </div>
                )
              )}

            </div>

          </>

        )}

      </div>

      {/* EDIT MODAL */}

      {
        editingProduct && (

          <div
            className="
              fixed
              inset-0
              z-50
              flex
              items-center
              justify-center
              bg-black/70
              p-4
              backdrop-blur-sm
            "
          >

            <div
              className="
                w-full
                max-w-md
                rounded-3xl
                border
                border-white/10
                bg-[#0d0a21]
                p-5
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

                <h2
                  className="
                    text-lg
                    font-black
                  "
                >

                  Edit Product

                </h2>

                <button
                  onClick={() =>
                    setEditingProduct(
                      null
                    )
                  }
                >

                  <X size={20} />

                </button>

              </div>

              <input
                type="text"
                value={
                  editingProduct.title
                }
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    title:
                      e.target.value
                  })
                }
                className="
                  w-full
                  rounded-xl
                  border
                  border-white/10
                  bg-white/5
                  p-3
                "
              />

              <button
                onClick={async () => {

                  await updateProduct(
                    editingProduct.id,
                    "title",
                    editingProduct.title
                  );

                  setEditingProduct(
                    null
                  );
                }}
                className="
                  mt-4
                  w-full
                  rounded-2xl
                  bg-indigo-600
                  py-3
                  font-black
                "
              >

                Save Changes

              </button>

            </div>

          </div>

        )
      }

      {/* BOTTOM NAV */}

      <nav
        className="
          fixed
          bottom-3
          left-1/2
          z-50
          flex
          h-14
          w-[92%]
          max-w-md
          -translate-x-1/2
          items-center
          justify-around
          rounded-2xl
          border
          border-white/10
          bg-[#0d0a21]/90
          backdrop-blur-xl
        "
      >

        <button
          onClick={() =>
            setActiveTab(
              "add"
            )
          }
          className={`
            flex
            flex-col
            items-center
            gap-1

            ${
              activeTab ===
              "add"

                ? "text-indigo-400"

                : "text-gray-500"
            }
          `}
        >

          <Home size={18} />

          <span
            className="
              text-[9px]
            "
          >
            Home
          </span>

        </button>

        <button
          className="
            flex
            flex-col
            items-center
            gap-1
            text-gray-500
          "
        >

          <Search
            size={18}
          />

          <span
            className="
              text-[9px]
            "
          >
            Search
          </span>

        </button>

        <button
          onClick={() =>
            setActiveTab(
              "products"
            )
          }
          className={`
            flex
            flex-col
            items-center
            gap-1

            ${
              activeTab ===
              "products"

                ? "text-indigo-400"

                : "text-gray-500"
            }
          `}
        >

          <Package2
            size={18}
          />

          <span
            className="
              text-[9px]
            "
          >
            Products
          </span>

        </button>

        <button
          className="
            flex
            flex-col
            items-center
            gap-1
            text-gray-500
          "
        >

          <Settings
            size={18}
          />

          <span
            className="
              text-[9px]
            "
          >
            Settings
          </span>

        </button>

      </nav>

    </main>
  );
}
