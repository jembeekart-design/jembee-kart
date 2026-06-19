"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";

import {
  Palette,
  Save,
  Sun,
  Moon,
  Monitor
} from "lucide-react";

export default function AppearancePage() {

  const [theme, setTheme] =
    useState("dark");

  const [primaryColor, setPrimaryColor] =
    useState("#7c3aed");

  const [backgroundColor, setBackgroundColor] =
    useState("#0b0b0b");

  function saveAppearance() {

    alert(
      "Appearance Settings Saved"
    );
  }

  return (

    <main
      className="min-h-screen p-4 text-white"
      style={{
        background:
          backgroundColor
      }}
    >

      {/* HEADER */}

      <div className="mb-8 flex items-center justify-between">

        <div className="flex items-center gap-4">

          <div
            className="flex h-16 w-16 items-center justify-center rounded-[24px]"
            style={{
              background:
                primaryColor
            }}
          >

            <Palette size={30} />

          </div>

          <div>

            <h1 className="text-3xl font-black">
              Appearance Settings
            </h1>

            <p className="mt-1 text-sm text-gray-400">
              Customize app design & theme
            </p>

          </div>

        </div>

        <button
          onClick={saveAppearance}
          className="flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold text-white"
          style={{
            background:
              primaryColor
          }}
        >

          <Save size={18} />

          Save Settings

        </button>

      </div>

      {/* SETTINGS */}

      <div className="space-y-5">

        {/* THEME */}

        <div className="rounded-[30px] bg-[#151515] p-5">

          <div className="mb-5 flex items-center gap-3">

            <Monitor
              size={24}
              className="text-violet-400"
            />

            <h2 className="text-2xl font-black">
              Select Theme
            </h2>

          </div>

          <div className="grid grid-cols-3 gap-4">

            <button
              onClick={() =>
                setTheme("light")
              }
              className={`rounded-2xl p-4 ${
                theme === "light"
                  ? "border-2 border-white"
                  : "bg-black"
              }`}
            >

              <Sun
                size={28}
                className="mx-auto"
              />

              <p className="mt-2 text-sm font-bold">
                Light
              </p>

            </button>

            <button
              onClick={() =>
                setTheme("dark")
              }
              className={`rounded-2xl p-4 ${
                theme === "dark"
                  ? "border-2 border-white"
                  : "bg-black"
              }`}
            >

              <Moon
                size={28}
                className="mx-auto"
              />

              <p className="mt-2 text-sm font-bold">
                Dark
              </p>

            </button>

            <button
              onClick={() =>
                setTheme("system")
              }
              className={`rounded-2xl p-4 ${
                theme === "system"
                  ? "border-2 border-white"
                  : "bg-black"
              }`}
            >

              <Monitor
                size={28}
                className="mx-auto"
              />

              <p className="mt-2 text-sm font-bold">
                System
              </p>

            </button>

          </div>

        </div>

        {/* PRIMARY COLOR */}

        <div className="rounded-[30px] bg-[#151515] p-5">

          <h2 className="mb-5 text-2xl font-black">
            Primary Color
          </h2>

          <div className="flex items-center gap-4">

            <input
              type="color"
              value={primaryColor}
              onChange={(e) =>
                setPrimaryColor(
                  e.target.value
                )
              }
              className="h-16 w-16 rounded-2xl"
            />

            <input
              type="text"
              value={primaryColor}
              onChange={(e) =>
                setPrimaryColor(
                  e.target.value
                )
              }
              className="flex-1 rounded-2xl border border-white/10 bg-black px-4 py-4 outline-none"
            />

          </div>

        </div>

        {/* BACKGROUND COLOR */}

        <div className="rounded-[30px] bg-[#151515] p-5">

          <h2 className="mb-5 text-2xl font-black">
            Background Color
          </h2>

          <div className="flex items-center gap-4">

            <input
              type="color"
              value={backgroundColor}
              onChange={(e) =>
                setBackgroundColor(
                  e.target.value
                )
              }
              className="h-16 w-16 rounded-2xl"
            />

            <input
              type="text"
              value={backgroundColor}
              onChange={(e) =>
                setBackgroundColor(
                  e.target.value
                )
              }
              className="flex-1 rounded-2xl border border-white/10 bg-black px-4 py-4 outline-none"
            />

          </div>

        </div>

      </div>

      {/* LIVE PREVIEW */}

      <div
        className="mt-6 rounded-[30px] p-6"
        style={{
          background:
            `linear-gradient(135deg,
            ${primaryColor},
            #000000)`
        }}
      >

        <h2 className="text-3xl font-black">
          Live Preview
        </h2>

        <p className="mt-2 text-white/80">
          Theme preview section
        </p>

        <button
          className="mt-6 rounded-2xl px-6 py-3 font-bold text-white"
          style={{
            background:
              primaryColor
          }}
        >
          Explore Now
        </button>

      </div>

    </main>

  );
}
