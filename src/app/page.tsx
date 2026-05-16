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

import SellerSection from "@/components/homepage/SellerSection";

import AffiliateSection from "@/components/homepage/AffiliateSection";

import TipsSection from "@/components/homepage/TipsSection";

import FooterSection from "@/components/homepage/FooterSection";

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

export default function Page() {
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
                return {
                  id: document.id,
                  ...(document.data() as HomepageSection)
                };
              }
            );

          const sorted =
            data.sort(
              (a, b) =>
                a.position -
                b.position
            );

          setSections(sorted);
        }
      );

    return () => unsubscribe();
  }, []);

  function renderSection(
    section: HomepageSection
  ) {
    if (!section.visible)
      return null;

    switch (
      section.sectionType
    ) {
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

      case "seller":
        return (
          <SellerSection />
        );

      case "affiliate":
        return (
          <AffiliateSection
            title={
              section.title
            }
            description={
              section.description
            }
            buttonText={
              section.buttonText
            }
          />
        );

      case "tips":
        return <TipsSection />;

      default:
        return null;
    }
  }

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-gray-100">

      <div className="w-full overflow-x-hidden">

        <Header />

        <div className="flex w-full flex-col gap-5 overflow-x-hidden py-5">

          {sections.map(
            (section) => {
              return (
                <div
                  key={
                    section.id
                  }
                >
                  {renderSection(
                    section
                  )}
                </div>
              );
            }
          )}

        </div>

        <FooterSection />

      </div>

    </main>
  );
}
