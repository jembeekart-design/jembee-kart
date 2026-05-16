"use client";

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

  position: number;

  title?: string;

  subtitle?: string;

  description?: string;

  buttonText?: string;

  secondaryButtonText?: string;
}

export default function HomePage() {
  const [sections, setSections] = useState<
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
                const firestoreData =
                  document.data() as Omit<
                    HomepageSection,
                    "id"
                  >;

                return {
                  ...firestoreData,
                  id: document.id
                };
              }
            );

          const sortedData =
            data.sort(
              (a, b) => {
                return (
                  a.position -
                  b.position
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
      case "hero":
        return (
          <HeroSection
  title={section.title}
  subtitle={section.subtitle}
  buttonText={section.buttonText}
  secondaryButtonText={section.secondaryButtonText}
  titleSize={section.titleSize}
  subtitleSize={section.subtitleSize}
  backgroundColor={section.backgroundColor}
  textColor={section.textColor}
  buttonColor={section.buttonColor}
  buttonTextColor={section.buttonTextColor}
  sectionPadding={section.sectionPadding}
  borderRadius={section.borderRadius}
/>
        );

      case "category":
        return (
          <CategorySection />
        );

      case "products":
        return (
          <ProductSection />
        );

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
          />
        );

      case "seller":
        return (
          <SellerSection />
        );

      case "tips":
        return (
          <TipsSection />
        );

      case "footer":
        return (
          <FooterSection />
        );

      default:
        return null;
    }
  }

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-gray-100">

      <div className="w-full overflow-x-hidden">

        <Header />

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

        <WhatsAppButton />

        <BottomNavbar />

      </div>

    </main>
  );
}
