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
              (a, b) =>
                a.position -
                b.position
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
    <main className="min-h-screen w-screen max-w-full overflow-x-hidden bg-gray-100 px-4 py-4">

      <div className="mx-auto w-full max-w-full overflow-hidden">

        <h1 className="mb-6 break-words text-2xl font-black leading-tight text-blue-600 sm:text-3xl md:text-4xl">
          JembeeKart Admin Panel
        </h1>

        <div className="flex w-full flex-col gap-6">

          {sections.map(
            (section) => {
              return (
                <div
                  key={section.id}
                  className="w-full max-w-full overflow-hidden rounded-[24px] bg-white p-4 shadow-xl"
                >

                  <div className="mb-6 flex flex-col gap-4">

                    <div className="w-full min-w-0">

                      <h2 className="break-words text-2xl font-black text-gray-800">
                        {
                          section.sectionType
                        }
                      </h2>

                      <p className="break-words text-gray-500">
                        Firestore Section Editor
                      </p>

                    </div>

                    <label className="flex items-center gap-3">

                      <span className="font-semibold text-gray-700">
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

                  <div className="grid grid-cols-1 gap-4">

                    <div className="w-full min-w-0">

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
                        className="block w-full max-w-full rounded-2xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm outline-none"
                      />

                    </div>

                    <div className="w-full min-w-0">

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
                        className="block w-full max-w-full rounded-2xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm outline-none"
                      />

                    </div>

                    <div className="w-full min-w-0">

                      <label className="mb-2 block font-semibold text-gray-700">
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
                        className="block w-full max-w-full rounded-2xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm outline-none"
                      />

                    </div>

                    <div className="w-full min-w-0">

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
                        className="block w-full max-w-full rounded-2xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm outline-none"
                      />

                    </div>

                  </div>

                  <div className="mt-5 w-full min-w-0">

                    <label className="mb-2 block font-semibold text-gray-700">
                      Subtitle / Description
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
                      rows={5}
                      className="block w-full max-w-full rounded-2xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm outline-none"
                    />

                  </div>

                  <button
                    onClick={() => {
                      saveSection(
                        section
                      );
                    }}
                    className="mt-6 block w-full max-w-full rounded-2xl bg-blue-600 px-6 py-4 text-sm font-bold text-white"
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
