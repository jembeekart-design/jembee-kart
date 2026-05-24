"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

import {
  collection,
  onSnapshot
} from "firebase/firestore";

import { db } from "@/firebase/config";

import Header from "@/components/navigation/Header";

import HomepageSlider from "@/components/homepage/HomepageSlider";

import CategorySection from "@/components/homepage/CategorySection";

import ProductSection from "@/components/homepage/ProductSection";

import TipsSection from "@/components/homepage/TipsSection";

import FooterSection from "@/components/homepage/FooterSection";

import BottomNavbar from "@/components/navigation/BottomNavbar";

import WhatsAppButton from "@/components/navigation/WhatsAppButton";

import PromoBanner from "@/components/PromoBanner";

interface HomepageSection {

  id: string;

  sectionType: string;

  visible: boolean;

  position?: number;

  headerBackgroundColor?: string;

  headerTextColor?: string;

  searchBarColor?: string;

  statusBarColor?: string;

}

export default function HomePage() {

  const [sections, setSections] =
    useState<
      HomepageSection[]
    >([]);

  const [
    headerSection,
    setHeaderSection
  ] = useState<
    HomepageSection | undefined
  >(undefined);

  /* ======================================================
  GET HOMEPAGE SECTIONS
  ====================================================== */

  useEffect(() => {

    const unsubscribe =
      onSnapshot(
        collection(
          db,
          "homepage_sections"
        ),
        (snapshot) => {

          const data =
            snapshot.docs.map(
              (document) => {

                return {

                  id:
                    document.id,

                  ...(document.data() as Omit<
                    HomepageSection,
                    "id"
                  >)

                };

              }
            );

          const sortedData =
            data.sort(
              (a, b) => {

                return (
                  Number(
                    a.position || 0
                  ) -
                  Number(
                    b.position || 0
                  )
                );

              }
            );

          setSections(
            sortedData
          );

          const headerData =
            sortedData.find(
              (section) =>
                section.sectionType ===
                "hero"
            );

          setHeaderSection(
            headerData
          );

        }
      );

    return () =>
      unsubscribe();

  }, []);

  /* ======================================================
  RENDER SECTION
  ====================================================== */

  function renderSection(
    section: HomepageSection
  ) {

    if (
      !section.visible
    ) {

      return null;

    }

    switch (
      section.sectionType
    ) {

      /* CATEGORY */

      case "category":

        return (
          <CategorySection />
        );

      /* PRODUCTS */

      case "products":

        return (
          <ProductSection />
        );

      /* TIPS */

      case "tips":

        return (
          <TipsSection />
        );

      /* FOOTER */

      case "footer":

        return (
          <FooterSection />
        );

      default:

        return null;

    }

  }

  /* ======================================================
  UI
  ====================================================== */

  return (

    <>

      {/* ======================================================
PROMO BANNER
====================================================== */}

<PromoBanner />

      <main
        className="
          min-h-screen
          w-full
          overflow-x-hidden
          bg-[#f3f4f6]
          pt-[115px]

          md:pt-[150px]
        "
      >

        <div className="w-full overflow-x-hidden">

          {/* ======================================================
          HEADER
          ====================================================== */}

          <Header
            headerBackgroundColor={
              headerSection?.headerBackgroundColor
            }
            headerTextColor={
              headerSection?.headerTextColor
            }
            searchBarColor={
              headerSection?.searchBarColor
            }
            statusBarColor={
              headerSection?.statusBarColor
            }
          />

          {/* ======================================================
          PAGE CONTENT
          ====================================================== */}

          <div className="w-full overflow-x-hidden pb-32">

            {/* ======================================================
            HERO SLIDER
            ====================================================== */}

            <HomepageSlider />

            {/* ======================================================
            CATEGORY SECTION
            ====================================================== */}

            <CategorySection />

            {/* ======================================================
            PRODUCT SECTION
            ====================================================== */}

            <ProductSection />

            {/* ======================================================
            DYNAMIC OTHER SECTIONS
            ====================================================== */}

            {sections.map(
              (section) => {

                if (
                  section.sectionType ===
                    "category" ||
                  section.sectionType ===
                    "products"
                ) {

                  return null;

                }

                return (

                  <div
                    key={
                      section.id
                    }
                    className="
                      w-full
                      overflow-hidden
                    "
                  >

                    {renderSection(
                      section
                    )}

                  </div>

                );

              }
            )}

          </div>

          {/* ======================================================
          FLOATING WHATSAPP
          ====================================================== */}

          <WhatsAppButton />

          {/* ======================================================
          BOTTOM NAVIGATION
          ====================================================== */}

          <BottomNavbar />

        </div>

      </main>

    </>

  );

}
