"use client";

import {
  AlertTriangle,
  CheckCircle,
  XCircle,
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

export default function CheckoutAuditPage() {
  return (
    <main className="min-h-screen bg-[#050505] p-6 text-white">

      <h1 className="text-4xl font-black mb-2">
        Checkout Page Audit
      </h1>

      <p className="text-gray-400 mb-8">
        src/app/checkout/page.tsx
      </p>

      <div className="grid gap-6 md:grid-cols-2">

        <AuditCard
          title="Route Audit"
          status="PASS"
          issues={[
            "Checkout Route Working",
            "ProductId Query Connected",
            "Payment Success Route Connected",
          ]}
        />

        <AuditCard
          title="Firestore Audit"
          status="PASS"
          issues={[
            "Orders Collection Connected",
            "Address Collection Connected",
            "Products Collection Connected",
          ]}
        />

        <AuditCard
          title="Theme Audit"
          status="FAIL"
          issues={[
            "Hardcoded Colors Found",
            "Hardcoded Button Colors",
            "Theme Context Missing",
            "Admin Theme Not Connected",
          ]}
        />

        <AuditCard
          title="Admin Control Audit"
          status="CRITICAL"
          issues={[
            "Product Price Hardcoded",
            "Discount Hardcoded",
            "COD Hardcoded",
            "Delivery Date Hardcoded",
            "Seller Hardcoded",
          ]}
        />

        <AuditCard
          title="Ecommerce Audit"
          status="WARNING"
          issues={[
            "Actual Product Price Not Used",
            "Actual Discount Not Used",
            "Actual Quantity Not Used",
          ]}
        />

        <AuditCard
          title="Referral Audit"
          status="FAIL"
          issues={[
            "Referral Preview Missing",
            "Commission Preview Missing",
            "Sponsor Visibility Missing",
          ]}
        />

        <AuditCard
          title="Watch Earn Audit"
          status="FAIL"
          issues={[
            "Reward Unlock Preview Missing",
            "Sales Qualification Missing",
          ]}
        />

        <AuditCard
          title="Security Audit"
          status="WARNING"
          issues={[
            "Client Side Order Creation",
            "No Anti Fraud Check",
            "No Self Order Detection",
          ]}
        />

      </div>

      <div className="mt-8 rounded-3xl border border-red-500/20 bg-red-500/5 p-6">

        <h2 className="text-2xl font-black text-red-400 mb-4">
          Critical Violations
        </h2>

        <div className="space-y-3">

          <div className="bg-red-500/10 p-3 rounded-xl text-red-300">
            productPrice = 1599 Hardcoded
          </div>

          <div className="bg-red-500/10 p-3 rounded-xl text-red-300">
            productDiscountPrice = 1099 Hardcoded
          </div>

          <div className="bg-red-500/10 p-3 rounded-xl text-red-300">
            subtotal = 1599 Hardcoded
          </div>

          <div className="bg-red-500/10 p-3 rounded-xl text-red-300">
            discount = 500 Hardcoded
          </div>

          <div className="bg-red-500/10 p-3 rounded-xl text-red-300">
            finalAmount = 1099 Hardcoded
          </div>

          <div className="bg-red-500/10 p-3 rounded-xl text-red-300">
            sellerId = default_seller Hardcoded
          </div>

          <div className="bg-red-500/10 p-3 rounded-xl text-red-300">
            Cash On Delivery Hardcoded
          </div>

          <div className="bg-red-500/10 p-3 rounded-xl text-red-300">
            Expected Delivery Date Hardcoded
          </div>

        </div>

      </div>

    </main>
  );
}
