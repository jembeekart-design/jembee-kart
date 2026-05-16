"use client";

import Header from "@/components/navigation/Header";

import HeroSection from "@/components/homepage/HeroSection";

import CategorySection from "@/components/homepage/CategorySection";

import ProductSection from "@/components/homepage/ProductSection";

import SellerSection from "@/components/homepage/SellerSection";

import AffiliateSection from "@/components/homepage/AffiliateSection";

import TipsSection from "@/components/homepage/TipsSection";

import FooterSection from "@/components/homepage/FooterSection";

export default function Page() {
  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-gray-100">

      <div className="w-full overflow-x-hidden">

        <Header />

        <div className="flex w-full flex-col gap-5 overflow-x-hidden py-5">

          <HeroSection
            title="Build Your Ecommerce Empire"
            subtitle="AI Powered Ecommerce, Affiliate Marketing, Reselling, MLM and Seller Ecosystem."
            buttonText="Start Shopping"
            secondaryButtonText="Become Seller"
          />

          <CategorySection
            categories={[
              "Fashion",
              "Electronics",
              "Beauty",
              "Shoes",
              "Mobiles",
              "Accessories",
              "Home",
              "Kids"
            ]}
          />

          <ProductSection
            products={[
              {
                id: 1,
                name: "Premium Hoodie",
                price: "₹999"
              },
              {
                id: 2,
                name: "Wireless Earbuds",
                price: "₹1499"
              },
              {
                id: 3,
                name: "Smart Watch",
                price: "₹2499"
              },
              {
                id: 4,
                name: "Sneakers",
                price: "₹1999"
              },
              {
                id: 5,
                name: "Beauty Kit",
                price: "₹799"
              },
              {
                id: 6,
                name: "Bluetooth Speaker",
                price: "₹1299"
              }
            ]}
          />

          <SellerSection
            sellerTitle="Become A Seller"
            sellerDescription="Sell products with AI powered tools, analytics and advanced ecommerce automation."
            sellerButtonText="Start Selling"
            resellerTitle="Reseller Program"
            resellerDescription="Start reselling products without inventory and grow your online business easily."
            resellerButtonText="Join Now"
          />

          <AffiliateSection
            title="Earn With Affiliate Marketing"
            description="Share products, grow your network and earn passive income daily with JembeeKart affiliate ecosystem."
            buttonText="Join Affiliate Program"
          />

          <TipsSection
            tips={[
              "Use trending products daily",
              "Share products on WhatsApp",
              "Build passive affiliate income"
            ]}
          />

        </div>

        <FooterSection />

      </div>

    </main>
  );
}
