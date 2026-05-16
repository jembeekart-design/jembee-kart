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
                return {
                  ...(document.data() as HomepageSection),
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
    <main className="min-h-screen bg-gray-100 p-4 md:p-6">

      <div className="mx-auto max-w-6xl">

        <h1 className="mb-8 text-4xl font-black text-blue-600">
          JembeeKart Admin Panel
        </h1>

        <div className="grid gap-6">

          {sections.map(
            (section) => {
              return (
                <div
                  key={section.id}
                  className="rounded-[30px] bg-white p-6 shadow-xl"
                >

                  <div className="mb-6 flex items-center justify-between">

                    <div>

                      <h2 className="text-2xl font-black text-gray-800">
                        {
                          section.sectionType
                        }
                      </h2>

                      <p className="text-gray-500">
                        Firestore
                        Section
                        Editor
                      </p>

                    </div>

                    <label className="flex items-center gap-3">

                      <span className="font-semibold">
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
                        className="h-5 w-5"
                      />

                    </label>

                  </div>

                  <div className="grid gap-5 md:grid-cols-2">

                    <div>

                      <label className="mb-2 block font-semibold text-gray-700">
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
                        className="w-full rounded-2xl border border-gray-200 bg-gray-100 px-4 py-3 outline-none"
                      />

                    </div>

                    <div>

                      <label className="mb-2 block font-semibold text-gray-700">
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
                        className="w-full rounded-2xl border border-gray-200 bg-gray-100 px-4 py-3 outline-none"
                      />

                    </div>

                    <div>

                      <label className="mb-2 block font-semibold text-gray-700">
                        Secondary
                        Button
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
                        className="w-full rounded-2xl border border-gray-200 bg-gray-100 px-4 py-3 outline-none"
                      />

                    </div>

                    <div>

                      <label className="mb-2 block font-semibold text-gray-700">
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
                              event
                                .target
                                .value
                            )
                          );
                        }}
                        className="w-full rounded-2xl border border-gray-200 bg-gray-100 px-4 py-3 outline-none"
                      />

                    </div>

                  </div>

                  <div className="mt-5">

                    <label className="mb-2 block font-semibold text-gray-700">
                      Subtitle /
                      Description
                    </label>

                    <textarea
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
                      rows={4}
                      className="w-full rounded-2xl border border-gray-200 bg-gray-100 px-4 py-3 outline-none"
                    />

                  </div>

                  <button
                    onClick={() => {
                      saveSection(
                        section
                      );
                    }}
                    className="mt-6 rounded-2xl bg-blue-600 px-8 py-4 font-bold text-white transition-all duration-300 hover:scale-105"
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
