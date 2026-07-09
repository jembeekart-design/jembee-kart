"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";

import {
  LayoutTemplate,
  Plus,
  Save,
  Eye,
  Trash2,
  Wand2,
  Sparkles,
  Search,
  Layers3,
  Monitor
} from "lucide-react";

const initialTemplates = [
  {
    name: "Fashion Homepage",
    category: "Ecommerce",
    status: "Published"
  },
  {
    name: "Electronics Landing",
    category: "Landing Page",
    status: "Draft"
  },
  {
    name: "Affiliate Template",
    category: "Marketing",
    status: "Published"
  }
];

export default function TemplateBuilderPage() {

  const [templates, setTemplates] =
    useState(initialTemplates);

  const [search, setSearch] =
    useState("");

  function removeTemplate(
    index: number
  ) {

    const updated =
      [...templates];

    updated.splice(index, 1);

    setTemplates(updated);

  }

  const filteredTemplates =
    templates.filter((item) =>
      item.name
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  return (

    <main className="min-h-screen bg-[#0b0b0b] p-4 text-[var(--button-text-color)]">

      {/* HEADER */}

      <div className="mb-8 flex items-center justify-between">

        <div className="flex items-center gap-4">

          <div className="flex h-16 w-16 items-center justify-center rounded-[28px] bg-[var(--secondary-color)]">

            <LayoutTemplate
              size={30}
              className="text-[var(--text-color)]"
            />

          </div>

          <div>

            <h1 className="text-3xl font-black">
              Template Builder
            </h1>

            <p className="mt-1 text-sm text-[var(--muted-text-color)]">
              Create reusable page templates
            </p>

          </div>

        </div>

        <button className="flex items-center gap-2 rounded-2xl bg-[var(--secondary-color)] px-5 py-3 font-bold text-[var(--text-color)]">

          <Plus size={18} />

          New Template

        </button>

      </div>

      {/* SEARCH */}

      <div className="flex items-center gap-3 rounded-[24px] border border-white/10 bg-[#151515] px-4 py-3">

        <Search
          size={20}
          className="text-[var(--muted-text-color)]"
        />

        <input
          type="text"
          placeholder="Search templates..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
          className="w-full bg-transparent outline-none placeholder:text-[var(--muted-text-color)]"
        />

      </div>

      {/* STATS */}

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">

        <StatCard
          title="Templates"
          value="48"
          icon={<LayoutTemplate size={22} />}
        />

        <StatCard
          title="Published"
          value="32"
          icon={<Monitor size={22} />}
        />

        <StatCard
          title="Sections"
          value="120"
          icon={<Layers3 size={22} />}
        />

        <StatCard
          title="AI Generated"
          value="18"
          icon={<Sparkles size={22} />}
        />

      </div>

      {/* TEMPLATE LIST */}

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">

        {filteredTemplates.map(
          (
            item,
            index
          ) => (

            <div
              key={index}
              className="overflow-hidden rounded-[28px] border border-white/10 bg-[#151515]"
            >

              {/* PREVIEW */}

              <div className="h-44 bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500" />

              {/* CONTENT */}

              <div className="p-5">

                <div className="flex items-start justify-between">

                  <div>

                    <h2 className="text-2xl font-black">
                      {item.name}
                    </h2>

                    <p className="mt-1 text-sm text-[var(--muted-text-color)]">
                      {item.category}
                    </p>

                  </div>

                  <div
                    className={`rounded-full px-3 py-1 text-sm font-bold ${
                      item.status ===
                      "Published"
                        ? "bg-[var(--success-color)]/20 text-green-400"
                        : "bg-[var(--warning-color)]/20 text-yellow-400"
                    }`}
                  >

                    {item.status}

                  </div>

                </div>

                <div className="mt-6 flex items-center justify-between">

                  <div className="flex gap-2">

                    <button className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--card-color)]/10">

                      <Eye size={18} />

                    </button>

                    <button className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--card-color)]/10">

                      <Save size={18} />

                    </button>

                  </div>

                  <button
                    onClick={() =>
                      removeTemplate(
                        index
                      )
                    }
                    className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--danger-color)]/20 text-red-400"
                  >

                    <Trash2 size={18} />

                  </button>

                </div>

              </div>

            </div>

          )
        )}

      </div>

      {/* AI SECTION */}

      <div className="mt-6 rounded-[30px] bg-gradient-to-r from-violet-500 to-fuchsia-500 p-6">

        <div className="flex items-center gap-3">

          <Wand2 size={26} />

          <h2 className="text-3xl font-black">
            AI Template Generator
          </h2>

        </div>

        <p className="mt-3 max-w-2xl text-sm text-[var(--button-text-color)]/90">

          Instantly generate beautiful ecommerce templates
          using AI powered builder system.

        </p>

        <button className="mt-6 rounded-2xl bg-[var(--card-color)] px-6 py-3 font-bold text-[var(--button-text-color)]">

          Generate AI Template

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

      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--secondary-color)] text-[var(--text-color)]">

        {icon}

      </div>

      <p className="mt-4 text-sm text-[var(--muted-text-color)]">
        {title}
      </p>

      <h2 className="mt-2 text-3xl font-black">
        {value}
      </h2>

    </div>

  );
}
