"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

import {
  collection,
  onSnapshot
} from "firebase/firestore";

import { db } from "@/firebase/config";

import Header from "@/components/navigation/Header";

import HeroSection from "@/components/homepage/HeroSection";

import CategorySection from "@/components/homepage/CategorySection";

import ProductSection from "@/components/homepage/ProductSection";

import AffiliateSection from "@/components/homepage/AffiliateSection";

import SellerSection from "@/components/homepage/SellerSection";

import TipsSection from "@/components/homepage/TipsSection";

import FooterSection from "@/components/homepage/FooterSection";

import BottomNavbar from "@/components/navigation/BottomNavbar";

import WhatsAppButton from "@/components/navigation/WhatsAppButton";

interface HomepageSection {
  id: string;

  sectionType: string;

  visible: boolean;

  position?: number;

  title?: string;

  subtitle?: string;

  description?: string;

  buttonText?: string;

  secondaryButtonText?: string;

  titleSize?: string;

  subtitleSize?: string;

  buttonSize?: string;

  backgroundColor?: string;

  gradientColor?: string;

  textColor?: string;

  buttonColor?: string;

  buttonTextColor?: string;

  sectionPadding?: string;

  borderRadius?: string;

  sectionHeight?: string;

  headerBackgroundColor?: string;

  headerTextColor?: string;

  searchBarColor?: string;

  statusBarColor?: string;

  sellerTitle?: string;

  sellerDescription?: string;

  sellerButtonText?: string;

  resellerTitle?: string;

  resellerDescription?: string;

  resellerButtonText?: string;

  sellerBackgroundColor?: string;

  sellerGradientColor?: string;

  resellerBackgroundColor?: string;

  resellerGradientColor?: string;

  sellerButtonColor?: string;

  sellerButtonTextColor?: string;

  resellerButtonColor?: string;

  resellerButtonTextColor?: string;

  affiliateBackgroundColor?: string;

  affiliateGradientColor?: string;

  affiliateButtonColor?: string;

  affiliateButtonTextColor?: string;
}

export default function HomePage() {
  const [sections, setSections] =
    useState<
      HomepageSection[]
    >([]);

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
                  id: document.id,

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
        }
      );

    return () => unsubscribe();
  }, []);

  function renderSection(
    section: HomepageSection
  ) {
    if (!section.visible) {
      return null;
    }

    switch (
      section.sectionType
    ) {
      /* HERO */

      case "hero":
        return (
          <HeroSection
            title={
              section.title
            }
            subtitle={
              section.subtitle
            }
            buttonText={
              section.buttonText
            }
            secondaryButtonText={
              section.secondaryButtonText
            }
            titleSize={
              section.titleSize
            }
            subtitleSize={
              section.subtitleSize
            }
            buttonSize={
              section.buttonSize
            }
            backgroundColor={
              section.backgroundColor
            }
            gradientColor={
              section.gradientColor
            }
            textColor={
              section.textColor
            }
            buttonColor={
              section.buttonColor
            }
            buttonTextColor={
              section.buttonTextColor
            }
            sectionPadding={
              section.sectionPadding
            }
            borderRadius={
              section.borderRadius
            }
            sectionHeight={
              section.sectionHeight
            }
          />
        );

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

      /* AFFILIATE */

      case "affiliate":
        return (
          <AffiliateSection
            title={
              section.title
            }
            description={
              section.description ||
              section.subtitle
            }
            buttonText={
              section.buttonText
            }

            backgroundColor={
              section.affiliateBackgroundColor ||
              section.backgroundColor
            }

            gradientColor={
              section.affiliateGradientColor ||
              section.gradientColor
            }

            buttonColor={
              section.affiliateButtonColor ||
              section.buttonColor
            }

            buttonTextColor={
              section.affiliateButtonTextColor ||
              section.buttonTextColor
            }
          />
        );

      /* SELLER */

      case "seller":
        return (
          <SellerSection
            sellerTitle={
              section.sellerTitle ||
              "Become A Seller"
            }

            sellerDescription={
              section.sellerDescription ||
              "Sell products with AI powered tools and ecommerce automation."
            }

            sellerButtonText={
              section.sellerButtonText ||
              "Start Selling"
            }

            resellerTitle={
              section.resellerTitle ||
              "Reseller Program"
            }

            resellerDescription={
              section.resellerDescription ||
              "Start reselling products without inventory."
            }

            resellerButtonText={
              section.resellerButtonText ||
              "Join Now"
            }

            sellerBackgroundColor={
              section.sellerBackgroundColor
            }

            sellerGradientColor={
              section.sellerGradientColor
            }

            resellerBackgroundColor={
              section.resellerBackgroundColor
            }

            resellerGradientColor={
              section.resellerGradientColor
            }

            sellerButtonColor={
              section.sellerButtonColor
            }

            sellerButtonTextColor={
              section.sellerButtonTextColor
            }

            resellerButtonColor={
              section.resellerButtonColor
            }

            resellerButtonTextColor={
              section.resellerButtonTextColor
            }
          />
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

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#f3f4f6] pt-[115px] md:pt-[150px]">

      <div className="w-full overflow-x-hidden">

        {/* HEADER */}

        <Header
          headerBackgroundColor={
            sections[0]
              ?.headerBackgroundColor
          }
          headerTextColor={
            sections[0]
              ?.headerTextColor
          }
          searchBarColor={
            sections[0]
              ?.searchBarColor
          }
          statusBarColor={
            sections[0]
              ?.statusBarColor
          }
        />

        {/* ALL SECTIONS */}

        <div className="w-full overflow-x-hidden pb-32">

          {sections.map(
            (section) => {
              return (
                <div
                  key={
                    section.id
                  }
                  className="w-full overflow-hidden"
                >
                  {renderSection(
                    section
                  )}
                </div>
              );
            }
          )}

        </div>

        {/* FLOATING BUTTON */}

        <WhatsAppButton />

        {/* BOTTOM NAVBAR */}

        <BottomNavbar />

      </div>

    </main>
  );
}
