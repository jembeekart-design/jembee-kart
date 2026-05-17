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

  title?: string;

  subtitle?: string;

  description?: string;

  buttonText?: string;

  secondaryButtonText?: string;

  titleSize?: string;

  subtitleSize?: string;

  buttonSize?: string;

  sectionPadding?: string;

  sectionHeight?: string;

  borderRadius?: string;

  backgroundColor?: string;

  gradientColor?: string;

  textColor?: string;

  buttonColor?: string;

  buttonTextColor?: string;

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
                ""
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

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-gray-100 px-4 py-8">

      <div className="mx-auto w-full max-w-5xl">

        <h1 className="mb-8 text-3xl font-black text-blue-600 md:text-5xl">
          JembeeKart Admin Panel
        </h1>

        <div className="space-y-8">

          {sections.map(
            (
              section: HomepageSection
            ) => {
              return (
                <div
                  key={section.id}
                  className="w-full rounded-[30px] bg-white p-6 shadow-xl md:p-8"
                >

                  <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                    <div>

                      <h2 className="text-3xl font-black capitalize text-gray-800">
                        {
                          section.sectionType
                        }
                      </h2>

                      <p className="mt-2 text-gray-500">
                        Firestore Section Editor
                      </p>

                    </div>

                    <label className="flex items-center gap-3">

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
                        className="h-6 w-6"
                      />

                    </label>

                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

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
                          >

                            <label className="mb-3 block text-lg font-bold text-gray-700">
                              {label}
                            </label>

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
                                className="h-6 w-6"
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
                                  className="h-16 w-20 rounded-xl border-none bg-transparent"
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
                                  className="flex-1 rounded-[20px] border border-gray-200 bg-gray-100 px-5 py-4 text-lg outline-none"
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
                                className="w-full rounded-[20px] border border-gray-200 bg-gray-100 px-5 py-4 text-lg outline-none"
                              />
                            )}

                          </div>
                        );
                      }
                    )}

                  </div>

                  <div className="mt-8 rounded-[25px] border border-dashed border-blue-300 bg-blue-50 p-5">

                    <h3 className="mb-4 text-xl font-black text-blue-700">
                      Add Custom Field
                    </h3>

                    <div className="flex flex-col gap-4 md:flex-row">

                      <input
                        type="text"
                        placeholder="Example: gradientColor"
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
                        className="flex-1 rounded-[20px] border border-gray-200 bg-white px-5 py-4 text-lg outline-none"
                      />

                      <button
                        onClick={() => {
                          addCustomField(
                            section.id
                          );
                        }}
                        className="rounded-[20px] bg-black px-8 py-4 text-lg font-bold text-white"
                      >
                        Add Field
                      </button>

                    </div>

                    <div className="mt-4 text-sm text-gray-600">

                      Examples:
                      <br />

                      titleSize
                      <br />

                      subtitleSize
                      <br />

                      buttonSize
                      <br />

                      backgroundColor
                      <br />

                      gradientColor
                      <br />

                      textColor
                      <br />

                      buttonColor
                      <br />

                      buttonTextColor
                      <br />

                      sectionPadding
                      <br />

                      sectionHeight
                      <br />

                      borderRadius

                    </div>

                  </div>

                  <button
                    onClick={() => {
                      saveSection(
                        section
                      );
                    }}
                    className="mt-8 w-full rounded-[20px] bg-blue-600 px-6 py-4 text-lg font-black text-white transition-all duration-300 hover:bg-blue-700"
                  >
                    Save Section
                  </button>

                </div>
              );
            }
          )}

        </div>

      </div>

    </main>
  );
}
