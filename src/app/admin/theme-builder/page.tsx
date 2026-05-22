"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";

import {
  Palette,
  Save,
  Sparkles,
  LayoutTemplate,
  Monitor,
  Smartphone,
  Paintbrush,
  Wand2,
  Eye,
  CheckCircle2
} from "lucide-react";

export default function ThemeBuilderPage() {

  const [primaryColor, setPrimaryColor] =
    useState("#06b6d4");

  const [secondaryColor, setSecondaryColor] =
    useState("#8b5cf6");

  const [backgroundColor, setBackgroundColor] =
    useState("#050505");

  const [buttonRadius, setButtonRadius] =
    useState("24");

  const themes = [

    {
      name: "Cyber Neon",
      color: "bg-cyan-500"
    },

    {
      name: "Luxury Gold",
      color: "bg-yellow-500"
    },

    {
      name: "Royal Purple",
      color: "bg-violet-500"
    },

    {
      name: "Dark Emerald",
      color: "bg-green-500"
    }

  ];

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
            className="flex h-16 w-16 items-center justify-center rounded-[30px]"
            style={{
              background:
                primaryColor
            }}
          >

            <Palette
              size={30}
              className="text-black"
            />

          </div>

          <div>

            <h1 className="text-4xl font-black">

              Theme Builder

            </h1>

            <p className="mt-1 text-sm text-gray-400">

              Customize complete app appearance

            </p>

          </div>

        </div>

        <button
          className="flex items-center gap-2 rounded-2xl px-6 py-4 font-black text-black"
          style={{
            background:
              primaryColor
          }}
        >

          <Save size={20} />

          Save Theme

        </button>

      </div>

      {/* COLORS */}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        <ColorCard
          title="Primary Color"
          value={primaryColor}
          onChange={
            setPrimaryColor
          }
        />

        <ColorCard
          title="Secondary Color"
          value={secondaryColor}
          onChange={
            setSecondaryColor
          }
        />

        <ColorCard
          title="Background Color"
          value={backgroundColor}
          onChange={
            setBackgroundColor
          }
        />

      </div>

      {/* SETTINGS */}

      <div className="mt-6 rounded-[30px] border border-white/10 bg-[#111111] p-6">

        <div className="flex items-center gap-3">

          <Paintbrush
            className="text-cyan-400"
          />

          <h2 className="text-3xl font-black">

            UI Customization

          </h2>

        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">

          <div>

            <label className="text-sm text-gray-400">

              Button Radius

            </label>

            <input
              type="range"
              min="0"
              max="50"
              value={buttonRadius}
              onChange={(e) =>
                setButtonRadius(
                  e.target.value
                )
              }
              className="mt-4 w-full"
            />

            <p className="mt-2 text-sm text-gray-400">

              Radius:
              {" "}
              {buttonRadius}px

            </p>

          </div>

          <div className="flex flex-wrap gap-4">

            <PreviewButton
              title="Desktop"
              icon={Monitor}
              color={primaryColor}
              radius={buttonRadius}
            />

            <PreviewButton
              title="Mobile"
              icon={Smartphone}
              color={secondaryColor}
              radius={buttonRadius}
            />

          </div>

        </div>

      </div>

      {/* THEME PRESETS */}

      <div className="mt-6 rounded-[30px] border border-white/10 bg-[#111111] p-6">

        <div className="flex items-center gap-3">

          <LayoutTemplate className="text-cyan-400" />

          <h2 className="text-3xl font-black">

            Theme Presets

          </h2>

        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">

          {themes.map(
            (
              item,
              index
            ) => (

              <button
                key={index}
                className="rounded-[24px] border border-white/10 bg-black/30 p-5 transition-all hover:scale-[1.03]"
              >

                <div
                  className={`h-20 rounded-2xl ${item.color}`}
                />

                <h3 className="mt-4 text-lg font-black">

                  {item.name}

                </h3>

              </button>

            )
          )}

        </div>

      </div>

      {/* LIVE PREVIEW */}

      <div className="mt-6 rounded-[30px] p-6"
        style={{
          background:
            `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`
        }}
      >

        <div className="flex items-center gap-3">

          <Eye />

          <h2 className="text-3xl font-black">

            Live Preview

          </h2>

        </div>

        <div className="mt-6 rounded-[30px] bg-black/20 p-6 backdrop-blur-lg">

          <h3 className="text-3xl font-black">

            JembeeKart Store

          </h3>

          <p className="mt-3 text-white/80">

            This is live preview of your current theme design.

          </p>

          <div className="mt-6 flex flex-wrap gap-4">

            <button
              className="px-6 py-4 font-black text-black"
              style={{
                background:
                  "#ffffff",
                borderRadius:
                  `${buttonRadius}px`
              }}
            >

              Shop Now

            </button>

            <button
              className="border border-white/20 bg-white/10 px-6 py-4 font-black"
              style={{
                borderRadius:
                  `${buttonRadius}px`
              }}
            >

              Learn More

            </button>

          </div>

        </div>

      </div>

      {/* FEATURES */}

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">

        <FeatureCard
          title="Realtime Preview"
          desc="Instant live UI changes"
        />

        <FeatureCard
          title="Unlimited Themes"
          desc="Create custom styles"
        />

        <FeatureCard
          title="AI Suggestions"
          desc="Smart design recommendations"
        />

      </div>

      {/* ACTIONS */}

      <div className="mt-6 flex flex-wrap gap-4">

        <button
          className="flex items-center gap-2 rounded-2xl bg-cyan-500 px-6 py-4 font-black text-black"
        >

          <Wand2 size={20} />

          Generate AI Theme

        </button>

        <button
          className="flex items-center gap-2 rounded-2xl bg-green-500 px-6 py-4 font-black text-black"
        >

          <CheckCircle2 size={20} />

          Apply Theme

        </button>

      </div>

    </main>

  );
}

function ColorCard({
  title,
  value,
  onChange
}: any) {

  return (

    <div className="rounded-[30px] border border-white/10 bg-[#111111] p-6">

      <h2 className="text-2xl font-black">

        {title}

      </h2>

      <div className="mt-5 flex items-center gap-4">

        <input
          type="color"
          value={value}
          onChange={(e) =>
            onChange(
              e.target.value
            )
          }
          className="h-20 w-20 rounded-2xl border-none bg-transparent"
        />

        <div>

          <p className="text-lg font-bold">

            {value}

          </p>

          <p className="mt-1 text-sm text-gray-400">

            Theme color picker

          </p>

        </div>

      </div>

    </div>

  );
}

function PreviewButton({
  title,
  icon: Icon,
  color,
  radius
}: any) {

  return (

    <button
      className="flex items-center gap-2 px-6 py-4 font-black text-black"
      style={{
        background: color,
        borderRadius: `${radius}px`
      }}
    >

      <Icon size={20} />

      {title}

    </button>

  );
}

function FeatureCard({
  title,
  desc
}: {
  title: string;
  desc: string;
}) {

  return (

    <div className="rounded-[30px] border border-white/10 bg-[#111111] p-6">

      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500">

        <Sparkles className="text-black" />

      </div>

      <h3 className="mt-5 text-2xl font-black">

        {title}

      </h3>

      <p className="mt-2 text-sm text-gray-400">

        {desc}

      </p>

    </div>

  );
}
