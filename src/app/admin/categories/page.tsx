"use client";

export const dynamic = "force-dynamic";

import {
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

import Image from "next/image";

import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
  updateDoc
} from "firebase/firestore";

import {
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  GripVertical,
  Grid3X3,
  ImagePlus,
  Monitor,
  Plus,
  Smartphone,
  Trash2,
  Video
} from "lucide-react";

import { db } from "@/firebase/config";

/* ======================================================
TYPES
====================================================== */

interface BannerSlide {
  id: string;

  title?: string;

  subtitle?: string;

  buttonText?: string;

  buttonLink?: string;

  backgroundColor?: string;

  gradientColor?: string;

  textColor?: string;

  buttonColor?: string;

  buttonTextColor?: string;

  imageUrl?: string;

  videoUrl?: string;

  mediaType?: string;

  visible?: boolean;

  position?: number;

  [key: string]:
    | string
    | number
    | boolean
    | undefined;
}

/* ======================================================
COMPONENT
====================================================== */

export default function AdminPage() {
  const [banners, setBanners] =
    useState<
      BannerSlide[]
    >([]);

  const [search, setSearch] =
    useState("");

  const [
    expandedBanners,
    setExpandedBanners
  ] = useState<{
    [key: string]: boolean;
  }>({});

  const [savingId, setSavingId] =
    useState("");

  const [
    draggedBanner,
    setDraggedBanner
  ] = useState("");

  const [
    mobilePreview,
    setMobilePreview
  ] = useState(true);

  const fileInputRefs =
    useRef<{
      [key: string]: HTMLInputElement | null;
    }>({});

  /* ======================================================
  GET BANNERS
  ====================================================== */

  useEffect(() => {
    const unsubscribe =
      onSnapshot(
        collection(
          db,
          "homepage_banners"
        ),
        (snapshot) => {
          const data: BannerSlide[] =
            snapshot.docs.map(
              (document) => {
                return {
                  id: document.id,

                  ...(document.data() as Omit<
                    BannerSlide,
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

          setBanners(sorted);
        }
      );

    return () => unsubscribe();
  }, []);

  /* ======================================================
  FILTER
  ====================================================== */

  const filteredBanners =
    useMemo(() => {
      if (!search.trim()) {
        return banners;
      }

      return banners.filter(
        (banner) => {
          return (
            banner.title
              ?.toLowerCase()
              .includes(
                search.toLowerCase()
              ) ||
            banner.subtitle
              ?.toLowerCase()
              .includes(
                search.toLowerCase()
              )
          );
        }
      );
    }, [banners, search]);

  /* ======================================================
  TOGGLE
  ====================================================== */

  function toggleBanner(
    id: string
  ) {
    setExpandedBanners(
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

  function updateBannerField(
    id: string,
    field: string,
    value:
      | string
      | boolean
      | number
  ) {
    setBanners((previous) => {
      return previous.map(
        (banner) => {
          if (
            banner.id === id
          ) {
            return {
              ...banner,

              [field]: value
            };
          }

          return banner;
        }
      );
    });
  }

  /* ======================================================
  CREATE BANNER
  ====================================================== */

  async function createNewBanner() {
    try {
      const newBannerRef =
        doc(
          collection(
            db,
            "homepage_banners"
          )
        );

      await setDoc(
        newBannerRef,
        {
          title:
            "New Banner",

          subtitle:
            "Banner Subtitle",

          buttonText:
            "Explore",

          buttonLink: "/",

          backgroundColor:
            "#2563eb",

          gradientColor:
            "#7c3aed",

          textColor:
            "#ffffff",

          buttonColor:
            "#ffffff",

          buttonTextColor:
            "#000000",

          mediaType:
            "image",

          imageUrl: "",

          videoUrl: "",

          visible: true,

          position:
            banners.length + 1
        }
      );

      alert(
        "Banner Created"
      );
    } catch (error) {
      console.error(error);

      alert(
        "Create Failed"
      );
    }
  }

  /* ======================================================
  DELETE BANNER
  ====================================================== */

  async function deleteBanner(
    id: string
  ) {
    const confirmDelete =
      confirm(
        "Delete Banner?"
      );

    if (!confirmDelete) {
      return;
    }

    try {
      await deleteDoc(
        doc(
          db,
          "homepage_banners",
          id
        )
      );

      alert(
        "Banner Deleted"
      );
    } catch (error) {
      console.error(error);

      alert(
        "Delete Failed"
      );
    }
  }

  /* ======================================================
  SAVE
  ====================================================== */

  async function saveBanner(
    banner: BannerSlide
  ) {
    try {
      setSavingId(
        banner.id
      );

      await setDoc(
        doc(
          db,
          "homepage_banners",
          banner.id
        ),
        banner,
        {
          merge: true
        }
      );

      alert(
        "Banner Saved"
      );
    } catch (error) {
      console.error(error);

      alert(
        "Save Failed"
      );
    } finally {
      setSavingId("");
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
            800;

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
                  `compressed-${file.name}`,
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
    bannerId: string,
    file: File
  ) {
    try {
      setSavingId(
        bannerId
      );

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

      updateBannerField(
        bannerId,
        "imageUrl",
        data.secure_url
      );

      updateBannerField(
        bannerId,
        "mediaType",
        "image"
      );

      alert(
        "Image Uploaded"
      );
    } catch (error) {
      console.error(error);

      alert(
        "Upload Failed"
      );
    } finally {
      setSavingId("");
    }
  }

  /* ======================================================
  DRAG DROP
  ====================================================== */

  async function handleDrop(
    targetId: string
  ) {
    if (
      !draggedBanner ||
      draggedBanner ===
        targetId
    ) {
      return;
    }

    const updated =
      [...banners];

    const draggedIndex =
      updated.findIndex(
        (item) =>
          item.id ===
          draggedBanner
      );

    const targetIndex =
      updated.findIndex(
        (item) =>
          item.id === targetId
      );

    const draggedItem =
      updated[
        draggedIndex
      ];

    updated.splice(
      draggedIndex,
      1
    );

    updated.splice(
      targetIndex,
      0,
      draggedItem
    );

    const reordered =
      updated.map(
        (
          item,
          index
        ) => ({
          ...item,

          position:
            index + 1
        })
      );

    setBanners(reordered);

    for (const item of reordered) {
      await updateDoc(
        doc(
          db,
          "homepage_banners",
          item.id
        ),
        {
          position:
            item.position
        }
      );
    }
  }

  /* ======================================================
  UI
  ====================================================== */

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 p-4">

      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <div className="mb-8 rounded-[35px] bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 p-8 text-white shadow-2xl">

          <h1 className="text-4xl font-black md:text-6xl">
            JembeeKart Admin
          </h1>

          <p className="mt-3 text-blue-100">
            Advanced Homepage Slider
          </p>

        </div>

        {/* TOP BUTTONS */}

        <div className="mb-8 flex flex-wrap gap-4">

          <button
            onClick={() => {
              createNewBanner();
            }}
            className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 px-6 py-4 font-black text-white"
          >
            <Plus size={22} />

            Create Banner
          </button>

          <button
            onClick={() => {
              setMobilePreview(
                !mobilePreview
              );
            }}
            className="flex items-center gap-3 rounded-2xl bg-black px-6 py-4 font-black text-white"
          >
            {mobilePreview ? (
              <Smartphone />
            ) : (
              <Monitor />
            )}

            {mobilePreview
              ? "Mobile Preview"
              : "Desktop Preview"}
          </button>

        </div>

        {/* SEARCH */}

        <div className="mb-8">

          <input
            type="text"
            placeholder="Search Banner..."
            value={search}
            onChange={(e) => {
              setSearch(
                e.target.value
              );
            }}
            className="w-full rounded-2xl border border-gray-200 bg-white px-5 py-4 text-lg font-semibold outline-none"
          />

        </div>

      </div>

    </main>
  );
}
