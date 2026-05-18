"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

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

export default function AdminPage() {
  const [sections, setSections] =
    useState<HomepageSection[]>([]);

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

  useEffect(() => {
    const unsubscribe =
      onSnapshot(
        collection(
          db,
          "homepage_sections"
        ),
        (snapshot) => {
          const sectionsData: HomepageSection[] =
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

          const sortedSections =
            sectionsData.sort(
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

          setSections(
            sortedSections
          );
        }
      );

    return () => unsubscribe();
  }, []);

  function updateField(
    id: string,
    field: string,
    value:
      | string
      | number
      | boolean
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
      await setDoc(
        doc(
          db,
          "homepage_sections",
          section.id
        ),
        section
      );

      alert(
        "Section Saved Successfully"
      );
    } catch (error) {
      console.error(error);

      alert(
        "Error Saving Section"
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
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 px-4 py-8">

      <div className="mx-auto max-w-6xl">

        {/* TOP HEADER */}

        <div className="mb-10 rounded-[35px] bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 text-white shadow-2xl">

          <h1 className="text-4xl font-black md:text-6xl">
            JembeeKart Admin
          </h1>

          <p className="mt-3 text-lg text-blue-100">
            Full Firestore Dynamic Homepage Control Panel
          </p>

        </div>

        {/* SECTIONS */}

        <div className="space-y-10">

          {sections.map(
            (
              section: HomepageSection
            ) => {
              return (
                <div
                  key={section.id}
                  className="overflow-hidden rounded-[35px] border border-white/40 bg-white/90 shadow-2xl backdrop-blur-xl"
                >

                  {/* SECTION HEADER */}

                  <div className="flex flex-col gap-5 border-b border-gray-100 bg-gradient-to-r from-gray-900 to-black p-6 text-white md:flex-row md:items-center md:justify-between">

                    <div>

                      <h2 className="text-3xl font-black capitalize md:text-4xl">
                        {
                          section.sectionType
                        }
                      </h2>

                      <p className="mt-2 text-gray-300">
                        Dynamic Firestore Section Editor
                      </p>

                    </div>

                    <div className="flex items-center gap-4 rounded-2xl bg-white/10 px-5 py-3 backdrop-blur-md">

                      <span className="text-lg font-bold">
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
                        className="h-7 w-7 accent-green-500"
                      />

                    </div>

                  </div>

                  {/* FIELDS */}

                  <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">

                    {Object.entries(
                      section
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

                        const label =
                          key
                            .replace(
                              /([A-Z])/g,
                              " $1"
                            )
                            .replace(
                              /^./,
                              (
                                character
                              ) =>
                                character.toUpperCase()
                            );

                        return (
                          <div
                            key={key}
                            className="rounded-[28px] border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-5 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                          >

                            {/* LABEL */}

                            <div className="mb-4 flex items-center justify-between gap-3">

                              <h3 className="text-lg font-black text-gray-800">
                                {label}
                              </h3>

                              <button
                                onClick={() => {
                                  copyFieldName(
                                    key
                                  );
                                }}
                                className="rounded-xl bg-gradient-to-r from-black to-gray-800 px-4 py-2 text-sm font-bold text-white transition-all duration-300 hover:scale-105"
                              >
                                {copiedField ===
                                key
                                  ? "Copied"
                                  : "Copy"}
                              </button>

                            </div>

                            {/* FIELD NAME */}

                            <div className="mb-4 rounded-2xl bg-gradient-to-r from-blue-100 to-indigo-100 px-4 py-3 text-sm font-bold text-blue-700 break-all">
                              {key}
                            </div>

                            {/* BOOLEAN */}

                            {typeof value ===
                            "boolean" ? (
                              <div className="flex items-center justify-center rounded-2xl bg-gray-100 p-5">

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
                                  className="h-8 w-8 accent-blue-600"
                                />

                              </div>
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
                                  className="h-16 w-20 rounded-2xl border-none bg-transparent"
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
                                  className="flex-1 rounded-2xl border border-gray-200 bg-gray-100 px-5 py-4 text-lg font-semibold outline-none focus:border-blue-500"
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
                                className="w-full rounded-2xl border border-gray-200 bg-gray-100 px-5 py-4 text-lg font-semibold outline-none transition-all duration-300 focus:border-blue-500 focus:bg-white"
                              />
                            )}

                          </div>
                        );
                      }
                    )}

                  </div>

                  {/* CUSTOM FIELD */}

                  <div className="m-6 rounded-[30px] border border-dashed border-blue-300 bg-gradient-to-r from-blue-50 to-indigo-50 p-6">

                    <h3 className="mb-5 text-2xl font-black text-blue-700">
                      Add Custom Field
                    </h3>

                    <div className="flex flex-col gap-4 md:flex-row">

                      <input
                        type="text"
                        placeholder="Example: headerBackgroundColor"
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
                        className="flex-1 rounded-2xl border border-gray-200 bg-white px-5 py-4 text-lg font-semibold outline-none focus:border-blue-500"
                      />

                      <button
                        onClick={() => {
                          addCustomField(
                            section.id
                          );
                        }}
                        className="rounded-2xl bg-gradient-to-r from-black to-gray-800 px-8 py-4 text-lg font-black text-white transition-all duration-300 hover:scale-105"
                      >
                        Add Field
                      </button>

                    </div>

                  </div>

                  {/* SAVE BUTTON */}

                  <div className="p-6 pt-0">

                    <button
                      onClick={() => {
                        saveSection(
                          section
                        );
                      }}
                      className="w-full rounded-[24px] bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-5 text-xl font-black text-white shadow-2xl transition-all duration-300 hover:scale-[1.01]"
                    >
                      Save Section
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
