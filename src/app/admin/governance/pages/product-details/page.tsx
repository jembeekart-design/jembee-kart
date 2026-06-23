"use client";

import AuditCard from "@/components/governance/AuditCard";

export default function ProductDetailsGovernancePage() {
  const governanceScore = 78;

  return (
    <main className="min-h-screen bg-[#050505] p-6 text-white">

      <div className="mb-8">
        <h1 className="text-4xl font-black">
          Product Details Governance Audit
        </h1>

        <p className="mt-2 text-gray-400">
          Audit Report for src/app/product/[id]/page.tsx
        </p>
      </div>

      <div className="mb-8 rounded-3xl border border-white/10 bg-[#111111] p-6">
        <p className="text-sm text-gray-400">
          Governance Score
        </p>

        <h2 className="mt-2 text-6xl font-black text-pink-400">
          {governanceScore}/100
        </h2>

        <p className="mt-3 text-yellow-400">
          Production Ready: PARTIAL
        </p>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-4">

        <div className="rounded-2xl bg-green-500/10 p-5">
          <p className="text-sm text-gray-400">
            Connected
          </p>
          <h3 className="text-3xl font-black text-green-400">
            24
          </h3>
        </div>

        <div className="rounded-2xl bg-red-500/10 p-5">
          <p className="text-sm text-gray-400">
            Missing
          </p>
          <h3 className="text-3xl font-black text-red-400">
            10
          </h3>
        </div>

        <div className="rounded-2xl bg-yellow-500/10 p-5">
          <p className="text-sm text-gray-400">
            Warnings
          </p>
          <h3 className="text-3xl font-black text-yellow-400">
            6
          </h3>
        </div>

        <div className="rounded-2xl bg-pink-500/10 p-5">
          <p className="text-sm text-gray-400">
            Critical
          </p>
          <h3 className="text-3xl font-black text-pink-400">
            3
          </h3>
        </div>

      </div>

      <div className="grid gap-6 md:grid-cols-2">

        <AuditCard
          title="Route Audit"
          status="PASS"
          issues={[
            "Dynamic Product Route Found",
            "useParams Connected",
            "Product ID Loading Working",
            "Navigation Working"
          ]}
        />

        <AuditCard
          title="Firestore Audit"
          status="PASS"
          issues={[
            "Products Collection Connected",
            "Product Fetch Working",
            "Cart Collection Connected",
            "Firestore Read Working"
          ]}
        />

        <AuditCard
          title="Ecommerce Audit"
          status="PASS"
          issues={[
            "Product Details Loaded",
            "Product Gallery Loaded",
            "Buy Now Working",
            "Add To Cart Working"
          ]}
        />

        <AuditCard
          title="Cart Audit"
          status="PASS"
          issues={[
            "User Cart Collection Connected",
            "Quantity Stored",
            "Size Stored",
            "Color Stored"
          ]}
        />

        <AuditCard
          title="Image Gallery Audit"
          status="PASS"
          issues={[
            "Image Slider Working",
            "Zoom Working",
            "Swipe Working",
            "Thumbnail Navigation Working"
          ]}
        />

        <AuditCard
          title="Wishlist Audit"
          status="FAIL"
          issues={[
            "Wishlist UI Exists",
            "Wishlist Firestore Missing",
            "Wishlist Sync Missing",
            "Wishlist Collection Missing"
          ]}
        />

        <AuditCard
          title="Inventory Audit"
          status="CRITICAL"
          issues={[
            "Stock Validation Missing",
            "Inventory Lock Missing",
            "Overselling Protection Missing"
          ]}
        />

        <AuditCard
          title="Theme Audit"
          status="FAIL"
          issues={[
            "Hardcoded Colors Found",
            "ThemeContext Missing",
            "Admin Theme Missing",
            "Dynamic Theme Missing"
          ]}
        />

        <AuditCard
          title="Admin Control Audit"
          status="FAIL"
          issues={[
            "Sizes Hardcoded",
            "Colors Hardcoded",
            "Coupons Hardcoded",
            "Delivery Rules Hardcoded"
          ]}
        />

        <AuditCard
          title="Reviews Audit"
          status="FAIL"
          issues={[
            "Reviews Collection Missing",
            "Ratings Collection Missing",
            "User Reviews Missing",
            "Review Analytics Missing"
          ]}
        />

        <AuditCard
          title="Seller Audit"
          status="WARNING"
          issues={[
            "Seller Info Displayed",
            "Seller Store Page Missing",
            "Seller Analytics Missing",
            "Seller Verification Missing"
          ]}
        />

        <AuditCard
          title="Security Audit"
          status="WARNING"
          issues={[
            "Login Validation Present",
            "Product Visibility Rules Missing",
            "Inventory Security Missing"
          ]}
        />

        <AuditCard
          title="Creator Economy Audit"
          status="FAIL"
          issues={[
            "Creator Attribution Missing",
            "Creator Revenue Share Missing",
            "Creator Analytics Missing"
          ]}
        />

        <AuditCard
          title="MLM Audit"
          status="WARNING"
          issues={[
            "Cashback Status Missing",
            "Referral Commission Missing",
            "Reward Visibility Missing"
          ]}
        />

      </div>

      <div className="mt-8 rounded-3xl border border-white/10 bg-[#111111] p-6">

        <h2 className="mb-4 text-2xl font-black">
          Missing Features
        </h2>

        <div className="grid gap-3 md:grid-cols-2">

          {[
            "Wishlist Firestore",
            "Wishlist Sync",
            "Product Reviews",
            "Product Ratings",
            "Related Products",
            "Recently Viewed",
            "Inventory Engine",
            "Inventory Lock",
            "Seller Store Page",
            "Seller Analytics",
            "Creator Revenue Share",
            "Creator Attribution",
            "Theme Engine Integration",
            "Admin Config Integration",
            "Dynamic Coupon Engine",
            "Cashback Display",
            "Referral Earnings Display"
          ].map((item) => (
            <div
              key={item}
              className="rounded-xl bg-red-500/10 p-3 text-red-300"
            >
              {item}
            </div>
          ))}

        </div>

      </div>

    </main>
  );
}
