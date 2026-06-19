"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

import {
  doc,
  getDoc,
  setDoc
} from "firebase/firestore";

import {
  LayoutDashboard,
  Save,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown
} from "lucide-react";

import { db } from "@/firebase/config";

interface SectionData {
  id: string;
  title: string;
  enabled: boolean;
}

export default function PageBuilderPage() {

  const [sections, setSections] =
    useState<SectionData[]>([
      {
        id: "hero",
        title: "Hero Section",
        enabled: true
      },
      {
        id: "categories",
        title: "Categories",
        enabled: true
      },
      {
        id: "flashsale",
        title: "Flash Sale",
        enabled: true
      },
      {
        id: "products",
        title: "Featured Products",
        enabled: true
      },
      {
        id: "affiliate",
        title: "Affiliate Section",
        enabled: true
      },
      {
        id: "seller",
        title: "Seller Section",
        enabled: true
      },
      {
        id: "banner",
        title: "Banner Section",
        enabled: true
      }
    ]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  useEffect(() => {

    fetchSections();

  }, []);

  async function fetchSections() {

    try {

      const ref = doc(
        db,
        "admin_settings",
        "homepage_builder"
      );

      const snap =
        await getDoc(ref);

      if (snap.exists()) {

        setSections(
          snap.data()
            .sections
        );

      }

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);

    }
  }

  async function saveSections() {

    try {

      setSaving(true);

      await setDoc(
        doc(
          db,
          "admin_settings",
          "homepage_builder"
        ),
        {
          sections
        }
      );

      alert(
        "Homepage Updated"
      );

    } catch (error) {

      console.log(error);

    } finally {

      setSaving(false);

    }
  }

  function toggleSection(
    index: number
  ) {

    const updated =
      [...sections];

    updated[index]
      .enabled =
      !updated[index]
        .enabled;

    setSections(updated);

  }

  function moveUp(
    index: number
  ) {

    if (index === 0) {

      return;

    }

    const updated =
      [...sections];

    [
      updated[index - 1],
      updated[index]
    ] = [
      updated[index],
      updated[index - 1]
    ];

    setSections(updated);

  }

  function moveDown(
    index: number
  ) {

    if (
      index ===
      sections.length - 1
    ) {

      return;

    }

    const updated =
      [...sections];

    [
      updated[index + 1],
      updated[index]
    ] = [
      updated[index],
      updated[index + 1]
    ];

    setSections(updated);

  }

  if (loading) {

    return (

      <div className="flex min-h-screen items-center justify-center bg-black text-white">

        Loading Builder...

      </div>

    );
  }

  return (

    <main className="min-h-screen bg-[#0b0b0b] p-4 text-white">

      {/* HEADER */}

      <div className="mb-8 flex items-center justify-between">

        <div className="flex items-center gap-4">

          <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-pink-500">

            <LayoutDashboard size={30} />

          </div>

          <div>

            <h1 className="text-3xl font-black">
              Homepage Builder
            </h1>

            <p className="mt-1 text-sm text-gray-400">
              Reorder & manage homepage sections
            </p>

          </div>

        </div>

        <button
          onClick={saveSections}
          disabled={saving}
          className="flex items-center gap-2 rounded-2xl bg-pink-500 px-5 py-3 font-bold text-black"
        >

          <Save size={18} />

          {saving
            ? "Saving..."
            : "Save"}

        </button>

      </div>

      {/* SECTIONS */}

      <div className="space-y-5">

        {sections.map(
          (
            section,
            index
          ) => (

            <div
              key={section.id}
              className="rounded-[30px] bg-[#151515] p-5"
            >

              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                <div>

                  <h2 className="text-2xl font-black">

                    {section.title}

                  </h2>

                  <p className="mt-1 text-sm text-gray-400">

                    Position:
                    {" "}
                    {index + 1}

                  </p>

                </div>

                <div className="flex flex-wrap gap-3">

                  <button
                    onClick={() =>
                      moveUp(
                        index
                      )
                    }
                    className="flex items-center gap-2 rounded-2xl bg-blue-500 px-5 py-3 font-bold text-black"
                  >

                    <ArrowUp size={18} />

                    Up

                  </button>

                  <button
                    onClick={() =>
                      moveDown(
                        index
                      )
                    }
                    className="flex items-center gap-2 rounded-2xl bg-yellow-500 px-5 py-3 font-bold text-black"
                  >

                    <ArrowDown size={18} />

                    Down

                  </button>

                  <button
                    onClick={() =>
                      toggleSection(
                        index
                      )
                    }
                    className={`flex items-center gap-2 rounded-2xl px-5 py-3 font-bold ${
                      section.enabled
                        ? "bg-green-500 text-black"
                        : "bg-red-500"
                    }`}
                  >

                    {section.enabled ? (

                      <Eye size={18} />

                    ) : (

                      <EyeOff size={18} />

                    )}

                    {section.enabled
                      ? "Visible"
                      : "Hidden"}

                  </button>

                </div>

              </div>

            </div>

          )
        )}

      </div>

      {/* LIVE PREVIEW */}

      <div className="mt-6 rounded-[30px] bg-gradient-to-r from-pink-500 to-fuchsia-500 p-6">

        <h2 className="text-3xl font-black text-black">
          Live Homepage Structure
        </h2>

        <div className="mt-6 space-y-3">

          {sections
            .filter(
              (section) =>
                section.enabled
            )
            .map(
              (
                section,
                index
              ) => (

                <div
                  key={section.id}
                  className="rounded-2xl bg-white/20 p-4 font-bold text-black"
                >

                  {index + 1}.
                  {" "}
                  {section.title}

                </div>

              )
            )}

        </div>

      </div>

    </main>

  );
}
