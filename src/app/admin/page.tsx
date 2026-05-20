"use client";

export const dynamic = "force-dynamic";

import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  collection,
  doc,
  onSnapshot,
  setDoc
} from "firebase/firestore";

import {
  ChevronDown,
  ChevronUp,
  Grid3X3
} from "lucide-react";

import { db } from "@/firebase/config";

/* ---------------- TYPES ---------------- */

interface HomepageSection {
  id: string;

  sectionType?: string;

  visible?: boolean;

  position?: number;

  [key: string]:
    | string
    | number
    | boolean
    | undefined;
}

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

  visible?: boolean;

  position?: number;
}

/* ---------------- FIELD SUGGESTIONS ---------------- */

const FIELD_SUGGESTIONS = [
  "title",
  "subtitle",
  "description",
  "buttonText",
  "secondaryButtonText",

  "backgroundColor",
  "gradientColor",
  "textColor",

  "buttonColor",
  "buttonTextColor",

  "headerBackgroundColor",
  "headerTextColor",

  "searchBarColor",
  "statusBarColor",

  "sellerTitle",
  "sellerDescription",
  "sellerButtonText",

  "sellerBackgroundColor",
  "sellerGradientColor",

  "sellerButtonColor",
  "sellerButtonTextColor",

  "resellerTitle",
  "resellerDescription",
  "resellerButtonText",

  "resellerBackgroundColor",
  "resellerGradientColor",

  "resellerButtonColor",
  "resellerButtonTextColor",

  "affiliateBackgroundColor",
  "affiliateGradientColor",

  "affiliateButtonColor",
  "affiliateButtonTextColor"
];

/* ---------------- COMPONENT ---------------- */

