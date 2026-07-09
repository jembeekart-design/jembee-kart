"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

import {
  doc,
  getDoc,
  setDoc
} from "firebase/firestore";

import {
  Home,
  Eye,
  EyeOff,
  MoveVertical,
  Save,
  LayoutDashboard,
  Image,
  Users,
  ShoppingBag,
  Star
} from "lucide-react";

import { db } from "@/firebase/config";

interface HomepageSettings {
  heroSection: boolean;
  bannerSection: boolean;
  affiliateSection: boolean;
  sellerSection: boolean;
  featuredProducts: boolean;
  trendingProducts: boolean;
  categoriesSection: boolean;
  reviewsSection: boolean;
  sectionOrder: string[];
}

export default function HomepagePage() {

  const [settings, setSettings] =
    useState<HomepageSettings>({
      heroSection: true,
      bannerSection: true,
      affiliateSection: true,
      sellerSection: true,
      featuredProducts: true,
      trendingProducts: true,
      categoriesSection: true,
      reviewsSection: true,
      sectionOrder: [
        "Hero",
        "Banner",
        "Categories",
        "Featured",
        "Trending",
        "Affiliate",
        "Seller",
        "Reviews"
      ]
    });

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  useEffect(() => {

    fetchHomepage();

  }, []);

  async function fetchHomepage() {

    try {

      const ref = doc(
        db,
        "admin_settings",
        "homepage"
      );

      const snapshot =
        await getDoc(ref);

      if (snapshot.exists()) {

        setSettings(
          snapshot.data() as HomepageSettings
        );

      }

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);

    }
  }

  async function saveHomepage() {

    try {

      setSaving(true);

      await setDoc(
        doc(
          db,
          "admin_settings",
          "homepage"
        ),
        settings
      );

      alert(
        "Homepage Updated"
      );

    } catch (error) {

      console.log(error);

    } finally {

      setSaving(false);

    }
  }

  function toggleSection(
    field: keyof HomepageSettings
  ) {

    setSettings((prev) => ({
      ...prev,
      [field]:
        !prev[field]
    }));
  }

  function moveUp(
    index: number
  ) {

    if (index === 0) return;

    const updated = [
      ...settings.sectionOrder
    ];

    [
      updated[index - 1],
      updated[index]
    ] = [
      updated[index],
      updated[index - 1]
    ];

    setSettings((prev) => ({
      ...prev,
      sectionOrder: updated
    }));
  }

  function moveDown(
    index: number
  ) {

    if (
      index ===
      settings.sectionOrder.length - 1
    ) {
      return;
    }

    const updated = [
      ...settings.sectionOrder
    ];

    [
      updated[index + 1],
      updated[index]
    ] = [
      updated[index],
      updated[index + 1]
    ];

    setSettings((prev) => ({
      ...prev,
      sectionOrder: updated
    }));
  }

  if (loading) {

    return (

      <div className="flex min-h-screen items-center justify-center bg-[var(--card-color)] text-[var(--button-text-color)]">

        Loading...

      </div>

    );
  }

  return (

    <main className="min-h-screen bg-[#0b0b0b] p-4 text-[var(--button-text-color)]">

      {/* HEADER */}

      <div className="mb-8 flex items-center justify-between">

        <div className="flex items-center gap-4">

          <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-violet-600">

            <Home size={30} />

          </div>

          <div>

            <h1 className="text-3xl font-black">
              Homepage Control
            </h1>

            <p className="mt-1 text-sm text-[var(--muted-text-color)]">
              Manage homepage layout & sections
            </p>

          </div>

        </div>

        <button
          onClick={saveHomepage}
          disabled={saving}
          className="flex items-center gap-2 rounded-2xl bg-violet-600 px-5 py-3 font-bold"
        >

          <Save size={18} />

          {saving
            ? "Saving..."
            : "Save Changes"}

        </button>

      </div>

      {/* SECTION TOGGLES */}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

        <SectionCard
          title="Hero Section"
          icon={
            <LayoutDashboard size={24} />
          }
          enabled={
            settings.heroSection
          }
          onToggle={() =>
            toggleSection(
              "heroSection"
            )
          }
        />

        <SectionCard
          title="Banner Section"
          icon={
            <Image size={24} />
          }
          enabled={
            settings.bannerSection
          }
          onToggle={() =>
            toggleSection(
              "bannerSection"
            )
          }
        />

        <SectionCard
          title="Affiliate Section"
          icon={
            <Users size={24} />
          }
          enabled={
            settings.affiliateSection
          }
          onToggle={() =>
            toggleSection(
              "affiliateSection"
            )
          }
        />

        <SectionCard
          title="Seller Section"
          icon={
            <ShoppingBag size={24} />
          }
          enabled={
            settings.sellerSection
          }
          onToggle={() =>
            toggleSection(
              "sellerSection"
            )
          }
        />

        <SectionCard
          title="Featured Products"
          icon={
            <Star size={24} />
          }
          enabled={
            settings.featuredProducts
          }
          onToggle={() =>
            toggleSection(
              "featuredProducts"
            )
          }
        />

        <SectionCard
          title="Trending Products"
          icon={
            <Star size={24} />
          }
          enabled={
            settings.trendingProducts
          }
          onToggle={() =>
            toggleSection(
              "trendingProducts"
            )
          }
        />

      </div>

      {/* SECTION ORDER */}

      <div className="mt-6 rounded-[30px] bg-[#151515] p-5">

        <div className="mb-6 flex items-center gap-3">

          <MoveVertical
            size={24}
            className="text-cyan-400"
          />

          <h2 className="text-2xl font-black">
            Homepage Order
          </h2>

        </div>

        <div className="space-y-4">

          {settings.sectionOrder.map(
            (
              item,
              index
            ) => (

              <div
                key={item}
                className="flex items-center justify-between rounded-2xl bg-[var(--card-color)]/30 p-4"
              >

                <div className="flex items-center gap-3">

                  <MoveVertical
                    size={18}
                    className="text-[var(--muted-text-color)]"
                  />

                  <h3 className="text-lg font-bold">
                    {item}
                  </h3>

                </div>

                <div className="flex gap-2">

                  <button
                    onClick={() =>
                      moveUp(
                        index
                      )
                    }
                    className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-bold"
                  >

                    Up

                  </button>

                  <button
                    onClick={() =>
                      moveDown(
                        index
                      )
                    }
                    className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-bold"
                  >

                    Down

                  </button>

                </div>

              </div>

            )
          )}

        </div>

      </div>

      {/* LIVE PREVIEW */}

      <div className="mt-6 rounded-[30px] bg-gradient-to-r from-violet-600 to-fuchsia-600 p-6">

        <h2 className="text-3xl font-black">
          Live Homepage Preview
        </h2>

        <p className="mt-2 text-[var(--button-text-color)]/80">
          Active homepage sections preview
        </p>

        <div className="mt-6 flex flex-wrap gap-3">

          {settings.heroSection && (
            <PreviewBadge
              title="Hero"
            />
          )}

          {settings.bannerSection && (
            <PreviewBadge
              title="Banner"
            />
          )}

          {settings.categoriesSection && (
            <PreviewBadge
              title="Categories"
            />
          )}

          {settings.featuredProducts && (
            <PreviewBadge
              title="Featured"
            />
          )}

          {settings.trendingProducts && (
            <PreviewBadge
              title="Trending"
            />
          )}

          {settings.affiliateSection && (
            <PreviewBadge
              title="Affiliate"
            />
          )}

          {settings.sellerSection && (
            <PreviewBadge
              title="Seller"
            />
          )}

          {settings.reviewsSection && (
            <PreviewBadge
              title="Reviews"
            />
          )}

        </div>

      </div>

    </main>

  );
}

function SectionCard({
  title,
  icon,
  enabled,
  onToggle
}: any) {

  return (

    <div className="rounded-[30px] bg-[#151515] p-5">

      <div className="flex items-center justify-between">

        <div className="flex items-center gap-3">

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--card-color)]">

            {icon}

          </div>

          <div>

            <h2 className="text-xl font-black">
              {title}
            </h2>

            <p className="text-sm text-[var(--muted-text-color)]">
              Homepage section
            </p>

          </div>

        </div>

        <button
          onClick={onToggle}
          className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold ${
            enabled
              ? "bg-[var(--success-color)]"
              : "bg-[var(--danger-color)]"
          }`}
        >

          {enabled ? (
            <>
              <Eye size={18} />
              Enabled
            </>
          ) : (
            <>
              <EyeOff size={18} />
              Disabled
            </>
          )}

        </button>

      </div>

    </div>

  );
}

function PreviewBadge({
  title
}: {
  title: string;
}) {

  return (

    <div className="rounded-full bg-[var(--card-color)]/20 px-5 py-3 text-sm font-bold backdrop-blur-lg">

      {title}

    </div>

  );
}
