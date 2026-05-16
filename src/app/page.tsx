"use client";

import { useEffect, useState } from "react";

import {
  collection,
  onSnapshot
} from "firebase/firestore";

import { db } from "@/firebase/config";

import Header from "@/components/navigation/Header";

import BottomNavbar from "@/components/navigation/BottomNavbar";

import WhatsAppButton from "@/components/navigation/WhatsAppButton";

import HeroSection from "@/components/homepage/HeroSection";

import CategorySection from "@/components/homepage/CategorySection";

import ProductSection from "@/components/homepage/ProductSection";

import AffiliateSection from "@/components/homepage/AffiliateSection";

import SellerSection from "@/components/homepage/SellerSection";

import TipsSection from "@/components/homepage/TipsSection";

import FooterSection from "@/components/homepage/FooterSection";

interface HomepageSection {
  id?: string;

  sectionType: string;

  visible: boolean;

  position: number;

  title?: string;

  subtitle?: string;

  description?: string;

  buttonText?: string;

  secondaryButtonText?: string;
}

export default function Homepage() {
  const [sections, setSections] = useState<
    HomepageSection[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const sectionsCollection =
      collection(
        db,
        "homepage_sections"
      );

    const unsubscribe =
      onSnapshot(
        sectionsCollection,
        (snapshot) => {
          const sectionsData =
            snapshot.docs.map(
              (document) => {
                return {
                  id: document.id,
                  ...(document.data() as HomepageSection)
                };
              }
            );

          const sortedSections =
            sectionsData.sort(
              (a, b) => {
                return (
                  a.position -
                  b.position
                );
              }
            );

          setSections(sortedSections);

          setLoading(false);
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

      case "product":
        return (
          <ProductSection />
        );

      case "affiliate":
        return (
          <AffiliateSection
            title={section.title}
            description={
              section.description
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

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">

        <div className="text-2xl font-black text-blue-600">
          Loading JembeeKart...
        </div>

      </main>
    );
  }

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-gray-100 pb-28">

      <Header />

      {sections.map(
        (section) => {
          return (
            <div
              key={section.id}
            >
              {renderSection(
                section
              )}
            </div>
          );
        }
      )}

      <WhatsAppButton />

      <BottomNavbar />

    </main>
  );
}
