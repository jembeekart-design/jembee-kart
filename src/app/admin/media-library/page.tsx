"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";

import {
  Image,
  Video,
  FileText,
  Upload,
  Search,
  Trash2,
  Download,
  Folder,
  HardDrive,
  Eye,
  Grid3X3
} from "lucide-react";

const files = [
  {
    name: "banner-image.png",
    type: "Image",
    size: "2.4 MB"
  },
  {
    name: "promo-video.mp4",
    type: "Video",
    size: "18 MB"
  },
  {
    name: "invoice.pdf",
    type: "Document",
    size: "1.1 MB"
  },
  {
    name: "product-photo.jpg",
    type: "Image",
    size: "3.2 MB"
  }
];

export default function MediaLibraryPage() {

  const [search, setSearch] =
    useState("");

  const filteredFiles =
    files.filter((item) =>
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

          <div className="flex h-16 w-16 items-center justify-center rounded-[28px] bg-fuchsia-500">

            <Folder
              size={30}
              className="text-[var(--text-color)]"
            />

          </div>

          <div>

            <h1 className="text-3xl font-black">
              Media Library
            </h1>

            <p className="mt-1 text-sm text-[var(--muted-text-color)]">
              Manage images, videos & documents
            </p>

          </div>

        </div>

        <button className="flex items-center gap-2 rounded-2xl bg-fuchsia-500 px-5 py-3 font-bold text-[var(--text-color)]">

          <Upload size={18} />

          Upload File

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
          placeholder="Search media..."
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
          title="Images"
          value="1.2K"
          icon={<Image size={22} />}
        />

        <StatCard
          title="Videos"
          value="320"
          icon={<Video size={22} />}
        />

        <StatCard
          title="Documents"
          value="840"
          icon={<FileText size={22} />}
        />

        <StatCard
          title="Storage"
          value="42GB"
          icon={<HardDrive size={22} />}
        />

      </div>

      {/* FILE GRID */}

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">

        {filteredFiles.map(
          (
            item,
            index
          ) => (

            <div
              key={index}
              className="overflow-hidden rounded-[28px] border border-white/10 bg-[#151515]"
            >

              {/* PREVIEW */}

              <div className="flex h-40 items-center justify-center bg-gradient-to-br from-fuchsia-500 to-pink-500">

                {item.type ===
                "Image" ? (

                  <Image
                    size={52}
                    className="text-[var(--text-color)]"
                  />

                ) : item.type ===
                  "Video" ? (

                  <Video
                    size={52}
                    className="text-[var(--text-color)]"
                  />

                ) : (

                  <FileText
                    size={52}
                    className="text-[var(--text-color)]"
                  />

                )}

              </div>

              {/* CONTENT */}

              <div className="p-5">

                <h2 className="truncate text-xl font-black">
                  {item.name}
                </h2>

                <div className="mt-2 flex items-center justify-between text-sm text-[var(--muted-text-color)]">

                  <span>
                    {item.type}
                  </span>

                  <span>
                    {item.size}
                  </span>

                </div>

                {/* ACTIONS */}

                <div className="mt-5 flex items-center justify-between">

                  <button className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--card-color)]/10">

                    <Eye size={18} />

                  </button>

                  <button className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--card-color)]/10">

                    <Download size={18} />

                  </button>

                  <button className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--danger-color)]/20 text-red-400">

                    <Trash2 size={18} />

                  </button>

                </div>

              </div>

            </div>

          )
        )}

      </div>

      {/* LIBRARY SECTION */}

      <div className="mt-6 rounded-[30px] bg-gradient-to-r from-fuchsia-500 to-pink-600 p-6">

        <div className="flex items-center gap-3">

          <Grid3X3 size={26} />

          <h2 className="text-3xl font-black">
            Smart Media System
          </h2>

        </div>

        <p className="mt-3 max-w-2xl text-sm text-[var(--button-text-color)]/90">

          Organize files with AI powered media tagging,
          cloud sync and realtime optimization.

        </p>

        <button className="mt-6 rounded-2xl bg-[var(--card-color)] px-6 py-3 font-bold text-[var(--button-text-color)]">

          Open Media Manager

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

      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-fuchsia-500 text-[var(--text-color)]">

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
