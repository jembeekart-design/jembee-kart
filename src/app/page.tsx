"use client";

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

  sectionType: string;

  visible: boolean;

  position: number;

  title?: string;

  subtitle?: string;

  description?: string;

  buttonText?: string;

  secondaryButtonText?: string;
}

export default function AdminPage() {
  const [sections, setSections] = useState<
    HomepageSection[]
  >([]);

  useEffect(() => {
    const sectionsCollection =
      collection(
        db,
        "homepage_sections"
      );

    const unsubscribe =
      onSnapshot(
        sectionsCollection,
        (snapshot) => {
          const sectionsData =
            snapshot.docs.map(
              (document) => {
                const firestoreData =
                  document.data() as Omit<
                    HomepageSection,
                    "id"
                  >;

                return {
                  ...firestoreData,
                  id: document.id
                };
              }
            );

          const sortedSections =
            sectionsData.sort(
              (a, b) => {
                return (
                  a.position -
                  b.position
                );
              }
            );

          setSections(sortedSections);
        }
      );

    return () => unsubscribe();
  }, []);

  function updateField(
    id: string,
    field: keyof HomepageSection,
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
            (section) => {
              return (
                <div
                  key={section.id}
                  className="w-full rounded-[30px] bg-white p-6 shadow-xl md:p-8"
                >

                  <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                    <div>

                      <h2 className="text-3xl font-black text-gray-800">
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
                        checked={
                          section.visible
                        }
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

                    <div>

                      <label className="mb-3 block text-lg font-bold text-gray-700">
                        Title
                      </label>

                      <input
                        type="text"
                        value={
                          section.title ||
                          ""
                        }
                        onChange={(
                          event
                        ) => {
                          updateField(
                            section.id,
                            "title",
                            event.target
                              .value
                          );
                        }}
                        className="w-full rounded-[20px] border border-gray-200 bg-gray-100 px-5 py-4 text-lg outline-none"
                      />

                    </div>

                    <div>

                      <label className="mb-3 block text-lg font-bold text-gray-700">
                        Button Text
                      </label>

                      <input
                        type="text"
                        value={
                          section.buttonText ||
                          ""
                        }
                        onChange={(
                          event
                        ) => {
                          updateField(
                            section.id,
                            "buttonText",
                            event.target
                              .value
                          );
                        }}
                        className="w-full rounded-[20px] border border-gray-200 bg-gray-100 px-5 py-4 text-lg outline-none"
                      />

                    </div>

                    <div>

                      <label className="mb-3 block text-lg font-bold text-gray-700">
                        Secondary Button
                      </label>

                      <input
                        type="text"
                        value={
                          section.secondaryButtonText ||
                          ""
                        }
                        onChange={(
                          event
                        ) => {
                          updateField(
                            section.id,
                            "secondaryButtonText",
                            event.target
                              .value
                          );
                        }}
                        className="w-full rounded-[20px] border border-gray-200 bg-gray-100 px-5 py-4 text-lg outline-none"
                      />

                    </div>

                    <div>

                      <label className="mb-3 block text-lg font-bold text-gray-700">
                        Position
                      </label>

                      <input
                        type="number"
                        value={
                          section.position
                        }
                        onChange={(
                          event
                        ) => {
                          updateField(
                            section.id,
                            "position",
                            Number(
                              event.target
                                .value
                            )
                          );
                        }}
                        className="w-full rounded-[20px] border border-gray-200 bg-gray-100 px-5 py-4 text-lg outline-none"
                      />

                    </div>

                  </div>

                  <div className="mt-6">

                    <label className="mb-3 block text-lg font-bold text-gray-700">
                      Subtitle / Description
                    </label>

                    <textarea
                      rows={6}
                      value={
                        section.subtitle ||
                        section.description ||
                        ""
                      }
                      onChange={(
                        event
                      ) => {
                        updateField(
                          section.id,
                          "subtitle",
                          event.target
                            .value
                        );
                      }}
                      className="w-full rounded-[20px] border border-gray-200 bg-gray-100 px-5 py-4 text-lg outline-none"
                    />

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
