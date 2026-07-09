"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";

import {
  Sparkles,
  Wand2,
  Copy,
  Package,
  FileText,
  Tags
} from "lucide-react";

export default function AIProductGeneratorPage() {

  const [productName, setProductName] =
    useState("");

  const [category, setCategory] =
    useState("");

  const [keywords, setKeywords] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [generatedTitle, setGeneratedTitle] =
    useState("");

  const [generatedDescription, setGeneratedDescription] =
    useState("");

  const [generatedTags, setGeneratedTags] =
    useState("");

  async function generateProduct() {

    if (
      !productName ||
      !category
    ) {

      alert(
        "Fill all required fields"
      );

      return;

    }

    try {

      setLoading(true);

      /* FREE AI MOCK GENERATOR */

      const title =
        `${productName} Premium ${category}`;

      const description =
        `Introducing ${productName}, a premium quality ${category} product designed for comfort, style, and performance. Perfect for everyday use with modern features and attractive design.`;

      const tags =
        `${productName}, ${category}, premium, trending, fashion, ecommerce`;

      setGeneratedTitle(
        title
      );

      setGeneratedDescription(
        description
      );

      setGeneratedTags(
        tags
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

        <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-[var(--secondary-color)]">

          <Sparkles size={30} />

        </div>

        <div>

          <h1 className="text-3xl font-black">
            AI Product Generator
          </h1>

          <p className="mt-1 text-sm text-[var(--muted-text-color)]">
            Generate product titles & descriptions
          </p>

        </div>

      </div>

      {/* FORM */}

      <div className="rounded-[30px] bg-[#151515] p-5">

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

          <InputCard
            title="Product Name"
            icon={
              <Package size={20} />
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
            placeholder="Fashion, Shoes, Electronics..."
          />

        </div>

        <div className="mt-5">

          <label className="mb-3 block text-xl font-black">

            Keywords

          </label>

          <textarea
            value={keywords}
            onChange={(e) =>
              setKeywords(
                e.target.value
              )
            }
            placeholder="premium, stylish, modern..."
            className="h-32 w-full rounded-2xl bg-[var(--card-color)] p-4 outline-none"
          />

        </div>

        <button
          onClick={
            generateProduct
          }
          disabled={loading}
          className="mt-6 flex items-center gap-2 rounded-2xl bg-[var(--secondary-color)] px-6 py-4 font-bold text-[var(--text-color)]"
        >

          <Wand2 size={20} />

          {loading
            ? "Generating..."
            : "Generate Product"}

        </button>

      </div>

      {/* OUTPUT */}

      {(generatedTitle ||
        generatedDescription) && (

        <div className="mt-6 space-y-5">

          {/* TITLE */}

          <OutputCard
            title="Generated Title"
            value={
              generatedTitle
            }
            onCopy={() =>
              copyText(
                generatedTitle
              )
            }
          />

          {/* DESCRIPTION */}

          <OutputCard
            title="Generated Description"
            value={
              generatedDescription
            }
            onCopy={() =>
              copyText(
                generatedDescription
              )
            }
          />

          {/* TAGS */}

          <OutputCard
            title="Generated Tags"
            value={
              generatedTags
            }
            onCopy={() =>
              copyText(
                generatedTags
              )
            }
          />

        </div>

      )}

      {/* PREVIEW */}

      <div className="mt-6 rounded-[30px] bg-gradient-to-r from-violet-500 to-fuchsia-500 p-6">

        <div className="flex items-center gap-3">

          <FileText size={28} />

          <h2 className="text-3xl font-black text-[var(--text-color)]">
            AI Preview
          </h2>

        </div>

        <div className="mt-6 rounded-2xl bg-[var(--card-color)]/20 p-5">

          <h3 className="text-2xl font-black">

            {generatedTitle ||
              "Product Title"}

          </h3>

          <p className="mt-4 text-[var(--text-color)]/80">

            {generatedDescription ||
              "Generated description will appear here..."}

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
}: any) {

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
  value,
  onCopy
}: any) {

  return (

    <div className="rounded-[30px] bg-[#151515] p-5">

      <div className="mb-4 flex items-center justify-between">

        <h2 className="text-2xl font-black">

          {title}

        </h2>

        <button
          onClick={onCopy}
          className="flex items-center gap-2 rounded-2xl bg-[var(--secondary-color)] px-4 py-2 font-bold text-[var(--text-color)]"
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
