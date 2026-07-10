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
        bg-[var(--primary-color)]
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
          border-[var(--border-color)]
          bg-[var(--card-color)]/90
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
                  text-[var(--text-color)]
                "
              />

            </button>

            <div>

              <h1
                className="
                  text-sm
                  font-black
                  text-[var(--text-color)]
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
                  text-[var(--primary-color)]
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
              from-[var(--primary-color)]
              to-[var(--primary-color)]
              text-xs
              font-black
              text-[var(--button-text-color)]
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
            bg-[var(--card-color)]
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

                  ? "bg-[var(--card-color)] text-[var(--primary-color)] shadow"

                  : "text-[var(--text-color)]"
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

                  ? "bg-[var(--card-color)] text-[var(--primary-color)] shadow"

                  : "text-[var(--text-color)]"
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
              border-[var(--border-color)]
              bg-[var(--card-color)]
              p-5
              shadow-sm
            "
          >

            <h2
              className="
                mb-5
                text-sm
                font-black
                text-[var(--text-color)]
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
                    text-[var(--text-color)]
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
                    border-[var(--border-color)]
                    bg-[var(--card-color)]
                    p-3
                    text-xs
                    outline-none
                    focus:border-[var(--primary-color)]
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
                    text-[var(--text-color)]
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
                    border-[var(--border-color)]
                    bg-[var(--card-color)]
                    p-3
                    text-xs
                    outline-none
                    focus:border-[var(--primary-color)]
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
                    text-[var(--text-color)]
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
                    border-[var(--border-color)]
                    bg-[var(--card-color)]
                    p-3
                    text-xs
                    outline-none
                    focus:border-[var(--primary-color)]
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
                      text-[var(--text-color)]
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
                      border-[var(--border-color)]
                      bg-[var(--card-color)]
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
                      text-[var(--text-color)]
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
                      border-[var(--border-color)]
                      bg-[var(--card-color)]
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
                    text-[var(--text-color)]
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
                    border-[var(--border-color)]
                    bg-[var(--card-color)]
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
                    border-[var(--border-color)]
                    bg-[var(--card-color)]
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
                    border-[var(--border-color)]
                    bg-[var(--card-color)]
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
                    text-[var(--text-color)]
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

                              ? "bg-[var(--primary-color)] text-[var(--button-text-color)]"

                              : "bg-[var(--card-color)] text-[var(--text-color)]"
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
                    text-[var(--text-color)]
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
                            bg-[var(--danger-color)]
                            p-1
                            text-[var(--button-text-color)]
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
                      border-[var(--border-color)]
                      bg-[var(--card-color)]
                    "
                  >

                    <ImagePlus
                      size={20}
                      className="
                        text-[var(--primary-color)]
                      "
                    />

                    <span
                      className="
                        mt-1
                        text-[10px]
                        font-bold
                        text-[var(--text-color)]
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
                    text-[var(--text-color)]
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
                            bg-[var(--danger-color)]
                            p-1
                            text-[var(--button-text-color)]
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
                      border-[var(--border-color)]
                      bg-[var(--card-color)]
                    "
                  >

                    <Video
                      size={20}
                      className="
                        text-[var(--primary-color)]
                      "
                    />

                    <span
                      className="
                        mt-1
                        text-[10px]
                        font-bold
                        text-[var(--text-color)]
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
                  from-[var(--primary-color)]
                  to-[var(--primary-color)]
                  py-4
                  text-xs
                  font-black
                  text-[var(--button-text-color)]
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

                          ? "border-[var(--border-color)] bg-[var(--card-color)] text-[var(--button-text-color)]"

                          : "border-[var(--border-color)] bg-[var(--card-color)] text-[var(--text-color)]"
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
                  text-[var(--text-color)]
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
                        border-[var(--border-color)]
                        bg-[var(--card-color)]
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
                                text-[var(--text-color)]
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
                                    text-[var(--success-color)]
                                  "
                                />

                              ) : (

                                <EyeOff
                                  size={18}
                                  className="
                                    text-[var(--text-color)]
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
                              text-[var(--text-color)]
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
                                text-[var(--text-color)]
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
                                  text-[var(--text-color)]
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
                              text-[var(--text-color)]
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
                            bg-[var(--primary-color)]
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
                            bg-[var(--danger-color)]
                            p-2
                            text-[var(--danger-color)]
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
                              border-[var(--border-color)]
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
                              border-[var(--border-color)]
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
                              bg-[var(--primary-color)]
                              py-3
                              text-xs
                              font-black
                              text-[var(--button-text-color)]
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
          border-[var(--border-color)]
          bg-[var(--card-color)]/90
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

                ? "text-[var(--primary-color)]"

                : "text-[var(--text-color)]"
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
            text-[var(--text-color)]
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

                ? "text-[var(--primary-color)]"

                : "text-[var(--text-color)]"
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
            text-[var(--text-color)]
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
