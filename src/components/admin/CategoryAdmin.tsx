"use client";

import {
  useEffect,
  useRef,
  useState
} from "react";

import {
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc
} from "firebase/firestore";

import {
  db
} from "@/firebase/config";

import {
  ChevronUp,
  Grid3X3,
  Plus,
  Trash2,
  ImagePlus
} from "lucide-react";

/* ======================================================
TYPES
====================================================== */

interface CategoryItem {
  id: string;

  title: string;

  image: string;

  backgroundColor: string;

  textColor: string;

  borderRadius: string;

  cardWidth: string;

  cardHeight: string;

  imageHeight: string;

  titleSize: string;

  visible: boolean;

  position: number;
}

/* ======================================================
COMPONENT
====================================================== */

export default function CategoryAdmin() {
  const [categories, setCategories] =
    useState<CategoryItem[]>([]);

  const [
    expandedCategories,
    setExpandedCategories
  ] = useState<{
    [key: string]: boolean;
  }>({});

  const fileInputRefs =
    useRef<{
      [key: string]:
        | HTMLInputElement
        | null;
    }>({});

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
          const data =
            snapshot.docs.map(
              (document) => {
                return {
                  id: document.id,

                  ...(document.data() as Omit<
                    CategoryItem,
                    "id"
                  >)
                };
              }
            );

          setCategories(data);
        }
      );

    return () =>
      unsubscribe();
  }, []);

  /* ======================================================
  CREATE CATEGORY
  ====================================================== */

  async function createCategory() {
    await addDoc(
      collection(
        db,
        "categories"
      ),
      {
        title:
          "New Category",

        image: "",

        backgroundColor:
          "#2563eb",

        textColor:
          "#ffffff",

        borderRadius:
          "28px",

        cardWidth:
          "95px",

        cardHeight:
          "110px",

        imageHeight:
          "75px",

        titleSize:
          "13px",

        visible: true,

        position:
          categories.length +
          1
      }
    );
  }

  /* ======================================================
  TOGGLE
  ====================================================== */

  function toggleCategory(
    id: string
  ) {
    setExpandedCategories(
      (previous) => {
        return {
          ...previous,

          [id]:
            !previous[id]
        };
      }
    );
  }

  /* ======================================================
  UPDATE FIELD
  ====================================================== */

  async function updateField(
    id: string,
    field: string,
    value: string | boolean
  ) {
    const reference =
      doc(
        db,
        "categories",
        id
      );

    await updateDoc(
      reference,
      {
        [field]: value
      }
    );
  }

  /* ======================================================
  DELETE
  ====================================================== */

  async function deleteCategory(
    id: string
  ) {
    await deleteDoc(
      doc(
        db,
        "categories",
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
            500;

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
    categoryId: string,
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

      await updateField(
        categoryId,
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
    <main className="min-h-screen bg-slate-100 p-4">

      <div className="mx-auto max-w-5xl">

        {/* HEADER */}

        <div className="mb-6 flex items-center justify-between">

          <h1 className="text-3xl font-black">
            Category Admin
          </h1>

          <button
            onClick={() => {
              createCategory();
            }}
            className="
              flex
              items-center
              gap-2
              rounded-2xl
              bg-black
              px-5
              py-3
              font-bold
              text-white
            "
          >
            <Plus size={18} />

            Create
          </button>

        </div>

        {/* CATEGORY LIST */}

        <div className="space-y-5">

          {categories.map(
            (category) => {
              const isExpanded =
                expandedCategories[
                  category.id
                ];

              return (
                <div
                  key={
                    category.id
                  }
                  className="
                    overflow-hidden
                    rounded-[28px]
                    bg-white
                    shadow-lg
                  "
                >

                  {/* TOP */}

                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      p-4
                    "
                  >

                    {/* LEFT */}

                    <div
                      className="
                        flex
                        items-center
                        gap-4
                      "
                    >

                      {/* ICON */}

                      <div
                        style={{
                          background:
                            category.backgroundColor,

                          borderRadius:
                            category.borderRadius,

                          width:
                            category.cardWidth,

                          height:
                            category.cardHeight
                        }}
                        className="
                          flex
                          flex-col
                          items-center
                          justify-center
                          overflow-hidden
                        "
                      >

                        {category.image && (
                          <img
                            src={
                              category.image
                            }
                            alt={
                              category.title
                            }
                            style={{
                              height:
                                category.imageHeight
                            }}
                            className="
                              object-contain
                            "
                          />
                        )}

                        <p
                          style={{
                            color:
                              category.textColor,

                            fontSize:
                              category.titleSize
                          }}
                          className="
                            mt-1
                            font-bold
                          "
                        >
                          {
                            category.title
                          }
                        </p>

                      </div>

                    </div>

                    {/* RIGHT */}

                    <div className="flex gap-3">

                      <button
                        onClick={() => {
                          toggleCategory(
                            category.id
                          );
                        }}
                        className="
                          flex
                          h-11
                          w-11
                          items-center
                          justify-center
                          rounded-2xl
                          bg-black
                          text-white
                        "
                      >
                        {isExpanded ? (
                          <ChevronUp />
                        ) : (
                          <Grid3X3 />
                        )}
                      </button>

                      <button
                        onClick={() => {
                          deleteCategory(
                            category.id
                          );
                        }}
                        className="
                          flex
                          h-11
                          w-11
                          items-center
                          justify-center
                          rounded-2xl
                          bg-red-500
                          text-white
                        "
                      >
                        <Trash2 />
                      </button>

                    </div>

                  </div>

                  {/* FORM */}

                  {isExpanded && (
                    <div className="border-t p-5">

                      <div className="grid gap-5 md:grid-cols-2">

                        {/* TITLE */}

                        <input
                          type="text"
                          value={
                            category.title
                          }
                          onChange={(
                            event
                          ) => {
                            updateField(
                              category.id,
                              "title",
                              event
                                .target
                                .value
                            );
                          }}
                          placeholder="Category Name"
                          className="
                            rounded-2xl
                            border
                            p-4
                          "
                        />

                        {/* IMAGE BUTTON */}

                        <div>

                          <button
                            onClick={() => {
                              fileInputRefs.current[
                                category.id
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
                            <ImagePlus />

                            Upload Image
                          </button>

                          <input
                            ref={(
                              element
                            ) => {
                              fileInputRefs.current[
                                category.id
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
                                  category.id,
                                  file
                                );
                              }
                            }}
                          />

                        </div>

                      </div>

                    </div>
                  )}

                </div>
              );
            }
          )}

        </div>

      </div>

    </main>
  );
}
