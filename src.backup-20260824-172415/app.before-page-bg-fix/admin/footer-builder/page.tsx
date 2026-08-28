"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

import {
  doc,
  getDoc,
  setDoc
} from "firebase/firestore";

import {
  LayoutTemplate,
  Save,
  Plus,
  Trash2
} from "lucide-react";

import { db } from "@/firebase/config";

interface FooterLink {
  title: string;
  url: string;
}

interface FooterSettings {
  companyName: string;
  copyrightText: string;
  links: FooterLink[];
}

export default function FooterBuilderPage() {

  const [settings, setSettings] =
    useState<FooterSettings>({
      companyName:
        "JembeeKart",
      copyrightText:
        "© 2026 JembeeKart. All rights reserved.",
      links: [
        {
          title: "About Us",
          url: "/about"
        },
        {
          title: "Contact",
          url: "/contact"
        },
        {
          title: "Privacy Policy",
          url: "/privacy"
        }
      ]
    });

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  useEffect(() => {

    fetchFooter();

  }, []);

  async function fetchFooter() {

    try {

      const ref = doc(
        db,
        "admin_settings",
        "footer_builder"
      );

      const snap =
        await getDoc(ref);

      if (snap.exists()) {

        setSettings(
          snap.data() as FooterSettings
        );

      }

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);

    }
  }

  async function saveFooter() {

    try {

      setSaving(true);

      await setDoc(
        doc(
          db,
          "admin_settings",
          "footer_builder"
        ),
        settings
      );

      alert(
        "Footer Saved"
      );

    } catch (error) {

      console.log(error);

    } finally {

      setSaving(false);

    }
  }

  function updateField(
    field: keyof FooterSettings,
    value: any
  ) {

    setSettings((prev) => ({
      ...prev,
      [field]: value
    }));

  }

  function updateLink(
    index: number,
    key: keyof FooterLink,
    value: string
  ) {

    const updated =
      [...settings.links];

    updated[index][key] =
      value;

    setSettings((prev) => ({
      ...prev,
      links: updated
    }));

  }

  function addLink() {

    setSettings((prev) => ({
      ...prev,
      links: [
        ...prev.links,
        {
          title: "",
          url: ""
        }
      ]
    }));

  }

  function removeLink(
    index: number
  ) {

    const updated =
      [...settings.links];

    updated.splice(
      index,
      1
    );

    setSettings((prev) => ({
      ...prev,
      links: updated
    }));

  }

  if (loading) {

    return (

      <div className="flex min-h-screen items-center justify-center bg-[var(--card-color)] text-[var(--button-text-color)]">

        Loading Footer...

      </div>

    );
  }

  return (

    <main className="min-h-screen bg-[var(--primary-color)] p-4 text-[var(--button-text-color)]">

      {/* HEADER */}

      <div className="mb-8 flex items-center justify-between">

        <div className="flex items-center gap-4">

          <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-[var(--primary-color)]">

            <LayoutTemplate size={30} />

          </div>

          <div>

            <h1 className="text-3xl font-black">
              Footer Builder
            </h1>

            <p className="mt-1 text-sm text-[var(--muted-text-color)]">
              Customize website footer
            </p>

          </div>

        </div>

        <button
          onClick={saveFooter}
          disabled={saving}
          className="flex items-center gap-2 rounded-2xl bg-[var(--primary-color)] px-5 py-3 font-bold text-[var(--text-color)]"
        >

          <Save size={18} />

          {saving
            ? "Saving..."
            : "Save"}

        </button>

      </div>

      {/* COMPANY */}

      <div className="rounded-[30px] bg-[var(--primary-color)] p-5">

        <h2 className="mb-5 text-2xl font-black">
          Footer Settings
        </h2>

        <div className="space-y-5">

          <div>

            <label className="mb-2 block text-sm text-[var(--muted-text-color)]">

              Company Name

            </label>

            <input
              type="text"
              value={
                settings.companyName
              }
              onChange={(e) =>
                updateField(
                  "companyName",
                  e.target.value
                )
              }
              className="w-full rounded-2xl bg-[var(--card-color)] px-5 py-4 outline-none"
            />

          </div>

          <div>

            <label className="mb-2 block text-sm text-[var(--muted-text-color)]">

              Copyright Text

            </label>

            <input
              type="text"
              value={
                settings.copyrightText
              }
              onChange={(e) =>
                updateField(
                  "copyrightText",
                  e.target.value
                )
              }
              className="w-full rounded-2xl bg-[var(--card-color)] px-5 py-4 outline-none"
            />

          </div>

        </div>

      </div>

      {/* LINKS */}

      <div className="mt-6 rounded-[30px] bg-[var(--primary-color)] p-5">

        <div className="mb-5 flex items-center justify-between">

          <h2 className="text-2xl font-black">
            Footer Links
          </h2>

          <button
            onClick={addLink}
            className="flex items-center gap-2 rounded-2xl bg-[var(--success-color)] px-5 py-3 font-bold text-[var(--text-color)]"
          >

            <Plus size={18} />

            Add Link

          </button>

        </div>

        <div className="space-y-4">

          {settings.links.map(
            (
              link,
              index
            ) => (

              <div
                key={index}
                className="rounded-2xl bg-[var(--card-color)]/30 p-4"
              >

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                  <input
                    type="text"
                    placeholder="Link Title"
                    value={
                      link.title
                    }
                    onChange={(e) =>
                      updateLink(
                        index,
                        "title",
                        e.target
                          .value
                      )
                    }
                    className="rounded-2xl bg-[var(--card-color)] px-5 py-4 outline-none"
                  />

                  <input
                    type="text"
                    placeholder="Link URL"
                    value={
                      link.url
                    }
                    onChange={(e) =>
                      updateLink(
                        index,
                        "url",
                        e.target
                          .value
                      )
                    }
                    className="rounded-2xl bg-[var(--card-color)] px-5 py-4 outline-none"
                  />

                </div>

                <button
                  onClick={() =>
                    removeLink(
                      index
                    )
                  }
                  className="mt-4 flex items-center gap-2 rounded-2xl bg-[var(--danger-color)] px-5 py-3 font-bold"
                >

                  <Trash2 size={18} />

                  Remove

                </button>

              </div>

            )
          )}

        </div>

      </div>

      {/* PREVIEW */}

      <div className="mt-6 rounded-[30px] bg-gradient-to-r from-[var(--primary-color)] to-[var(--primary-color)] p-6">

        <h2 className="text-3xl font-black text-[var(--text-color)]">
          Live Footer Preview
        </h2>

        <div className="mt-6 rounded-2xl bg-[var(--card-color)]/20 p-6">

          <h3 className="text-2xl font-black">

            {settings.companyName}

          </h3>

          <div className="mt-5 flex flex-wrap gap-4">

            {settings.links.map(
              (
                link,
                index
              ) => (

                <div
                  key={index}
                  className="rounded-full bg-[var(--card-color)]/20 px-4 py-2 text-sm font-bold"
                >

                  {link.title}

                </div>

              )
            )}

          </div>

          <p className="mt-6 text-sm text-[var(--text-color)]/70">

            {
              settings.copyrightText
            }

          </p>

        </div>

      </div>

    </main>

  );
}
