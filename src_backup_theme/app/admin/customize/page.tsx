"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

import {
  doc,
  getDoc,
  setDoc
} from "firebase/firestore";

import {
  Wand2,
  Type,
  Image,
  Palette,
  Save,
  MonitorSmartphone,
  LayoutTemplate
} from "lucide-react";

import { db } from "@/firebase/config";

interface CustomizeSettings {
  siteTitle: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  borderRadius: string;
  darkMode: boolean;
}

export default function CustomizePage() {

  const [settings, setSettings] =
    useState<CustomizeSettings>({
      siteTitle: "JembeeKart",
      logoUrl: "",
      primaryColor: "#7c3aed",
      secondaryColor: "#ec4899",
      fontFamily: "Poppins",
      borderRadius: "24",
      darkMode: true
    });

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  useEffect(() => {

    fetchCustomize();

  }, []);

  async function fetchCustomize() {

    try {

      const ref = doc(
        db,
        "admin_settings",
        "customize"
      );

      const snapshot =
        await getDoc(ref);

      if (snapshot.exists()) {

        setSettings(
          snapshot.data() as CustomizeSettings
        );

      }

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);

    }
  }

  async function saveCustomize() {

    try {

      setSaving(true);

      await setDoc(
        doc(
          db,
          "admin_settings",
          "customize"
        ),
        settings
      );

      alert(
        "Customization Saved"
      );

    } catch (error) {

      console.log(error);

    } finally {

      setSaving(false);

    }
  }

  function updateField(
    field: keyof CustomizeSettings,
    value: any
  ) {

    setSettings((prev) => ({
      ...prev,
      [field]: value
    }));
  }

  if (loading) {

    return (

      <div className="flex min-h-screen items-center justify-center bg-black text-white">

        Loading...

      </div>

    );
  }

  return (

    <main className="min-h-screen bg-[#0b0b0b] p-4 text-white">

      {/* HEADER */}

      <div className="mb-8 flex items-center justify-between">

        <div className="flex items-center gap-4">

          <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-fuchsia-600">

            <Wand2 size={30} />

          </div>

          <div>

            <h1 className="text-3xl font-black">
              Website Customize
            </h1>

            <p className="mt-1 text-sm text-gray-400">
              Customize branding & UI settings
            </p>

          </div>

        </div>

        <button
          onClick={saveCustomize}
          disabled={saving}
          className="flex items-center gap-2 rounded-2xl bg-fuchsia-600 px-5 py-3 font-bold"
        >

          <Save size={18} />

          {saving
            ? "Saving..."
            : "Save"}

        </button>

      </div>

      {/* FORM */}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

        {/* SITE TITLE */}

        <div className="rounded-[30px] bg-[#151515] p-5">

          <div className="mb-4 flex items-center gap-3">

            <Type
              size={24}
              className="text-cyan-400"
            />

            <h2 className="text-2xl font-black">
              Site Title
            </h2>

          </div>

          <input
            type="text"
            value={settings.siteTitle}
            onChange={(e) =>
              updateField(
                "siteTitle",
                e.target.value
              )
            }
            className="w-full rounded-2xl bg-black px-4 py-4 outline-none"
          />

        </div>

        {/* LOGO */}

        <div className="rounded-[30px] bg-[#151515] p-5">

          <div className="mb-4 flex items-center gap-3">

            <Image
              size={24}
              className="text-pink-400"
            />

            <h2 className="text-2xl font-black">
              Logo URL
            </h2>

          </div>

          <input
            type="text"
            value={settings.logoUrl}
            onChange={(e) =>
              updateField(
                "logoUrl",
                e.target.value
              )
            }
            className="w-full rounded-2xl bg-black px-4 py-4 outline-none"
          />

        </div>

        {/* PRIMARY COLOR */}

        <div className="rounded-[30px] bg-[#151515] p-5">

          <div className="mb-4 flex items-center gap-3">

            <Palette
              size={24}
              className="text-violet-400"
            />

            <h2 className="text-2xl font-black">
              Primary Color
            </h2>

          </div>

          <input
            type="color"
            value={settings.primaryColor}
            onChange={(e) =>
              updateField(
                "primaryColor",
                e.target.value
              )
            }
            className="h-16 w-full rounded-2xl bg-transparent"
          />

        </div>

        {/* SECONDARY COLOR */}

        <div className="rounded-[30px] bg-[#151515] p-5">

          <div className="mb-4 flex items-center gap-3">

            <Palette
              size={24}
              className="text-fuchsia-400"
            />

            <h2 className="text-2xl font-black">
              Secondary Color
            </h2>

          </div>

          <input
            type="color"
            value={settings.secondaryColor}
            onChange={(e) =>
              updateField(
                "secondaryColor",
                e.target.value
              )
            }
            className="h-16 w-full rounded-2xl bg-transparent"
          />

        </div>

        {/* FONT */}

        <div className="rounded-[30px] bg-[#151515] p-5">

          <div className="mb-4 flex items-center gap-3">

            <LayoutTemplate
              size={24}
              className="text-yellow-400"
            />

            <h2 className="text-2xl font-black">
              Font Family
            </h2>

          </div>

          <input
            type="text"
            value={settings.fontFamily}
            onChange={(e) =>
              updateField(
                "fontFamily",
                e.target.value
              )
            }
            className="w-full rounded-2xl bg-black px-4 py-4 outline-none"
          />

        </div>

        {/* RADIUS */}

        <div className="rounded-[30px] bg-[#151515] p-5">

          <div className="mb-4 flex items-center gap-3">

            <MonitorSmartphone
              size={24}
              className="text-green-400"
            />

            <h2 className="text-2xl font-black">
              Border Radius
            </h2>

          </div>

          <input
            type="number"
            value={settings.borderRadius}
            onChange={(e) =>
              updateField(
                "borderRadius",
                e.target.value
              )
            }
            className="w-full rounded-2xl bg-black px-4 py-4 outline-none"
          />

        </div>

      </div>

      {/* DARK MODE */}

      <div className="mt-6 rounded-[30px] bg-[#151515] p-5">

        <div className="flex items-center justify-between">

          <div>

            <h2 className="text-2xl font-black">
              Dark Mode
            </h2>

            <p className="mt-2 text-sm text-gray-400">
              Enable or disable dark UI mode
            </p>

          </div>

          <button
            onClick={() =>
              updateField(
                "darkMode",
                !settings.darkMode
              )
            }
            className={`rounded-full px-6 py-3 text-sm font-bold ${
              settings.darkMode
                ? "bg-green-500"
                : "bg-red-500"
            }`}
          >

            {settings.darkMode
              ? "Enabled"
              : "Disabled"}

          </button>

        </div>

      </div>

      {/* LIVE PREVIEW */}

      <div
        className="mt-6 rounded-[30px] p-6"
        style={{
          background: `linear-gradient(135deg, ${settings.primaryColor}, ${settings.secondaryColor})`
        }}
      >

        <h2
          className="text-4xl font-black"
          style={{
            fontFamily:
              settings.fontFamily
          }}
        >

          {settings.siteTitle}

        </h2>

        <p className="mt-2 text-white/80">
          Live website customization preview
        </p>

        <div className="mt-6 flex gap-4">

          <div
            className="px-6 py-3 font-bold text-white"
            style={{
              borderRadius:
                `${settings.borderRadius}px`,
              background:
                "rgba(255,255,255,0.15)"
            }}
          >

            Primary Button

          </div>

          <div
            className="px-6 py-3 font-bold text-white"
            style={{
              borderRadius:
                `${settings.borderRadius}px`,
              background:
                "rgba(0,0,0,0.25)"
            }}
          >

            Secondary Button

          </div>

        </div>

      </div>

    </main>

  );
}
