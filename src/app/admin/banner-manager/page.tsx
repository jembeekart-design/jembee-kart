"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";

import {
  ImagePlus,
  Save,
  Trash2,
  Eye,
  Plus,
  Sparkles,
  LayoutTemplate,
  Monitor,
  Smartphone,
  Wand2
} from "lucide-react";

export default function BannerManagerPage() {

  const [banners, setBanners] =
    useState([
      {
        title: "Mega Fashion Sale",
        image:
          "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200"
      },

      {
        title: "Electronics Offer",
        image:
          "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1200"
      }

    ]);

  function addBanner() {

    setBanners([
      ...banners,

      {
        title: `New Banner ${banners.length + 1}`,
        image:
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1200"
      }

    ]);

  }

  function removeBanner(
    index: number
  ) {

    const updated =
      [...banners];

    updated.splice(index, 1);

    setBanners(updated);

  }

  return (

    <main className="min-h-screen bg-[#050505] p-4 text-white">

      {/* HEADER */}

      <div className="mb-8 flex items-center justify-between">

        <div className="flex items-center gap-4">

          <div className="flex h-16 w-16 items-center justify-center rounded-[30px] bg-pink-500">

            <ImagePlus
              size={30}
              className="text-black"
            />

          </div>

          <div>

            <h1 className="text-4xl font-black">

              Banner Manager

            </h1>

            <p className="mt-1 text-sm text-gray-400">

              Manage homepage sliders & banners

            </p>

          </div>

        </div>

        <button
          className="flex items-center gap-2 rounded-2xl bg-pink-500 px-6 py-4 font-black text-black"
        >

          <Save size={20} />

          Save Changes

        </button>

      </div>

      {/* ACTIONS */}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

        <ActionCard
          title="Add Banner"
          icon={Plus}
        />

        <ActionCard
          title="AI Generate"
          icon={Sparkles}
        />

        <ActionCard
          title="Templates"
          icon={LayoutTemplate}
        />

        <ActionCard
          title="Preview"
          icon={Eye}
        />

      </div>

      {/* BANNERS */}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">

        {banners.map(
          (
            item,
            index
          ) => (

            <div
              key={index}
              className="overflow-hidden rounded-[30px] border border-white/10 bg-[#111111]"
            >

              <img
                src={item.image}
                alt={item.title}
                className="h-[260px] w-full object-cover"
              />

              <div className="p-5">

                <div className="flex items-center justify-between">

                  <div>

                    <h2 className="text-2xl font-black">

                      {item.title}

                    </h2>

                    <p className="mt-1 text-sm text-gray-400">

                      Homepage banner slider

                    </p>

                  </div>

                  <button
                    onClick={() =>
                      removeBanner(
                        index
                      )
                    }
                    className="rounded-2xl bg-red-500/20 p-3 text-red-400"
                  >

                    <Trash2 size={20} />

                  </button>

                </div>

              </div>

            </div>

          )
        )}

      </div>

      {/* ADD BUTTON */}

      <button
        onClick={addBanner}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-[30px] bg-pink-500 px-6 py-5 font-black text-black"
      >

        <Plus size={22} />

        Add New Banner

      </button>

      {/* LIVE PREVIEW */}

      <div className="mt-6 rounded-[30px] bg-gradient-to-r from-pink-500 to-violet-600 p-6">

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-3">

            <Eye />

            <h2 className="text-3xl font-black">

              Live Preview

            </h2>

          </div>

          <div className="flex gap-3">

            <button
              className="flex items-center gap-2 rounded-2xl bg-black/20 px-4 py-3 font-bold"
            >

              <Monitor size={18} />

              Desktop

            </button>

            <button
              className="flex items-center gap-2 rounded-2xl bg-black px-4 py-3 font-bold text-white"
            >

              <Smartphone size={18} />

              Mobile

            </button>

          </div>

        </div>

        <div className="mt-6 overflow-hidden rounded-[30px] bg-black/20">

          <img
            src={banners[0]?.image}
            alt="Preview"
            className="h-[320px] w-full object-cover"
          />

        </div>

      </div>

      {/* AI SECTION */}

      <div className="mt-6 rounded-[30px] border border-white/10 bg-[#111111] p-6">

        <div className="flex items-center gap-3">

          <Sparkles className="text-pink-400" />

          <h2 className="text-3xl font-black">

            AI Banner Tools

          </h2>

        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">

          <FeatureCard
            title="AI Banner Design"
            desc="Generate banners instantly"
          />

          <FeatureCard
            title="Smart Layout"
            desc="Automatic positioning"
          />

          <FeatureCard
            title="HD Export"
            desc="Ultra quality banners"
          />

        </div>

      </div>

      {/* ACTIONS */}

      <div className="mt-6 flex flex-wrap gap-4">

        <button
          className="flex items-center gap-2 rounded-2xl bg-green-500 px-6 py-4 font-black text-black"
        >

          <Save size={20} />

          Publish Banners

        </button>

        <button
          className="flex items-center gap-2 rounded-2xl bg-yellow-500 px-6 py-4 font-black text-black"
        >

          <Wand2 size={20} />

          Generate AI Banner

        </button>

      </div>

    </main>

  );
}

function ActionCard({
  title,
  icon: Icon
}: any) {

  return (

    <button
      className="rounded-[30px] border border-white/10 bg-[#111111] p-5 text-left transition-all hover:scale-[1.03]"
    >

      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-500">

        <Icon
          size={24}
          className="text-black"
        />

      </div>

      <h3 className="mt-4 text-xl font-black">

        {title}

      </h3>

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

    <div className="rounded-[24px] bg-black/30 p-5">

      <h3 className="text-2xl font-black">

        {title}

      </h3>

      <p className="mt-2 text-sm text-gray-400">

        {desc}

      </p>

    </div>

  );
}