export default function AdminPage() {
  const [sections, setSections] =
    useState<
      HomepageSection[]
    >([]);

  const [banners, setBanners] =
    useState<
      BannerSlide[]
    >([]);

  const [search, setSearch] =
    useState("");

  const [
    expandedSections,
    setExpandedSections
  ] = useState<{
    [key: string]: boolean;
  }>({});

  const [
    newFieldNames,
    setNewFieldNames
  ] = useState<{
    [key: string]: string;
  }>({});

  const [
    copiedField,
    setCopiedField
  ] = useState("");

  const [savingId, setSavingId] =
    useState("");

  /* ---------------- HOMEPAGE SECTIONS ---------------- */

  useEffect(() => {
    const unsubscribe =
      onSnapshot(
        collection(
          db,
          "homepage_sections"
        ),
        (snapshot) => {
          const data: HomepageSection[] =
            snapshot.docs.map(
              (document) => {
                return {
                  id: document.id,

                  ...(document.data() as Omit<
                    HomepageSection,
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

          setSections(sorted);
        }
      );

    return () => unsubscribe();
  }, []);

  /* ---------------- HOMEPAGE BANNERS ---------------- */

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

  const filteredSections =
    useMemo(() => {
      if (!search.trim()) {
        return sections;
      }

      return sections.filter(
        (section) => {
          return Object.keys(
            section
          ).some((key) =>
            key
              .toLowerCase()
              .includes(
                search.toLowerCase()
              )
          );
        }
      );
    }, [sections, search]);

  /* ---------------- TOGGLE ---------------- */

  function toggleSection(
    id: string
  ) {
    setExpandedSections(
      (previous) => {
        return {
          ...previous,

          [id]:
            !previous[id]
        };
      }
    );
  }

  /* ---------------- UPDATE SECTION ---------------- */

  function updateField(
    id: string,
    field: string,
    value:
      | string
      | boolean
      | number
  ) {
    setSections((previous) => {
      return previous.map(
        (section) => {
          if (
            section.id === id
          ) {
            return {
              ...section,

              [field]: value
            };
          }

          return section;
        }
      );
    });
  }

  /* ---------------- UPDATE BANNER ---------------- */

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

  /* ---------------- ADD FIELD ---------------- */

  function addCustomField(
    sectionId: string
  ) {
    const fieldName =
      newFieldNames[
        sectionId
      ]?.trim();

    if (!fieldName) {
      return;
    }

    const normalizedField =
      fieldName.charAt(0).toLowerCase() +
      fieldName.slice(1);

    setSections((previous) => {
      return previous.map(
        (section) => {
          if (
            section.id ===
            sectionId
          ) {
            return {
              ...section,

              [normalizedField]:
                normalizedField
                  .toLowerCase()
                  .includes(
                    "color"
                  )
                  ? "#000000"
                  : ""
            };
          }

          return section;
        }
      );
    });

    setNewFieldNames(
      (previous) => {
        return {
          ...previous,

          [sectionId]: ""
        };
      }
    );
  }

  /* ---------------- SAVE SECTION ---------------- */

  async function saveSection(
    section: HomepageSection
  ) {
    try {
      setSavingId(section.id);

      await setDoc(
        doc(
          db,
          "homepage_sections",
          section.id
        ),
        section,
        {
          merge: true
        }
      );

      alert(
        "Section Saved Successfully"
      );
    } catch (error) {
      console.error(error);

      alert(
        "Error Saving Section"
      );
    } finally {
      setSavingId("");
    }
  }

  /* ---------------- SAVE BANNER ---------------- */

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
        "Banner Saved Successfully"
      );
    } catch (error) {
      console.error(error);

      alert(
        "Error Saving Banner"
      );
    } finally {
      setSavingId("");
    }
  }

  /* ---------------- COPY FIELD ---------------- */

  function copyFieldName(
    fieldName: string
  ) {
    navigator.clipboard.writeText(
      fieldName
    );

    setCopiedField(fieldName);

    setTimeout(() => {
      setCopiedField("");
    }, 2000);
  }

  /* ---------------- UI ---------------- */

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 px-4 py-6">

      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <div className="mb-8 rounded-[35px] bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 p-8 text-white shadow-2xl">

          <h1 className="text-4xl font-black md:text-6xl">
            JembeeKart Admin
          </h1>

          <p className="mt-3 text-blue-100">
            Dynamic Firestore Homepage
            Control Panel
          </p>

        </div>

        {/* SEARCH */}

        <div className="mb-8">

          <input
            type="text"
            placeholder="Search fields..."
            value={search}
            onChange={(event) => {
              setSearch(
                event.target.value
              );
            }}
            className="w-full rounded-2xl border border-gray-200 bg-white px-5 py-4 text-lg font-semibold outline-none focus:border-blue-500"
          />

        </div>

        {/* BANNER MANAGER */}

        <div className="mb-10">

          <h2 className="mb-6 text-3xl font-black text-gray-900">
            Homepage Slider Banners
          </h2>

          <div className="space-y-6">

            {banners.map(
              (banner) => {
                return (
                  <div
                    key={banner.id}
                    className="rounded-[30px] bg-white p-6 shadow-2xl"
                  >

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

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

                              <h3 className="mb-3 text-lg font-black">
                                {key}
                              </h3>

                              {typeof value ===
                              "boolean" ? (
                                <input
                                  type="checkbox"
                                  checked={Boolean(
                                    value
                                  )}
                                  onChange={(
                                    event
                                  ) => {
                                    updateBannerField(
                                      banner.id,
                                      key,
                                      event
                                        .target
                                        .checked
                                    );
                                  }}
                                  className="h-6 w-6"
                                />
                              ) : key
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
                                      event
                                    ) => {
                                      updateBannerField(
                                        banner.id,
                                        key,
                                        event
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
                                      event
                                    ) => {
                                      updateBannerField(
                                        banner.id,
                                        key,
                                        event
                                          .target
                                          .value
                                      );
                                    }}
                                    className="flex-1 rounded-xl border border-gray-200 px-4 py-3"
                                  />

                                </div>
                              ) : (
                                <input
                                  type="text"
                                  value={String(
                                    value || ""
                                  )}
                                  onChange={(
                                    event
                                  ) => {
                                    updateBannerField(
                                      banner.id,
                                      key,
                                      event
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

                    </div>

                    <button
                      onClick={() => {
                        saveBanner(
                          banner
                        );
                      }}
                      className="mt-6 w-full rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 px-6 py-5 text-xl font-black text-white"
                    >
                      Save Banner
                    </button>

                  </div>
                );
              }
            )}

          </div>

        </div>

        {/* SECTION CARDS */}

        <div className="space-y-6">

          {filteredSections.map(
            (
              section: HomepageSection
            ) => {
              const isExpanded =
                expandedSections[
                  section.id
                ];

              return (
                <div
                  key={section.id}
                  className="overflow-hidden rounded-[35px] bg-white shadow-2xl"
                >

                  {/* TOP BAR */}

                  <div className="flex items-center justify-between bg-black p-5 text-white">

                    <div className="flex items-center gap-4">

                      <button
                        onClick={() => {
                          toggleSection(
                            section.id
                          );
                        }}
                        className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 shadow-xl"
                      >
                        <Grid3X3
                          size={26}
                        />
                      </button>

                      <div>

                        <h2 className="text-2xl font-black capitalize">
                          {
                            section.sectionType
                          }
                        </h2>

                        <p className="text-sm text-gray-400">
                          Click grid icon
                          to open form
                        </p>

                      </div>

                    </div>

                    <div className="flex items-center gap-4">

                      <div className="flex items-center gap-3">

                        <span className="font-bold">
                          Visible
                        </span>

                        <input
                          type="checkbox"
                          checked={Boolean(
                            section.visible
                          )}
                          onChange={(
                            event
                          ) => {
                            updateField(
                              section.id,
                              "visible",
                              event.target
                                .checked
                            );
                          }}
                          className="h-6 w-6 accent-green-500"
                        />

                      </div>

                      <button
                        onClick={() => {
                          toggleSection(
                            section.id
                          );
                        }}
                        className="rounded-xl bg-white/10 p-3"
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
                    <>

                      <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">

                        {Object.entries(
                          section
                        )
                          .filter(
                            ([key]) =>
                              key !==
                              "id"
                          )
                          .map(
                            ([
                              key,
                              value
                            ]) => {
                              return (
                                <div
                                  key={
                                    key
                                  }
                                  className="rounded-[25px] border border-gray-200 bg-white p-5 shadow-lg"
                                >

                                  <div className="mb-3 flex items-center justify-between">

                                    <h3 className="text-lg font-black">
                                      {key}
                                    </h3>

                                    <button
                                      onClick={() => {
                                        copyFieldName(
                                          key
                                        );
                                      }}
                                      className="rounded-xl bg-black px-4 py-2 text-sm font-bold text-white"
                                    >
                                      {copiedField ===
                                      key
                                        ? "Copied"
                                        : "Copy"}
                                    </button>

                                  </div>

                                  {typeof value ===
                                  "boolean" ? (
                                    <input
                                      type="checkbox"
                                      checked={Boolean(
                                        value
                                      )}
                                      onChange={(
                                        event
                                      ) => {
                                        updateField(
                                          section.id,
                                          key,
                                          event
                                            .target
                                            .checked
                                        );
                                      }}
                                      className="h-7 w-7 accent-blue-600"
                                    />
                                  ) : key
                                      .toLowerCase()
                                      .includes(
                                        "color"
                                      ) ? (
                                    <div className="flex items-center gap-4">

                                      <input
                                        type="color"
                                        value={
                                          String(
                                            value ||
                                              "#000000"
                                          ).startsWith(
                                            "#"
                                          )
                                            ? String(
                                                value
                                              )
                                            : "#000000"
                                        }
                                        onChange={(
                                          event
                                        ) => {
                                          updateField(
                                            section.id,
                                            key,
                                            event
                                              .target
                                              .value
                                          );
                                        }}
                                        className="h-16 w-20"
                                      />

                                      <input
                                        type="text"
                                        value={String(
                                          value ||
                                            ""
                                        )}
                                        onChange={(
                                          event
                                        ) => {
                                          updateField(
                                            section.id,
                                            key,
                                            event
                                              .target
                                              .value
                                          );
                                        }}
                                        className="flex-1 rounded-2xl border border-gray-200 bg-gray-100 px-4 py-4"
                                      />

                                    </div>
                                  ) : (
                                    <input
                                      type="text"
                                      value={String(
                                        value ||
                                          ""
                                      )}
                                      onChange={(
                                        event
                                      ) => {
                                        updateField(
                                          section.id,
                                          key,
                                          event
                                            .target
                                            .value
                                        );
                                      }}
                                      className="w-full rounded-2xl border border-gray-200 bg-gray-100 px-4 py-4"
                                    />
                                  )}

                                </div>
                              );
                            }
                          )}

                      </div>

                      {/* ADD FIELD */}

                      <div className="p-6">

                        <div className="flex flex-col gap-4 md:flex-row">

                          <input
                            type="text"
                            list={`field-suggestions-${section.id}`}
                            placeholder="Add custom field"
                            value={
                              newFieldNames[
                                section.id
                              ] || ""
                            }
                            onChange={(
                              event
                            ) => {
                              setNewFieldNames(
                                (
                                  previous
                                ) => {
                                  return {
                                    ...previous,

                                    [section.id]:
                                      event
                                        .target
                                        .value
                                  };
                                }
                              );
                            }}
                            className="flex-1 rounded-2xl border border-gray-200 bg-white px-5 py-4"
                          />

                          <datalist
                            id={`field-suggestions-${section.id}`}
                          >

                            {FIELD_SUGGESTIONS.map(
                              (
                                field
                              ) => {
                                return (
                                  <option
                                    key={
                                      field
                                    }
                                    value={
                                      field
                                    }
                                  />
                                );
                              }
                            )}

                          </datalist>

                          <button
                            onClick={() => {
                              addCustomField(
                                section.id
                              );
                            }}
                            className="rounded-2xl bg-black px-8 py-4 font-black text-white"
                          >
                            Add Field
                          </button>

                        </div>

                      </div>

                      {/* SAVE */}

                      <div className="p-6 pt-0">

                        <button
                          onClick={() => {
                            saveSection(
                              section
                            );
                          }}
                          disabled={
                            savingId ===
                            section.id
                          }
                          className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-5 text-xl font-black text-white"
                        >
                          {savingId ===
                          section.id
                            ? "Saving..."
                            : "Save Section"}
                        </button>

                      </div>

                    </>
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
