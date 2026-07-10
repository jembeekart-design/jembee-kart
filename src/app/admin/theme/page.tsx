"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

import {
  doc,
  getDoc,
  updateDoc
} from "firebase/firestore";

import { db } from "@/firebase/config";

interface ThemeData {
  [key: string]: any;
}

export default function ThemePage() {

  const [heroTheme, setHeroTheme] =
    useState<ThemeData>({});

  const [affiliateTheme, setAffiliateTheme] =
    useState<ThemeData>({});

  const [sellerTheme, setSellerTheme] =
    useState<ThemeData>({});

  const [bannerTheme, setBannerTheme] =
    useState<ThemeData>({});

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    async function fetchTheme() {

      try {

        const heroRef = doc(
          db,
          "homepage_sections",
          "hero_section"
        );

        const affiliateRef = doc(
          db,
          "homepage_sections",
          "affiliate_section"
        );

        const sellerRef = doc(
          db,
          "homepage_sections",
          "seller_section"
        );

        const bannerRef = doc(
          db,
          "homepage_banner",
          "JoPe2zxbNgJa7rn7zDOq"
        );

        const [
          heroSnap,
          affiliateSnap,
          sellerSnap,
          bannerSnap
        ] = await Promise.all([
          getDoc(heroRef),
          getDoc(affiliateRef),
          getDoc(sellerRef),
          getDoc(bannerRef)
        ]);

        if (heroSnap.exists()) {
          setHeroTheme(heroSnap.data());
        }

        if (affiliateSnap.exists()) {
          setAffiliateTheme(
            affiliateSnap.data()
          );
        }

        if (sellerSnap.exists()) {
          setSellerTheme(
            sellerSnap.data()
          );
        }

        if (bannerSnap.exists()) {
          setBannerTheme(
            bannerSnap.data()
          );
        }

      } catch (error) {

        console.log(error);

      } finally {

        setLoading(false);

      }
    }

    fetchTheme();

  }, []);

  async function updateTheme(
    collectionName: string,
    documentId: string,
    field: string,
    value: string
  ) {

    try {

      const ref = doc(
        db,
        collectionName,
        documentId
      );

      await updateDoc(ref, {
        [field]: value
      });

      console.log(
        "Updated:",
        field,
        value
      );

    } catch (error) {

      console.log(error);

    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--card-color)] text-[var(--button-text-color)]">
        Loading...
      </div>
    );
  }

  return (

    <main className="min-h-screen bg-[var(--card-color)] p-4 text-[var(--button-text-color)]">

      <h1 className="mb-6 text-center text-3xl font-black">
        JembeeKart Live Theme
      </h1>

      <ThemeSection
        title="Hero Section"
        data={heroTheme}
        setData={setHeroTheme}
        collectionName="homepage_sections"
        documentId="hero_section"
        updateTheme={updateTheme}
      />

      <ThemeSection
        title="Affiliate Section"
        data={affiliateTheme}
        setData={setAffiliateTheme}
        collectionName="homepage_sections"
        documentId="affiliate_section"
        updateTheme={updateTheme}
      />

      <ThemeSection
        title="Seller Section"
        data={sellerTheme}
        setData={setSellerTheme}
        collectionName="homepage_sections"
        documentId="seller_section"
        updateTheme={updateTheme}
      />

      <ThemeSection
        title="Banner Section"
        data={bannerTheme}
        setData={setBannerTheme}
        collectionName="homepage_banner"
        documentId="JoPe2zxbNgJa7rn7zDOq"
        updateTheme={updateTheme}
      />

    </main>
  );
}

function ThemeSection({
  title,
  data,
  setData,
  collectionName,
  documentId,
  updateTheme
}: any) {

  return (

    <div
      className="mb-6 rounded-[30px] p-5 shadow-2xl"
      style={{
        background:
          data.backgroundColor ||
          data.gradientColor ||
          "var(--primary-color)"
      }}
    >

      <h2 className="mb-5 text-2xl font-black">
        {title}
      </h2>

      <div className="space-y-4">

        {Object.entries(data).map(
          ([key, value]: any) => {

            const isColor =
              typeof value ===
                "string" &&
              (
                value.startsWith(
                  "#"
                ) ||
                value.toLowerCase() ===
                  "white" ||
                value.toLowerCase() ===
                  "black"
              );

            if (!isColor) return null;

            const currentColor =
              value.startsWith("#")
                ? value
                : value.toLowerCase() ===
                  "white"
                ? "var(--primary-color)"
                : "var(--primary-color)";

            return (

              <div
                key={key}
                className="rounded-[24px] bg-[var(--card-color)]/10 p-4 backdrop-blur-lg"
              >

                <div className="mb-3 flex items-center justify-between">

                  <div>

                    <h3 className="text-lg font-bold">

                      {formatLabel(
                        key
                      )}

                    </h3>

                    <p className="text-sm text-[var(--text-color)]">

                      {currentColor}

                    </p>

                  </div>

                  <div
                    className="h-14 w-14 rounded-full border-4 border-[var(--border-color)]"
                    style={{
                      background:
                        currentColor
                    }}
                  />

                </div>

                {/* LIVE COLOR PICKER */}

                <input
                  type="color"
                  value={currentColor}
                  onChange={async (
                    e
                  ) => {

                    const newColor =
                      e.target.value;

                    /* UI LIVE UPDATE */

                    setData(
                      (
                        prev: ThemeData
                      ) => ({
                        ...prev,
                        [key]:
                          newColor
                      })
                    );

                    /* FIRESTORE UPDATE */

                    await updateTheme(
                      collectionName,
                      documentId,
                      key,
                      newColor
                    );

                  }}
                  className="h-[55px] w-full cursor-pointer rounded-2xl border-none bg-transparent"
                />

              </div>

            );
          }
        )}

      </div>

    </div>
  );
}

function formatLabel(
  value: string
) {

  return value
    .replace(
      /([A-Z])/g,
      " $1"
    )
    .replace(
      /^./,
      (str) =>
        str.toUpperCase()
    );
}
