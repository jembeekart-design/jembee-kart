"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

import {
  doc,
  getDoc
} from "firebase/firestore";

import { db } from "@/firebase/config";

interface ThemeData {
  statusBarColor?: string;
  headerBackgroundColor?: string;
  backgroundColor?: string;
  gradientColor?: string;
  textColor?: string;
  buttonColor?: string;
  buttonTextColor?: string;
  sellerBackgroundColor?: string;
  sellerGradientColor?: string;
  sellerButtonColor?: string;
  resellerBackgroundColor?: string;
  resellerGradientColor?: string;
  resellerButtonColor?: string;
}

export default function ThemePage() {

  const [heroTheme, setHeroTheme] =
    useState<ThemeData | null>(null);

  const [affiliateTheme, setAffiliateTheme] =
    useState<ThemeData | null>(null);

  const [sellerTheme, setSellerTheme] =
    useState<ThemeData | null>(null);

  const [bannerTheme, setBannerTheme] =
    useState<ThemeData | null>(null);

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
          setHeroTheme(
            heroSnap.data() as ThemeData
          );
        }

        if (affiliateSnap.exists()) {
          setAffiliateTheme(
            affiliateSnap.data() as ThemeData
          );
        }

        if (sellerSnap.exists()) {
          setSellerTheme(
            sellerSnap.data() as ThemeData
          );
        }

        if (bannerSnap.exists()) {
          setBannerTheme(
            bannerSnap.data() as ThemeData
          );
        }

      } catch (error) {

        console.error(error);

      } finally {

        setLoading(false);

      }
    }

    fetchTheme();

  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        Loading Theme...
      </div>
    );
  }

  return (

    <main className="min-h-screen bg-[#0f0f0f] p-4 text-white">

      <h1 className="mb-6 text-center text-3xl font-black">
        JembeeKart Theme Panel
      </h1>

      {/* HERO SECTION */}

      <div
        className="mb-6 rounded-[24px] p-5 shadow-xl"
        style={{
          background:
            heroTheme?.backgroundColor ||
            "#111111"
        }}
      >

        <h2 className="mb-4 text-xl font-black">
          Hero Section
        </h2>

        <div className="grid gap-3">

          <ThemeBox
            label="Status Bar Color"
            color={
              heroTheme?.statusBarColor
            }
          />

          <ThemeBox
            label="Header Background"
            color={
              heroTheme?.headerBackgroundColor
            }
          />

          <ThemeBox
            label="Background Color"
            color={
              heroTheme?.backgroundColor
            }
          />

          <ThemeBox
            label="Gradient Color"
            color={
              heroTheme?.gradientColor
            }
          />

          <ThemeBox
            label="Text Color"
            color={
              heroTheme?.textColor
            }
          />

          <ThemeBox
            label="Button Color"
            color={
              heroTheme?.buttonColor
            }
          />

          <ThemeBox
            label="Button Text Color"
            color={
              heroTheme?.buttonTextColor
            }
          />

        </div>

      </div>

      {/* AFFILIATE SECTION */}

      <div
        className="mb-6 rounded-[24px] p-5 shadow-xl"
        style={{
          background:
            affiliateTheme?.backgroundColor ||
            "#111111"
        }}
      >

        <h2 className="mb-4 text-xl font-black">
          Affiliate Section
        </h2>

        <div className="grid gap-3">

          <ThemeBox
            label="Background Color"
            color={
              affiliateTheme?.backgroundColor
            }
          />

          <ThemeBox
            label="Button Color"
            color={
              affiliateTheme?.buttonColor
            }
          />

          <ThemeBox
            label="Button Text Color"
            color={
              affiliateTheme?.buttonTextColor
            }
          />

          <ThemeBox
            label="Seller Background"
            color={
              affiliateTheme?.sellerBackgroundColor
            }
          />

          <ThemeBox
            label="Seller Gradient"
            color={
              affiliateTheme?.sellerGradientColor
            }
          />

        </div>

      </div>

      {/* SELLER SECTION */}

      <div
        className="mb-6 rounded-[24px] p-5 shadow-xl"
        style={{
          background:
            sellerTheme?.sellerBackgroundColor ||
            "#111111"
        }}
      >

        <h2 className="mb-4 text-xl font-black">
          Seller Section
        </h2>

        <div className="grid gap-3">

          <ThemeBox
            label="Seller Background"
            color={
              sellerTheme?.sellerBackgroundColor
            }
          />

          <ThemeBox
            label="Seller Gradient"
            color={
              sellerTheme?.sellerGradientColor
            }
          />

          <ThemeBox
            label="Seller Button"
            color={
              sellerTheme?.sellerButtonColor
            }
          />

          <ThemeBox
            label="Reseller Background"
            color={
              sellerTheme?.resellerBackgroundColor
            }
          />

          <ThemeBox
            label="Reseller Gradient"
            color={
              sellerTheme?.resellerGradientColor
            }
          />

          <ThemeBox
            label="Reseller Button"
            color={
              sellerTheme?.resellerButtonColor
            }
          />

        </div>

      </div>

      {/* BANNER SECTION */}

      <div
        className="rounded-[24px] p-5 shadow-xl"
        style={{
          background:
            bannerTheme?.backgroundColor ||
            "#111111"
        }}
      >

        <h2 className="mb-4 text-xl font-black">
          Banner Section
        </h2>

        <div className="grid gap-3">

          <ThemeBox
            label="Background Color"
            color={
              bannerTheme?.backgroundColor
            }
          />

          <ThemeBox
            label="Gradient Color"
            color={
              bannerTheme?.gradientColor
            }
          />

          <ThemeBox
            label="Text Color"
            color={
              bannerTheme?.textColor
            }
          />

          <ThemeBox
            label="Button Color"
            color={
              bannerTheme?.buttonColor
            }
          />

          <ThemeBox
            label="Button Text Color"
            color={
              bannerTheme?.buttonTextColor
            }
          />

        </div>

      </div>

    </main>
  );
}

function ThemeBox({
  label,
  color
}: {
  label: string;
  color?: string;
}) {

  return (

    <div className="flex items-center justify-between rounded-2xl bg-white/10 p-4">

      <div>

        <h3 className="text-sm font-bold">
          {label}
        </h3>

        <p className="mt-1 text-xs text-gray-300">
          {color || "No Color"}
        </p>

      </div>

      <div
        className="h-12 w-12 rounded-full border-4 border-white"
        style={{
          background:
            color || "#000000"
        }}
      />

    </div>
  );
}
