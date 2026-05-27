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
  Trash2,
  ImagePlus,
  Video,
  Star,
  Eye,
  EyeOff
} from "lucide-react";

import { db } from "@/firebase/config";

/* ======================================================
TYPES
====================================================== */

interface Variant {

  size: string;

  color: string;

  stock: number;

  price: number;
}

interface Specification {

  title: string;

  value: string;
}

interface Product {

  id: string;

  title: string;

  slug: string;

  shortDescription: string;

  description: string;

  category: string;

  brand: string;

  tags: string[];

  images: string[];

  videos: string[];

  thumbnail: string;

  price: number;

  discountPrice: number;

  costPrice: number;

  profit: number;

  stock: number;

  sku: string;

  rating: number;

  reviews: number;

  featured: boolean;

  visible: boolean;

  cod: boolean;

  freeShipping: boolean;

  weight: number;

  variants: Variant[];

  specifications: Specification[];

  seoTitle: string;

  seoDescription: string;

  affiliateCommission: number;

  mlmCommission: number;

  provider: string;

  createdAt: number;
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
  GENERATE SLUG
  ====================================================== */

  function generateSlug(
    text: string
  ) {

    return text

      .toLowerCase()

      .replace(/\s+/g, "-")

      .replace(
        /[^a-z0-9-]/g,
        ""
      );
  }

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

        slug:
          "new-product",

        shortDescription:
          "",

        description:
          "",

        category:
          "Fashion",

        brand:
          "JembeeKart",

        tags: [],

        images: [],

        videos: [],

        thumbnail: "",

        price: 2999,

        discountPrice: 1999,

        costPrice: 1000,

        profit: 999,

        stock: 100,

        sku:
          "SKU-" +
          Date.now(),

        rating: 4.5,

        reviews: 0,

        featured: false,

        visible: true,

        cod: true,

        freeShipping: false,

        weight: 0.5,

        variants: [],

        specifications: [],

        seoTitle: "",

        seoDescription: "",

        affiliateCommission: 5,

        mlmCommission: 10,

        provider: "manual",

        createdAt:
          Date.now()
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

