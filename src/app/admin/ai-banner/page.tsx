"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";

import {
  ImagePlus,
  Sparkles,
  Wand2,
  Download,
  Trash2,
  Save,
  LayoutTemplate,
  ImageIcon
} from "lucide-react";

export default function AIBannerPage() {

  const [prompt, setPrompt] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [generatedBanner, setGeneratedBanner] =
    useState(
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1200"
    );

  async function generateBanner() {

    if (!prompt) {

      alert(
        "Please enter banner prompt"
      );

      return;

    }

    try {

      setLoading(true);

      setTimeout(() => {

        setGeneratedBanner(
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1200"
        );

        setLoading(false);

      }, 2000);

    } catch (error) {

      console.log(error);

      setLoading(false);

    }
  }

  return (

    <main className="min-h-screen bg-[var(--primary-color)] p-4 text-[var(--button-text-color)]">

      {/* HEADER */}

      <div className="mb-8 flex items-center gap-4">

        <div className="flex h-16 w-16 items-center justify-center rounded-[30px] bg-[var(--primary-color)]">

          <Sparkles
            size={30}
            className="text-[var(--text-color)]"
          />

        </div>

        <div>

          <h1 className="text-4xl font-black">

            AI Banner Generator

          </h1>

          <p className="mt-1 text-sm text-[var(--muted-text-color)]">

            Create beautiful AI banners instantly

          </p>

        </div>

      </div>

      {/* PROMPT SECTION */}

      <div className="rounded-[30px] border border-[var(--border-color)]/10 bg-[var(--primary-color)] p-6">

        <div className="flex items-center gap-3">

          <Wand2 className="text-[var(--primary-color)]" />

          <h2 className="text-2xl font-black">

            Banner Prompt

          </h2>

        </div>

        <textarea
          value={prompt}
          onChange={(e) =>
            setPrompt(
              e.target.value
            )
          }
          placeholder="Example: Create modern ecommerce fashion sale banner with neon effects..."
          className="mt-5 h-40 w-full rounded-3xl border border-[var(--border-color)]/10 bg-[var(--card-color)]/40 p-5 text-[var(--button-text-color)] outline-none"
        />

        <div className="mt-5 flex flex-wrap gap-4">

          <button
            onClick={generateBanner}
            disabled={loading}
            className="flex items-center gap-2 rounded-2xl bg-[var(--primary-color)] px-6 py-4 font-bold text-[var(--text-color)] transition-all hover:scale-[1.03]"
          >

            <Sparkles size={20} />

            {loading
              ? "Generating..."
              : "Generate Banner"}

          </button>

          <button
            className="flex items-center gap-2 rounded-2xl border border-[var(--border-color)]/10 bg-[var(--primary-color)] px-6 py-4 font-bold"
          >

            <LayoutTemplate
              size={20}
            />

            Templates

          </button>

        </div>

      </div>

      {/* GENERATED BANNER */}

      <div className="mt-6 rounded-[30px] border border-[var(--border-color)]/10 bg-[var(--primary-color)] p-6">

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-3">

            <ImageIcon className="text-[var(--primary-color)]" />

            <h2 className="text-2xl font-black">

              Generated Banner

            </h2>

          </div>

          <div className="flex gap-3">

            <button
              className="flex items-center gap-2 rounded-2xl bg-[var(--card-color)]/10 px-4 py-3"
            >

              <Download size={18} />

              Download

            </button>

            <button
              className="flex items-center gap-2 rounded-2xl bg-[var(--danger-color)]/20 px-4 py-3 text-[var(--danger-color)]"
            >

              <Trash2 size={18} />

              Delete

            </button>

          </div>

        </div>

        <div className="mt-6 overflow-hidden rounded-[30px] border border-[var(--border-color)]/10">

          <img
            src={generatedBanner}
            alt="Banner"
            className="h-full w-full object-cover"
          />

        </div>

      </div>

      {/* QUICK STYLES */}

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">

        <StyleCard
          title="Fashion"
        />

        <StyleCard
          title="Electronics"
        />

        <StyleCard
          title="Luxury"
        />

        <StyleCard
          title="Gaming"
        />

      </div>

      {/* AI FEATURES */}

      <div className="mt-6 rounded-[30px] border border-[var(--border-color)]/10 bg-gradient-to-r from-[var(--primary-color)] to-[var(--primary-color)] p-6">

        <div className="flex items-center gap-3">

          <Sparkles />

          <h2 className="text-3xl font-black">

            AI Features

          </h2>

        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">

          <FeatureCard
            title="Auto Background"
            desc="AI creates beautiful backgrounds"
          />

          <FeatureCard
            title="Smart Text"
            desc="Generate catchy marketing text"
          />

          <FeatureCard
            title="HD Export"
            desc="Download ultra HD banners"
          />

        </div>

      </div>

      {/* SAVE SECTION */}

      <div className="mt-6 flex justify-end">

        <button
          className="flex items-center gap-2 rounded-2xl bg-[var(--success-color)] px-6 py-4 font-black text-[var(--text-color)]"
        >

          <Save size={20} />

          Save Banner

        </button>

      </div>

    </main>

  );
}

function StyleCard({
  title
}: {
  title: string;
}) {

  return (

    <button
      className="rounded-[24px] border border-[var(--border-color)]/10 bg-[var(--primary-color)] p-6 text-left transition-all hover:border-[var(--primary-color)]"
    >

      <ImagePlus
        className="text-[var(--primary-color)]"
      />

      <h3 className="mt-4 text-xl font-black">

        {title}

      </h3>

      <p className="mt-1 text-sm text-[var(--muted-text-color)]">

        Generate AI banner

      </p>

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

    <div className="rounded-[24px] bg-[var(--card-color)]/10 p-5 backdrop-blur-lg">

      <h3 className="text-xl font-black">

        {title}

      </h3>

      <p className="mt-2 text-sm text-[var(--button-text-color)]/80">

        {desc}

      </p>

    </div>

  );
}
