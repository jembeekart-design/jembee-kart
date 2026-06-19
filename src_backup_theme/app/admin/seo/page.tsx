"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";

import {
  Search,
  Globe,
  Save,
  Link,
  FileText
} from "lucide-react";

export default function SEOPage() {

  const [metaTitle, setMetaTitle] =
    useState("JembeeKart");

  const [
    metaDescription,
    setMetaDescription
  ] = useState(
    "Best ecommerce platform"
  );

  const [keywords, setKeywords] =
    useState(
      "shopping,ecommerce,fashion"
    );

  const [siteUrl, setSiteUrl] =
    useState(
      "https://jembeekart.com"
    );

  function saveSEO() {

    alert(
      "SEO Settings Saved"
    );
  }

  return (

    <main className="min-h-screen bg-[#0b0b0b] p-4 text-white">

      {/* HEADER */}

      <div className="mb-8 flex items-center justify-between">

        <div className="flex items-center gap-4">

          <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-orange-500">

            <Search size={30} />

          </div>

          <div>

            <h1 className="text-3xl font-black">
              SEO Settings
            </h1>

            <p className="mt-1 text-sm text-gray-400">
              Manage search engine optimization
            </p>

          </div>

        </div>

        <button
          onClick={saveSEO}
          className="flex items-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-bold text-white"
        >

          <Save size={18} />

          Save Settings

        </button>

      </div>

      {/* SEO FORM */}

      <div className="space-y-5">

        {/* META TITLE */}

        <div className="rounded-[30px] bg-[#151515] p-5">

          <div className="mb-5 flex items-center gap-3">

            <FileText
              size={24}
              className="text-orange-400"
            />

            <h2 className="text-2xl font-black">
              Meta Title
            </h2>

          </div>

          <input
            type="text"
            value={metaTitle}
            onChange={(e) =>
              setMetaTitle(
                e.target.value
              )
            }
            className="w-full rounded-2xl border border-white/10 bg-black px-4 py-4 text-white outline-none"
          />

        </div>

        {/* META DESCRIPTION */}

        <div className="rounded-[30px] bg-[#151515] p-5">

          <div className="mb-5 flex items-center gap-3">

            <Globe
              size={24}
              className="text-cyan-400"
            />

            <h2 className="text-2xl font-black">
              Meta Description
            </h2>

          </div>

          <textarea
            value={metaDescription}
            onChange={(e) =>
              setMetaDescription(
                e.target.value
              )
            }
            rows={5}
            className="w-full rounded-2xl border border-white/10 bg-black px-4 py-4 text-white outline-none"
          />

        </div>

        {/* KEYWORDS */}

        <div className="rounded-[30px] bg-[#151515] p-5">

          <div className="mb-5 flex items-center gap-3">

            <Search
              size={24}
              className="text-green-400"
            />

            <h2 className="text-2xl font-black">
              SEO Keywords
            </h2>

          </div>

          <input
            type="text"
            value={keywords}
            onChange={(e) =>
              setKeywords(
                e.target.value
              )
            }
            className="w-full rounded-2xl border border-white/10 bg-black px-4 py-4 text-white outline-none"
          />

        </div>

        {/* SITE URL */}

        <div className="rounded-[30px] bg-[#151515] p-5">

          <div className="mb-5 flex items-center gap-3">

            <Link
              size={24}
              className="text-pink-400"
            />

            <h2 className="text-2xl font-black">
              Website URL
            </h2>

          </div>

          <input
            type="text"
            value={siteUrl}
            onChange={(e) =>
              setSiteUrl(
                e.target.value
              )
            }
            className="w-full rounded-2xl border border-white/10 bg-black px-4 py-4 text-white outline-none"
          />

        </div>

      </div>

      {/* PREVIEW */}

      <div className="mt-6 rounded-[30px] bg-gradient-to-r from-orange-500 to-red-500 p-6">

        <p className="text-sm text-white/70">
          Google Search Preview
        </p>

        <h2 className="mt-3 text-3xl font-black">
          {metaTitle}
        </h2>

        <p className="mt-2 text-green-200 break-all">
          {siteUrl}
        </p>

        <p className="mt-4 text-white/90">
          {metaDescription}
        </p>

      </div>

    </main>

  );
}
