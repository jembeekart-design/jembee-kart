"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";

import {
  collection,
  doc,
  onSnapshot,
  setDoc
} from "firebase/firestore";

import { db } from "@/firebase/config";

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

  "cardBackgroundColor",
  "cardTextColor",

  "sectionPadding",
  "sectionHeight",

  "borderRadius",

  "titleSize",
  "subtitleSize",
  "buttonSize",

  "cardWidth",
  "cardHeight",

  "imageHeight",

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

export default function AdminPage() {
  const [sections, setSections] =
    useState<HomepageSection[]>([]);

  const [search, setSearch] =
    useState("");

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
              (
                a: HomepageSection,
                b: HomepageSection
              ) => {
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

  async function createSellerSection() {
    try {
      await setDoc(
        doc(
          db,
          "homepage_sections",
          "seller_section"
        ),
        {
          id: "seller_section",

          sectionType:
            "seller",

          visible: true,

          position: 5,

          sellerTitle:
            "Become A Seller",

          sellerDescription:
            "Sell products with AI powered tools",

          sellerButtonText:
            "Start Selling",

          resellerTitle:
            "Reseller Program",

          resellerDescription:
            "Start reselling products",

          resellerButtonText:
            "Join Now",

          sellerBackgroundColor:
            "#0000ff",

          sellerGradientColor:
            "#ff0000",

          resellerBackgroundColor:
            "#00ff00",

          resellerGradientColor:
            "#ffff00",

          sellerButtonColor:
            "#ffffff",

          sellerButtonTextColor:
            "#000000",

          resellerButtonColor:
            "#ffffff",

          resellerButtonTextColor:
            "#000000"
        },
        {
          merge: true
        }
      );

      alert(
        "Seller Section Created"
      );
    } catch (error) {
      console.error(error);

      alert(
        "Error Creating Seller Section"
      );
    }
  }

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

        {/* CREATE SELLER SECTION */}

        <div className="mb-8">

          <button
            onClick={
              createSellerSection
            }
            className="w-full rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-5 text-xl font-black text-white shadow-2xl"
          >
            Create Seller Section
          </button>

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

        {/* SECTIONS */}

        <div className="space-y-10">

          {filteredSections.map(
            (
              section: HomepageSection
            ) => {
              return (
                <div
                  key={section.id}
                  className="overflow-hidden rounded-[35px] bg-white shadow-2xl"
                >

                  {/* TOP */}

                  <div className="flex flex-col gap-5 bg-black p-6 text-white md:flex-row md:items-center md:justify-between">

                    <div>

                      <h2 className="text-3xl font-black capitalize">
                        {
                          section.sectionType
                        }
                      </h2>

                    </div>

                    <div className="flex items-center gap-4">

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
                            event.target.checked
                          );
                        }}
                        className="h-6 w-6 accent-green-500"
                      />

                    </div>

                  </div>

                  {/* FIELDS */}

                  <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">

                    {Object.entries(
                      section
                    )
                      .filter(
                        ([key]) =>
                          key !== "id"
                      )
                      .map(
                        ([
                          key,
                          value
                        ]) => {
                          return (
                            <div
                              key={key}
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
                                      event.target.checked
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
                                        event.target.value
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
                                        event.target.value
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
                                      event.target.value
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
                                  event.target.value
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
                                key={field}
                                value={field}
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

                </div>
              );
            }
          )}

        </div>

      </div>

    </main>
  );
}