    await deleteDoc(

      doc(
        db,
        "products",
        id
      )
    );
  }

  /* ======================================================
  ADD VARIANT
  ====================================================== */

  async function addVariant(
    product: Product
  ) {

    const variants = [

      ...(product.variants || []),

      {
        size: "M",

        color: "Black",

        stock: 10,

        price:
          product.price
      }
    ];

    await updateProduct(
      product.id,
      "variants",
      variants
    );
  }

  /* ======================================================
  ADD SPECIFICATION
  ====================================================== */

  async function addSpecification(
    product: Product
  ) {

    const specifications = [

      ...(product.specifications || []),

      {
        title: "Fabric",

        value: "Cotton"
      }
    ];

    await updateProduct(
      product.id,
      "specifications",
      specifications
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
          ...(product.images || []),

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
  UPLOAD VIDEO
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
          ...(product.videos || []),

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

    <main className="min-h-screen bg-gray-100 p-5">

      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <div className="mb-10 flex items-center justify-between">

          <div>

            <h1 className="text-5xl font-black">
              Products Admin
            </h1>

            <p className="mt-2 text-gray-500">
              Advanced Product Management
            </p>

          </div>

          <button
            onClick={
              addProduct
            }
            className="
              flex
              items-center
              gap-3
              rounded-2xl
              bg-blue-600
              px-7
              py-4
              font-bold
              text-white
            "
          >

            <Plus size={22} />

            Add Product

          </button>

        </div>

        {/* LOADING */}

        {loading ? (

          <div className="text-center text-2xl font-black">

            Loading...

          </div>

        ) : (

          <div className="space-y-8">

            {products.map(
              (product) => {

                return (

                  <div
                    key={product.id}
                    className="
                      rounded-[35px]
                      bg-white
                      p-6
                      shadow-xl
                    "
                  >

                    {/* TITLE */}

                    <input
                      type="text"
                      value={
                        product.title
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

                        updateProduct(
                          product.id,
                          "slug",

                          generateSlug(
                            e.target
                              .value
                          )
                        );
                      }}
                      className="
                        w-full
                        rounded-2xl
                        border
                        p-4
                        text-2xl
                        font-black
                      "
                    />

                    {/* PRICE */}

                    <div className="mt-5 grid gap-4 md:grid-cols-4">

                      <input
                        type="number"
                        value={
                          product.price
                        }
                        onChange={(
                          e
                        ) => {
                          updateProduct(
                            product.id,
                            "price",
                            Number(
                              e.target
                                .value
                            )
                          );
                        }}
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
                        ) => {
                          updateProduct(
                            product.id,
                            "discountPrice",
                            Number(
                              e.target
                                .value
                            )
                          );
                        }}
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
                        ) => {
                          updateProduct(
                            product.id,
                            "stock",
                            Number(
                              e.target
                                .value
                            )
                          );
                        }}
                        placeholder="Stock"
                        className="
                          rounded-2xl
                          border
                          p-4
                        "
                      />

                      <input
                        type="text"
                        value={
                          product.category
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
                        placeholder="Category"
                        className="
                          rounded-2xl
                          border
                          p-4
                        "
                      />

                    </div>

                    {/* BUTTONS */}

                    <div className="mt-6 flex flex-wrap gap-4">

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
                        multiple
                        hidden
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
                        multiple
                        hidden
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

                      {/* VARIANT */}

                      <button
                        onClick={() =>
                          addVariant(
                            product
                          )
                        }
                        className="
                          rounded-2xl
                          bg-green-600
                          px-5
                          py-4
                          font-bold
                          text-white
                        "
                      >

                        Add Variant

                      </button>

                      {/* SPEC */}

                      <button
                        onClick={() =>
                          addSpecification(
                            product
                          )
                        }
                        className="
                          rounded-2xl
                          bg-orange-600
                          px-5
                          py-4
                          font-bold
                          text-white
                        "
                      >

                        Add Specification

                      </button>

                      {/* FEATURED */}

                      <button
                        onClick={() => {

                          updateProduct(
                            product.id,
                            "featured",
                            !product.featured
                          );
                        }}
                        className={`
                          flex
                          items-center
                          gap-2
                          rounded-2xl
                          px-5
                          py-4
                          font-bold
                          text-white

                          ${
                            product.featured
                              ? "bg-yellow-500"
                              : "bg-gray-500"
                          }
                        `}
                      >

                        <Star size={20} />

                        Featured

                      </button>

                      {/* VISIBLE */}

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
                          px-5
                          py-4
                          font-bold
                          text-white

                          ${
                            product.visible
                              ? "bg-green-600"
                              : "bg-red-600"
                          }
                        `}
                      >

                        {product.visible ? (
                          <Eye size={20} />
                        ) : (
                          <EyeOff size={20} />
                        )}

                        Visible

                      </button>

                      {/* DELETE */}

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
                          px-5
                          py-4
                          font-bold
                          text-white
                        "
                      >

                        <Trash2 size={20} />

                        Delete

                      </button>

                    </div>

                    {/* IMAGES */}

                    <div className="mt-7 flex gap-4 overflow-x-auto">

                      {product.images?.map(
                        (
                          image,
                          index
                        ) => {

                          return (

                            <img
                              key={index}
                              src={image}
                              alt=""
                              className="
                                h-40
                                w-32
                                rounded-3xl
                                object-cover
                              "
                            />
                          );
                        }
                      )}

                    </div>

                    {/* VIDEOS */}

                    <div className="mt-7 flex gap-4 overflow-x-auto">

                      {product.videos?.map(
                        (
                          video,
                          index
                        ) => {

                          return (

                            <video
                              key={index}
                              src={video}
                              controls
                              className="
                                h-44
                                w-36
                                rounded-3xl
                                object-cover
                              "
                            />
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

      </div>

    </main>
  );
}
