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
  Grid,
  X,
  Video,
  ImagePlus
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
    editingProductId,
    setEditingProductId
  ] = useState("");

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
    productVideos,
    setProductVideos
  ] = useState<string[]>([]);

  const imageInputRef =
    useRef<HTMLInputElement | null>(
      null
    );

  const videoInputRef =
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
  FILTER
  ====================================================== */

  const categories = [

    "All",

    ...new Set(
      products.map(
        (p) =>
          p.category
      )
    )
  ];

  const filteredProducts =
    selectedCategory ===
    "All"

      ? products

      : products.filter(
          (p) =>
            p.category ===
            selectedCategory
        );

  /* ======================================================
  TOGGLE SIZE
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
  CLOUDINARY IMAGE UPLOAD
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

      setUploading(false);

    } catch (error) {

      console.error(
        error
      );

      setUploading(false);
    }
  }

  /* ======================================================
  CLOUDINARY VIDEO UPLOAD
  ====================================================== */

  async function uploadVideos(
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

      setProductVideos(
        (prev) => [
          ...prev,
          ...uploaded
        ]
      );

      setUploading(false);

    } catch (error) {

      console.error(
        error
      );

      setUploading(false);
    }
  }

  /* ======================================================
  ADD PRODUCT
  ====================================================== */

  async function addProduct() {

    if (
      !title ||
      !sku ||
      !price
    ) {

      alert(
        "Please fill Title, SKU & Price"
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
          ) || 0,

        stock:
          Number(stock) || 0,

        sku,

        images:
          productImages,

        videos:
          productVideos,

        visible: true
      }
    );

    alert(
      "Product Added Successfully"
    );

    /* RESET */

    setTitle("");

    setDescription("");

    setPrice("");

    setDiscountPrice("");

    setStock("");

    setSku("");

    setProductImages([]);

    setProductVideos([]);

    setSelectedSizes([]);

    setActiveTab(
      "products"
    );
  }

  /* ======================================================
  UPDATE
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
  DELETE
  ====================================================== */

  async function deleteProduct(
    id: string
  ) {

    const confirmDelete =
      confirm(
        "Delete this product?"
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
        bg-[#F8FAFC]
        pb-24
      "
    >

      {/* ======================================================
      HEADER
      ====================================================== */}

      <header
        className="
          sticky
          top-0
          z-50
          border-b
          border-slate-200
          bg-white/90
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

              <Menu
                size={22}
                className="
                  text-slate-700
                "
              />

            </button>

            <div>

              <h1
                className="
                  text-sm
                  font-black
                  text-slate-900
                "
              >

                POD Connect

              </h1>

              <p
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-widest
                  text-indigo-600
                "
              >

                Admin Suite

              </p>

            </div>

          </div>

          <div
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              bg-gradient-to-r
              from-indigo-500
              to-purple-500
              text-xs
              font-black
              text-white
            "
          >

            SI

          </div>

        </div>

      </header>

      {/* ======================================================
      CONTENT
      ====================================================== */}

      <div
        className="
          mx-auto
          max-w-md
          px-4
          py-5
        "
      >

        {/* TABS */}

        <div
          className="
            mb-6
            grid
            grid-cols-2
            gap-2
            rounded-2xl
            bg-slate-100
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

                  ? "bg-white text-indigo-600 shadow"

                  : "text-slate-500"
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

                  ? "bg-white text-indigo-600 shadow"

                  : "text-slate-500"
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
        ADD PRODUCT PAGE
        ====================================================== */}

        {activeTab ===
          "add" && (

          <div
            className="
              rounded-3xl
              border
              border-slate-200
              bg-white
              p-5
              shadow-sm
            "
          >

            <h2
              className="
                mb-5
                text-sm
                font-black
                text-slate-900
              "
            >

              Create Product

            </h2>

            {/* TITLE */}

            <div className="space-y-4">

              <div>

                <label
                  className="
                    mb-1
                    block
                    text-[11px]
                    font-bold
                    text-slate-500
                  "
                >

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
                  placeholder="Samurai T-Shirt"
                  className="
                    w-full
                    rounded-xl
                    border
                    border-slate-200
                    bg-slate-50
                    p-3
                    text-xs
                    outline-none
                    focus:border-indigo-500
                  "
                />

              </div>

              {/* SKU */}

              <div>

                <label
                  className="
                    mb-1
                    block
                    text-[11px]
                    font-bold
                    text-slate-500
                  "
                >

                  SKU

                </label>

                <input
                  type="text"
                  value={sku}
                  onChange={(e) =>
                    setSku(
                      e.target.value
                    )
                  }
                  placeholder="TS-001"
                  className="
                    w-full
                    rounded-xl
                    border
                    border-slate-200
                    bg-slate-50
                    p-3
                    text-xs
                    outline-none
                    focus:border-indigo-500
                  "
                />

              </div>

              {/* DESCRIPTION */}

              <div>

                <label
                  className="
                    mb-1
                    block
                    text-[11px]
                    font-bold
                    text-slate-500
                  "
                >

                  Description

                </label>

                <textarea
                  rows={4}
                  value={
                    description
                  }
                  onChange={(e) =>
                    setDescription(
                      e.target.value
                    )
                  }
                  placeholder="Write description..."
                  className="
                    w-full
                    rounded-xl
                    border
                    border-slate-200
                    bg-slate-50
                    p-3
                    text-xs
                    outline-none
                    focus:border-indigo-500
                  "
                />

              </div>

              {/* PRICE */}

              <div
                className="
                  grid
                  grid-cols-2
                  gap-3
                "
              >

                <div>

                  <label
                    className="
                      mb-1
                      block
                      text-[11px]
                      font-bold
                      text-slate-500
                    "
                  >

                    Price

                  </label>

                  <input
                    type="number"
                    value={price}
                    onChange={(e) =>
                      setPrice(
                        e.target.value
                      )
                    }
                    placeholder="599"
                    className="
                      w-full
                      rounded-xl
                      border
                      border-slate-200
                      bg-slate-50
                      p-3
                      text-xs
                      outline-none
                    "
                  />

                </div>

                <div>

                  <label
                    className="
                      mb-1
                      block
                      text-[11px]
                      font-bold
                      text-slate-500
                    "
                  >

                    Discount

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
                    placeholder="399"
                    className="
                      w-full
                      rounded-xl
                      border
                      border-slate-200
                      bg-slate-50
                      p-3
                      text-xs
                      outline-none
                    "
                  />

                </div>

              </div>

              {/* STOCK */}

              <div>

                <label
                  className="
                    mb-1
                    block
                    text-[11px]
                    font-bold
                    text-slate-500
                  "
                >

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
                    rounded-xl
                    border
                    border-slate-200
                    bg-slate-50
                    p-3
                    text-xs
                    outline-none
                  "
                />

              </div>

              {/* CATEGORY */}

              <div
                className="
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
                    border-slate-200
                    bg-slate-50
                    p-3
                    text-xs
                    outline-none
                  "
                >

                  <option>
                    Men's T-Shirts
                  </option>

                  <option>
                    Hoodies
                  </option>

                  <option>
                    Women's Wear
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
                    border-slate-200
                    bg-slate-50
                    p-3
                    text-xs
                    outline-none
                  "
                >

                  <option>
                    Oversized Tee
                  </option>

                  <option>
                    Standard Fit
                  </option>

                  <option>
                    Premium Hoodie
                  </option>

                </select>

              </div>

              {/* SIZES */}

              <div>

                <p
                  className="
                    mb-2
                    text-[11px]
                    font-bold
                    text-slate-500
                  "
                >

                  Select Sizes

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
                          text-[11px]
                          font-black
                          transition-all

                          ${
                            selectedSizes.includes(
                              size
                            )

                              ? "bg-indigo-600 text-white"

                              : "bg-slate-100 text-slate-700"
                          }
                        `}
                      >

                        {size}

                      </button>
                    )
                  )}

                </div>

              </div>

              {/* ======================================================
              IMAGE UPLOAD
              ====================================================== */}

              <div>

                <p
                  className="
                    mb-3
                    text-[11px]
                    font-bold
                    text-slate-500
                  "
                >

                  Product Images

                </p>

                <div
                  className="
                    grid
                    grid-cols-3
                    gap-2
                  "
                >

                  {productImages.map(
                    (
                      image,
                      index
                    ) => (

                      <div
                        key={index}
                        className="
                          relative
                          h-24
                          overflow-hidden
                          rounded-xl
                          border
                        "
                      >

                        <img
                          src={image}
                          alt=""
                          className="
                            h-full
                            w-full
                            object-cover
                          "
                        />

                        <button
                          onClick={() => {

                            const updated =
                              productImages.filter(
                                (
                                  _,
                                  i
                                ) =>
                                  i !==
                                  index
                              );

                            setProductImages(
                              updated
                            );
                          }}
                          className="
                            absolute
                            right-1
                            top-1
                            rounded-full
                            bg-red-500
                            p-1
                            text-white
                          "
                        >

                          <X
                            size={12}
                          />

                        </button>

                      </div>
                    )
                  )}

                  {/* ADD IMAGE */}

                  <button
                    type="button"
                    onClick={() =>
                      imageInputRef.current?.click()
                    }
                    className="
                      flex
                      h-24
                      flex-col
                      items-center
                      justify-center
                      rounded-xl
                      border-2
                      border-dashed
                      border-slate-300
                      bg-slate-50
                    "
                  >

                    <ImagePlus
                      size={20}
                      className="
                        text-indigo-500
                      "
                    />

                    <span
                      className="
                        mt-1
                        text-[10px]
                        font-bold
                        text-slate-500
                      "
                    >

                      Upload

                    </span>

                  </button>

                </div>

                <input
                  ref={
                    imageInputRef
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

              </div>

              {/* ======================================================
              VIDEO UPLOAD
              ====================================================== */}

              <div>

                <p
                  className="
                    mb-3
                    text-[11px]
                    font-bold
                    text-slate-500
                  "
                >

                  Product Videos

                </p>

                <div
                  className="
                    grid
                    grid-cols-2
                    gap-3
                  "
                >

                  {productVideos.map(
                    (
                      video,
                      index
                    ) => (

                      <div
                        key={index}
                        className="
                          relative
                          overflow-hidden
                          rounded-xl
                          border
                        "
                      >

                        <video
                          src={video}
                          controls
                          className="
                            h-32
                            w-full
                            object-cover
                          "
                        />

                        <button
                          onClick={() => {

                            const updated =
                              productVideos.filter(
                                (
                                  _,
                                  i
                                ) =>
                                  i !==
                                  index
                              );

                            setProductVideos(
                              updated
                            );
                          }}
                          className="
                            absolute
                            right-1
                            top-1
                            rounded-full
                            bg-red-500
                            p-1
                            text-white
                          "
                        >

                          <X
                            size={12}
                          />

                        </button>

                      </div>
                    )
                  )}

                  {/* ADD VIDEO */}

                  <button
                    type="button"
                    onClick={() =>
                      videoInputRef.current?.click()
                    }
                    className="
                      flex
                      h-32
                      flex-col
                      items-center
                      justify-center
                      rounded-xl
                      border-2
                      border-dashed
                      border-slate-300
                      bg-slate-50
                    "
                  >

                    <Video
                      size={20}
                      className="
                        text-purple-500
                      "
                    />

                    <span
                      className="
                        mt-1
                        text-[10px]
                        font-bold
                        text-slate-500
                      "
                    >

                      Upload Video

                    </span>

                  </button>

                </div>

                <input
                  ref={
                    videoInputRef
                  }
                  type="file"
                  hidden
                  multiple
                  accept="video/*"
                  onChange={async (
                    e
                  ) => {

                    const files =
                      e.target
                        .files;

                    if (
                      files
                    ) {

                      await uploadVideos(
                        files
                      );
                    }
                  }}
                />

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
                  w-full
                  rounded-2xl
                  bg-gradient-to-r
                  from-indigo-600
                  to-purple-600
                  py-4
                  text-xs
                  font-black
                  text-white
                  shadow-lg
                "
              >

                {
                  uploading

                    ? "Uploading..."

                    : "Push Product Live"
                }

              </button>

            </div>

          </div>

        )}

        {/* ======================================================
        PRODUCTS LIST
        ====================================================== */}

        {activeTab ===
          "products" && (

          <div className="space-y-4">

            {/* CATEGORY */}

            <div
              className="
                flex
                gap-2
                overflow-x-auto
                pb-1
              "
            >

              {categories.map(
                (cat) => (

                  <button
                    key={cat}
                    onClick={() =>
                      setSelectedCategory(
                        cat
                      )
                    }
                    className={`
                      whitespace-nowrap
                      rounded-full
                      border
                      px-4
                      py-2
                      text-[11px]
                      font-black

                      ${
                        selectedCategory ===
                        cat

                          ? "border-slate-900 bg-slate-900 text-white"

                          : "border-slate-200 bg-white text-slate-600"
                      }
                    `}
                  >

                    {cat}

                  </button>
                )
              )}

            </div>

            {/* LOADING */}

            {loading ? (

              <div
                className="
                  py-20
                  text-center
                  text-sm
                  font-bold
                  text-slate-400
                "
              >

                Loading...

              </div>

            ) : (

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
                        rounded-3xl
                        border
                        border-slate-200
                        bg-white
                        p-4
                        shadow-sm
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

                          <div
                            className="
                              flex
                              items-center
                              justify-between
                              gap-2
                            "
                          >

                            <h2
                              className="
                                text-sm
                                font-black
                                text-slate-900
                              "
                            >

                              {
                                product.title
                              }

                            </h2>

                            <button
                              onClick={() =>
                                updateProduct(
                                  product.id,
                                  "visible",

                                  !product.visible
                                )
                              }
                            >

                              {product.visible ? (

                                <Eye
                                  size={18}
                                  className="
                                    text-green-500
                                  "
                                />

                              ) : (

                                <EyeOff
                                  size={18}
                                  className="
                                    text-slate-400
                                  "
                                />

                              )}

                            </button>

                          </div>

                          <p
                            className="
                              mt-1
                              text-[11px]
                              font-bold
                              text-slate-400
                            "
                          >

                            {
                              product.productType
                            }

                          </p>

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
                                text-lg
                                font-black
                                text-slate-900
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
                                  text-slate-400
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

                          <p
                            className="
                              mt-2
                              text-[11px]
                              font-bold
                              text-slate-500
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
                            setEditingProductId(
                              product.id
                            )
                          }
                          className="
                            rounded-xl
                            bg-blue-50
                            p-2
                            theme-primary-text
                          "
                        >

                          <Pencil
                            size={15}
                          />

                        </button>

                        <button
                          onClick={() =>
                            deleteProduct(
                              product.id
                            )
                          }
                          className="
                            rounded-xl
                            bg-red-50
                            p-2
                            text-red-600
                          "
                        >

                          <Trash2
                            size={15}
                          />

                        </button>

                      </div>

                      {/* EDIT MODE */}

                      {editingProductId ===
                        product.id && (

                        <div
                          className="
                            mt-5
                            border-t
                            pt-5
                          "
                        >

                          <input
                            type="text"
                            defaultValue={
                              product.title
                            }
                            onBlur={(
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
                              mb-3
                              w-full
                              rounded-xl
                              border
                              border-slate-200
                              p-3
                              text-xs
                            "
                          />

                          <textarea
                            defaultValue={
                              product.description
                            }
                            onBlur={(
                              e
                            ) =>
                              updateProduct(
                                product.id,
                                "description",
                                e.target
                                  .value
                              )
                            }
                            className="
                              mb-3
                              w-full
                              rounded-xl
                              border
                              border-slate-200
                              p-3
                              text-xs
                            "
                          />

                          <button
                            onClick={() =>
                              setEditingProductId(
                                ""
                              )
                            }
                            className="
                              w-full
                              rounded-xl
                              bg-indigo-600
                              py-3
                              text-xs
                              font-black
                              text-white
                            "
                          >

                            Save Changes

                          </button>

                        </div>

                      )}

                    </div>
                  )
                )}

              </div>

            )}

          </div>

        )}

      </div>

      {/* ======================================================
      BOTTOM NAVIGATION
      ====================================================== */}

      <nav
        className="
          fixed
          bottom-0
          left-0
          right-0
          z-50
          flex
          h-16
          items-center
          justify-around
          border-t
          border-slate-200
          bg-white/90
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

                ? "text-indigo-600"

                : "text-slate-400"
            }
          `}
        >

          <Home size={20} />

          <span
            className="
              text-[9px]
              font-bold
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
            text-slate-400
          "
        >

          <Search
            size={20}
          />

          <span
            className="
              text-[9px]
              font-bold
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

                ? "text-indigo-600"

                : "text-slate-400"
            }
          `}
        >

          <Grid size={20} />

          <span
            className="
              text-[9px]
              font-bold
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
            text-slate-400
          "
        >

          <Settings
            size={20}
          />

          <span
            className="
              text-[9px]
              font-bold
            "
          >

            Settings

          </span>

        </button>

      </nav>

    </main>
  );
}
