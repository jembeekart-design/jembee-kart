"use client";

export const dynamic = "force-dynamic";

import {
  Palette,
  Search,
  Download,
  Eye,
  Sparkles,
  Star,
  CheckCircle2,
  ShoppingBag,
  Wand2
} from "lucide-react";

const themes = [
  {
    title: "Cyber Neon",
    category: "Dark",
    downloads: "12K",
    rating: "4.9"
  },
  {
    title: "Luxury Gold",
    category: "Premium",
    downloads: "8K",
    rating: "4.8"
  },
  {
    title: "Minimal White",
    category: "Clean",
    downloads: "15K",
    rating: "5.0"
  }
];

export default function ThemeStorePage() {

  return (

    <main className="min-h-screen bg-[#0b0b0b] p-4 text-white">

      {/* HEADER */}

      <div className="mb-8 flex items-center justify-between">

        <div className="flex items-center gap-4">

          <div className="flex h-16 w-16 items-center justify-center rounded-[28px] bg-cyan-500">

            <Palette
              size={30}
              className="text-black"
            />

          </div>

          <div>

            <h1 className="text-3xl font-black">
              Theme Store
            </h1>

            <p className="mt-1 text-sm text-gray-400">
              Browse & install premium themes
            </p>

          </div>

        </div>

        <button className="flex items-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 font-bold text-black">

          <ShoppingBag size={18} />

          My Themes

        </button>

      </div>

      {/* SEARCH */}

      <div className="flex items-center gap-3 rounded-[24px] border border-white/10 bg-[#151515] px-4 py-3">

        <Search
          size={20}
          className="text-gray-400"
        />

        <input
          type="text"
          placeholder="Search themes..."
          className="w-full bg-transparent outline-none placeholder:text-gray-500"
        />

      </div>

      {/* STATS */}

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">

        <StatCard
          title="Themes"
          value="120"
          icon={<Palette size={22} />}
        />

        <StatCard
          title="Downloads"
          value="48K"
          icon={<Download size={22} />}
        />

        <StatCard
          title="Installed"
          value="12"
          icon={<CheckCircle2 size={22} />}
        />

        <StatCard
          title="Premium"
          value="42"
          icon={<Sparkles size={22} />}
        />

      </div>

      {/* THEMES */}

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">

        {themes.map(
          (
            item,
            index
          ) => (

            <div
              key={index}
              className="overflow-hidden rounded-[28px] border border-white/10 bg-[#151515]"
            >

              {/* PREVIEW */}

              <div className="h-48 bg-gradient-to-br from-cyan-500 via-blue-500 to-violet-500" />

              {/* CONTENT */}

              <div className="p-5">

                <div className="flex items-start justify-between">

                  <div>

                    <h2 className="text-2xl font-black">
                      {item.title}
                    </h2>

                    <p className="mt-1 text-sm text-gray-400">
                      {item.category}
                    </p>

                  </div>

                  <div className="flex items-center gap-1 rounded-full bg-yellow-500/20 px-3 py-1 text-sm font-bold text-yellow-400">

                    <Star size={14} />

                    {item.rating}

                  </div>

                </div>

                <div className="mt-5 flex items-center justify-between">

                  <div>

                    <p className="text-lg font-black">
                      {item.downloads}
                    </p>

                    <p className="text-sm text-gray-400">
                      Downloads
                    </p>

                  </div>

                  <div className="flex gap-2">

                    <button className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">

                      <Eye size={18} />

                    </button>

                    <button className="rounded-2xl bg-cyan-500 px-4 py-2 font-bold text-black">

                      Install

                    </button>

                  </div>

                </div>

              </div>

            </div>

          )
        )}

      </div>

      {/* AI SECTION */}

      <div className="mt-6 rounded-[30px] bg-gradient-to-r from-cyan-500 to-blue-600 p-6 text-black">

        <div className="flex items-center gap-3">

          <Wand2 size={26} />

          <h2 className="text-3xl font-black">
            AI Theme Creator
          </h2>

        </div>

        <p className="mt-3 max-w-2xl text-sm font-medium">

          Generate custom ecommerce themes instantly
          with AI powered design engine.

        </p>

        <button className="mt-6 rounded-2xl bg-black px-6 py-3 font-bold text-white">

          Generate AI Theme

        </button>

      </div>

    </main>

  );
}

function StatCard({
  title,
  value,
  icon
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {

  return (

    <div className="rounded-[28px] border border-white/10 bg-[#151515] p-5">

      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500 text-black">

        {icon}

      </div>

      <p className="mt-4 text-sm text-gray-400">
        {title}
      </p>

      <h2 className="mt-2 text-3xl font-black">
        {value}
      </h2>

    </div>

  );
}
