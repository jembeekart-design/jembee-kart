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
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes
} from "firebase/storage";

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
  Upload,
  Video
} from "lucide-react";

import { db, storage } from "@/firebase/config";

/* ---------------- TYPES ---------------- */

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

/* ---------------- FIELD SUGGESTIONS ---------------- */

const FIELD_SUGGESTIONS = [
  "title",
  "subtitle",
  "buttonText",
  "buttonLink",
  "backgroundColor",
  "gradientColor",
  "textColor",
  "buttonColor",
  "buttonTextColor",
  "imageUrl",
  "videoUrl"
];

/* ---------------- COMPONENT ---------------- */

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

  /* ---------------- GET BANNERS ---------------- */

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

  /* ---------------- FILTER ---------------- */

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

  /* ---------------- TOGGLE ---------------- */

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

  /* ---------------- UPDATE ---------------- */

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

  /* ---------------- CREATE ---------------- */

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
            "#7c3aed",

          gradientColor:
            "#ec4899",

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
        "Error Creating Banner"
      );
    }
  }

  /* ---------------- DELETE ---------------- */

  async function deleteBanner(
    id: string
  ) {
    const confirmDelete =
      confirm(
        "Delete this banner?"
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

  /* ---------------- SAVE ---------------- */

  async function saveBanner(
    banner: BannerSlide
  ) {
    try {
      setSavingId(banner.id);

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

  /* ---------------- IMAGE COMPRESS ---------------- */

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
          const maxWidth =
            1200;

          const scale =
            maxWidth /
            img.width;

          canvas.width =
            maxWidth;

          canvas.height =
            img.height *
            scale;

          ctx?.drawImage(
            img,
            0,
            0,
            canvas.width,
            canvas.height
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
            0.7
          );
        };

        img.src =
          URL.createObjectURL(
            file
          );
      }
    );
  }

  /* ---------------- UPLOAD IMAGE ---------------- */

  async function uploadImage(
    bannerId: string,
    file: File
  ) {
    try {
      const compressedFile =
        await compressImage(
          file
        );

      const storageRef =
        ref(
          storage,
          `homepage_banners/${Date.now()}-${compressedFile.name}`
        );

      await uploadBytes(
        storageRef,
        compressedFile
      );

      const downloadURL =
        await getDownloadURL(
          storageRef
        );

      updateBannerField(
        bannerId,
        "imageUrl",
        downloadURL
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
    }
  }

  /* ---------------- DRAG ---------------- */

  async function handleDrop(
    targetId: string
  ) {
    if (
      !draggedBanner ||
      draggedBanner === targetId
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

  /* ---------------- UI ---------------- */

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

        {/* BANNERS */}

        <div className="space-y-6">

          {filteredBanners.map(
            (banner) => {
              const isExpanded =
                expandedBanners[
                  banner.id
                ];

              return (
                <div
                  key={banner.id}
                  draggable
                  onDragStart={() => {
                    setDraggedBanner(
                      banner.id
                    );
                  }}
                  onDragOver={(
                    e
                  ) => {
                    e.preventDefault();
                  }}
                  onDrop={() => {
                    handleDrop(
                      banner.id
                    );
                  }}
                  className="overflow-hidden rounded-[35px] bg-white shadow-2xl"
                >

                  {/* TOP */}

                  <div className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-pink-600 to-purple-600 p-5 text-white">

                    <div className="flex items-center gap-4">

                      <div className="cursor-grab rounded-2xl bg-white/20 p-3">
                        <GripVertical />
                      </div>

                      <button
                        onClick={() => {
                          toggleBanner(
                            banner.id
                          );
                        }}
                        className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20"
                      >
                        <Grid3X3 />
                      </button>

                      <div>

                        <h2 className="text-2xl font-black">
                          {
                            banner.title
                          }
                        </h2>

                        <p className="text-pink-100">
                          Drag & Drop Enabled
                        </p>

                      </div>

                    </div>

                    <div className="flex items-center gap-3">

                      <button
                        onClick={() => {
                          updateBannerField(
                            banner.id,
                            "visible",
                            !banner.visible
                          );
                        }}
                        className="rounded-2xl bg-white/20 p-3"
                      >
                        {banner.visible ? (
                          <Eye />
                        ) : (
                          <EyeOff />
                        )}
                      </button>

                      <button
                        onClick={() => {
                          deleteBanner(
                            banner.id
                          );
                        }}
                        className="rounded-2xl bg-red-500 p-3"
                      >
                        <Trash2 />
                      </button>

                      <button
                        onClick={() => {
                          toggleBanner(
                            banner.id
                          );
                        }}
                        className="rounded-2xl bg-white/20 p-3"
                      >
                        {isExpanded ? (
                          <ChevronUp />
                        ) : (
                          <ChevronDown />
                        )}
                      </button>

                    </div>

                  </div>

                  {/* FORM */}

                  {isExpanded && (
                    <div className="grid gap-8 p-6 lg:grid-cols-2">

                      {/* LEFT */}

                      <div className="space-y-5">

                        {Object.entries(
                          banner
                        ).map(
                          ([
                            key,
                            value
                          ]) => {
                            if (
                              key === "id"
                            ) {
                              return null;
                            }

                            return (
                              <div
                                key={key}
                                className="rounded-2xl border border-gray-200 p-4"
                              >

                                <h3 className="mb-3 text-lg font-black capitalize">
                                  {key}
                                </h3>

                                {key
                                  .toLowerCase()
                                  .includes(
                                    "color"
                                  ) ? (
                                  <div className="flex gap-3">

                                    <input
                                      type="color"
                                      value={String(
                                        value ||
                                          "#000000"
                                      )}
                                      onChange={(
                                        e
                                      ) => {
                                        updateBannerField(
                                          banner.id,
                                          key,
                                          e
                                            .target
                                            .value
                                        );
                                      }}
                                      className="h-14 w-20"
                                    />

                                    <input
                                      type="text"
                                      value={String(
                                        value ||
                                          ""
                                      )}
                                      onChange={(
                                        e
                                      ) => {
                                        updateBannerField(
                                          banner.id,
                                          key,
                                          e
                                            .target
                                            .value
                                        );
                                      }}
                                      className="flex-1 rounded-xl border border-gray-200 px-4 py-3"
                                    />

                                  </div>
                                ) : typeof value ===
                                  "boolean" ? (
                                  <input
                                    type="checkbox"
                                    checked={Boolean(
                                      value
                                    )}
                                    onChange={(
                                      e
                                    ) => {
                                      updateBannerField(
                                        banner.id,
                                        key,
                                        e
                                          .target
                                          .checked
                                      );
                                    }}
                                    className="h-7 w-7"
                                  />
                                ) : (
                                  <input
                                    type="text"
                                    value={String(
                                      value ||
                                        ""
                                    )}
                                    onChange={(
                                      e
                                    ) => {
                                      updateBannerField(
                                        banner.id,
                                        key,
                                        e
                                          .target
                                          .value
                                      );
                                    }}
                                    className="w-full rounded-xl border border-gray-200 px-4 py-3"
                                  />
                                )}

                              </div>
                            );
                          }
                        )}

                        {/* IMAGE UPLOAD */}

                        <div className="rounded-2xl border border-dashed border-gray-300 p-5">

                          <h3 className="mb-4 text-lg font-black">
                            Upload Media
                          </h3>

                          <div className="flex flex-wrap gap-3">

                            <button
                              onClick={() => {
                                fileInputRefs.current[
                                  banner.id
                                ]?.click();
                              }}
                              className="flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 font-black text-white"
                            >
                              <ImagePlus />

                              Upload Image
                            </button>

                            <button
                              onClick={() => {
                                updateBannerField(
                                  banner.id,
                                  "mediaType",
                                  "video"
                                );
                              }}
                              className="flex items-center gap-2 rounded-2xl bg-purple-600 px-5 py-3 font-black text-white"
                            >
                              <Video />

                              Video Slider
                            </button>

                          </div>

                          <input
                            ref={(element) => {
                              fileInputRefs.current[
                                banner.id
                              ] = element;
                            }}
                            type="file"
                            accept="image/*"
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
                                  banner.id,
                                  file
                                );
                              }
                            }}
                          />

                        </div>

                        {/* SAVE */}

                        <button
                          onClick={() => {
                            saveBanner(
                              banner
                            );
                          }}
                          disabled={
                            savingId ===
                            banner.id
                          }
                          className="w-full rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 px-6 py-5 text-xl font-black text-white"
                        >
                          {savingId ===
                          banner.id
                            ? "Saving..."
                            : "Save Banner"}
                        </button>

                      </div>

                      {/* LIVE PREVIEW */}

                      <div>

                        <h2 className="mb-5 text-2xl font-black">
                          Live Preview
                        </h2>

                        <div
                          className={`overflow-hidden rounded-[35px] shadow-2xl ${
                            mobilePreview
                              ? "mx-auto max-w-[380px]"
                              : "w-full"
                          }`}
                        >

                          <div
                            className="relative flex min-h-[420px] flex-col justify-center overflow-hidden p-8"
                            style={{
                              background: `linear-gradient(135deg, ${
                                banner.backgroundColor ||
                                "#7c3aed"
                              }, ${
                                banner.gradientColor ||
                                "#ec4899"
                              })`
                            }}
                          >

                            {/* IMAGE */}

                            {banner.mediaType ===
                              "image" &&
                              banner.imageUrl && (
                                <Image
                                  src={
                                    String(
                                      banner.imageUrl
                                    )
                                  }
                                  alt="Banner"
                                  fill
                                  className="object-cover opacity-25"
                                />
                              )}

                            {/* VIDEO */}

                            {banner.mediaType ===
                              "video" &&
                              banner.videoUrl && (
                                <video
                                  src={String(
                                    banner.videoUrl
                                  )}
                                  autoPlay
                                  muted
                                  loop
                                  className="absolute inset-0 h-full w-full object-cover"
                                />
                              )}

                            <div className="relative z-10">

                              <h2
                                className="text-4xl font-black leading-tight"
                                style={{
                                  color:
                                    String(
                                      banner.textColor ||
                                        "#ffffff"
                                    )
                                }}
                              >
                                {
                                  banner.title
                                }
                              </h2>

                              <p
                                className="mt-4 text-lg"
                                style={{
                                  color:
                                    String(
                                      banner.textColor ||
                                        "#ffffff"
                                    )
                                }}
                              >
                                {
                                  banner.subtitle
                                }
                              </p>

                              <button
                                className="mt-6 rounded-2xl px-8 py-4 text-lg font-black"
                                style={{
                                  backgroundColor:
                                    String(
                                      banner.buttonColor ||
                                        "#ffffff"
                                    ),

                                  color:
                                    String(
                                      banner.buttonTextColor ||
                                        "#000000"
                                    )
                                }}
                              >
                                {
                                  banner.buttonText
                                }
                              </button>

                            </div>

                          </div>

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
