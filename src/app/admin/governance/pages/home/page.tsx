// src/app/admin/governance/pages/home/page.tsx

"use client";

import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  ShoppingCart,
  Shield,
  Database,
  Settings,
  Palette,
} from "lucide-react";

function AuditCard({
  title,
  status,
  issues,
}: {
  title: string;
  status: "PASS" | "WARNING" | "FAIL";
  issues: string[];
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#111111] p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">{title}</h3>

        {status === "PASS" && (
          <CheckCircle className="text-green-400" />
        )}

        {status === "WARNING" && (
          <AlertTriangle className="text-yellow-400" />
        )}

        {status === "FAIL" && (
          <XCircle className="text-red-400" />
        )}
      </div>

      <div className="mt-4 space-y-2">
        {issues.map((issue, index) => (
          <div
            key={index}
            className="rounded-xl bg-black/30 p-3 text-sm text-gray-300"
          >
            {issue}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HomeGovernancePage() {
  return (
    <main className="min-h-screen bg-[#050505] p-6 text-white">

      <div className="mb-8">
        <h1 className="text-4xl font-black">
          Home Page Governance Audit
        </h1>

        <p className="mt-2 text-gray-400">
          Audit Report for src/app/page.tsx
        </p>
      </div>

      {/* Score */}

      <div className="mb-8 rounded-3xl border border-white/10 bg-[#111111] p-6">
        <p className="text-sm text-gray-400">
          Governance Score
        </p>

        <h2 className="mt-2 text-6xl font-black text-pink-400">
          63/100
        </h2>

        <p className="mt-3 text-red-400">
          Production Ready: NO
        </p>
      </div>

      {/* Summary */}

      <div className="mb-8 grid gap-4 md:grid-cols-4">

        <div className="rounded-2xl bg-green-500/10 p-5">
          <p className="text-sm text-gray-400">Connected</p>
          <h3 className="text-3xl font-black text-green-400">12</h3>
        </div>

        <div className="rounded-2xl bg-red-500/10 p-5">
          <p className="text-sm text-gray-400">Missing</p>
          <h3 className="text-3xl font-black text-red-400">9</h3>
        </div>

        <div className="rounded-2xl bg-yellow-500/10 p-5">
          <p className="text-sm text-gray-400">Warnings</p>
          <h3 className="text-3xl font-black text-yellow-400">6</h3>
        </div>

        <div className="rounded-2xl bg-pink-500/10 p-5">
          <p className="text-sm text-gray-400">Critical</p>
          <h3 className="text-3xl font-black text-pink-400">3</h3>
        </div>

      </div>

      {/* Audit Grid */}

      <div className="grid gap-6 md:grid-cols-2">

        <AuditCard
          title="Route Audit"
          status="PASS"
          issues={[
            "src/app/page.tsx Found",
            "Route Connected",
            "Page Rendering Working",
          ]}
        />

        <AuditCard
          title="Firestore Audit"
          status="WARNING"
          issues={[
            "homepage_sections Connected",
            "categories Connected",
            "products Connected",
            "homepage_layouts Missing",
            "homepage_themes Missing",
          ]}
        />

        <AuditCard
          title="Theme Audit"
          status="FAIL"
          issues={[
            "text-black Hardcoded",
            "bg-white Hardcoded",
            "text-indigo-600 Hardcoded",
            "Theme Not Fully Admin Controlled",
          ]}
        />

        <AuditCard
          title="Admin Control Audit"
          status="FAIL"
          issues={[
            "Product Card Design Hardcoded",
            "Category Layout Hardcoded",
            "Trending Products Section Hardcoded",
          ]}
        />

        <AuditCard
          title="Ecommerce Audit"
          status="PASS"
          issues={[
            "Search Working",
            "Category Filter Working",
            "Product Listing Working",
            "Product Detail Route Working",
          ]}
        />

        <AuditCard
          title="Referral Audit"
          status="WARNING"
          issues={[
            "Referral Visibility Missing",
            "Referral Banner Missing",
          ]}
        />

        <AuditCard
          title="Watch Earn Audit"
          status="WARNING"
          issues={[
            "Watch Earn Entry Missing",
            "Reward Visibility Missing",
          ]}
        />

        <AuditCard
          title="Security Audit"
          status="PASS"
          issues={[
            "Firestore Connected",
            "No Secret Keys Found",
            "Realtime Updates Working",
          ]}
        />

      </div>

      {/* Missing Collections */}

      <div className="mt-8 rounded-3xl border border-white/10 bg-[#111111] p-6">

        <h2 className="mb-4 text-2xl font-black">
          Missing Collections
        </h2>

        <div className="grid gap-3 md:grid-cols-2">

          {[
            "homepage_layouts",
            "homepage_themes",
            "ui_product_card_config",
            "featured_products_config",
            "homepage_analytics",
            "homepage_audit_logs",
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
