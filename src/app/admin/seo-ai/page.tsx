"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";

import {
  Search,
  Sparkles,
  Copy,
  Globe,
  FileText,
  Tags,
  Wand2
} from "lucide-react";

export default function SEOAIPage() {

  const [productName, setProductName] =
    useState("");

  const [category, setCategory] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [seoTitle, setSeoTitle] =
    useState("");

  const [seoDescription, setSeoDescription] =
    useState("");

  const [seoKeywords, setSeoKeywords] =
    useState("");

  async function generateSEO() {

    if (
      !productName ||
      !category
    ) {

      alert(
        "Enter product name & category"
      );

      return;

    }

    try {

      setLoading(true);

      const generatedTitle =
        `${productName} | Best ${category} Online Shopping`;

      const generatedDescription =
        `Buy ${productName} at the best price. Premium ${category} product with fast delivery, secure payments, and high quality assurance.`;

      const generatedKeywords =
        `${productName}, ${category}, online shopping, best ${category}, ecommerce`;

      setSeoTitle(
        generatedTitle
      );

      setSeoDescription(
        generatedDescription
      );

      setSeoKeywords(
        generatedKeywords
      );

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);

    }
  }

  function copyText(
    value: string
  ) {

    navigator.clipboard.writeText(
      value
    );

    alert("Copied");

  }

  return (

    <main className="min-h-screen bg-[#0b0b0b] p-4 text-[var(--button-text-color)]">

      {/* HEADER */}

      <div className="mb-8 flex items-center gap-4">

        <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-emerald-500">

          <Search size={30} />

        </div>

        <div>

          <h1 className="text-3xl font-black">
            AI SEO Generator
          </h1>

          <p className="mt-1 text-sm text-[var(--muted-text-color)]">
            Generate SEO title, description & keywords
          </p>

        </div>

      </div>

      {/* FORM */}

      <div className="rounded-[30px] bg-[#151515] p-5">

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

          <InputCard
            title="Product Name"
            icon={
              <Sparkles size={20} />
            }
            value={productName}
            onChange={
              setProductName
            }
            placeholder="Enter product name"
          />

          <InputCard
            title="Category"
            icon={
              <Tags size={20} />
            }
            value={category}
            onChange={
              setCategory
            }
            placeholder="Fashion, Electronics..."
          />

        </div>

        <button
          onClick={generateSEO}
          disabled={loading}
          className="mt-6 flex items-center gap-2 rounded-2xl bg-emerald-500 px-6 py-4 font-bold text-[var(--text-color)]"
        >

          <Wand2 size={20} />

          {loading
            ? "Generating..."
            : "Generate SEO"}

        </button>

      </div>

      {/* OUTPUT */}

      {(seoTitle ||
        seoDescription) && (

        <div className="mt-6 space-y-5">

          <OutputCard
            title="SEO Title"
            icon={
              <Globe size={20} />
            }
            value={seoTitle}
            onCopy={() =>
              copyText(
                seoTitle
              )
            }
          />

          <OutputCard
            title="SEO Description"
            icon={
              <FileText size={20} />
            }
            value={
              seoDescription
            }
            onCopy={() =>
              copyText(
                seoDescription
              )
            }
          />

          <OutputCard
            title="SEO Keywords"
            icon={
              <Tags size={20} />
            }
            value={
              seoKeywords
            }
            onCopy={() =>
              copyText(
                seoKeywords
              )
            }
          />

        </div>

      )}

      {/* PREVIEW */}

      <div className="mt-6 rounded-[30px] bg-gradient-to-r from-emerald-500 to-green-500 p-6">

        <h2 className="text-3xl font-black text-[var(--text-color)]">
          Google Preview
        </h2>

        <div className="mt-6 rounded-2xl bg-[var(--card-color)] p-5 text-[var(--text-color)]">

          <h3 className="text-2xl font-bold text-blue-700">

            {seoTitle ||
              "SEO Title Preview"}

          </h3>

          <p className="mt-2 text-sm text-green-700">

            www.jembeekart.com

          </p>

          <p className="mt-4 text-[var(--text-color)]">

            {seoDescription ||
              "SEO description preview will appear here..."}

          </p>

        </div>

      </div>

    </main>

  );
}

function InputCard({
  title,
  icon,
  value,
  onChange,
  placeholder
}: {
  title: string;
  icon: React.ReactNode;
  value: string;
  onChange: (
    value: string
  ) => void;
  placeholder: string;
}) {

  return (

    <div>

      <label className="mb-3 flex items-center gap-2 text-xl font-black">

        {icon}

        {title}

      </label>

      <input
        type="text"
        value={value}
        onChange={(e) =>
          onChange(
            e.target.value
          )
        }
        placeholder={placeholder}
        className="w-full rounded-2xl bg-[var(--card-color)] px-5 py-4 outline-none"
      />

    </div>

  );
}

function OutputCard({
  title,
  icon,
  value,
  onCopy
}: {
  title: string;
  icon: React.ReactNode;
  value: string;
  onCopy: () => void;
}) {

  return (

    <div className="rounded-[30px] bg-[#151515] p-5">

      <div className="mb-4 flex items-center justify-between">

        <div className="flex items-center gap-2">

          {icon}

          <h2 className="text-2xl font-black">
            {title}
          </h2>

        </div>

        <button
          onClick={onCopy}
          className="flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-2 font-bold text-[var(--text-color)]"
        >

          <Copy size={18} />

          Copy

        </button>

      </div>

      <div className="rounded-2xl bg-[var(--card-color)]/30 p-4">

        <p className="whitespace-pre-wrap text-gray-300">

          {value}

        </p>

      </div>

    </div>

  );
}
