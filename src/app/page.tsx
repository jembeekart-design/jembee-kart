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

export default function Homepage() {
  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-gray-100 pb-28">

      <Header />

      <HeroSection />

      <CategorySection />

      <ProductSection />

      <AffiliateSection />

      <SellerSection />

      <TipsSection />

      <FooterSection />

      <WhatsAppButton />

      <BottomNavbar />

    </main>
  );
}
