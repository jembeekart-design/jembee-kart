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

export default function CartGovernancePage() {
  return (
    <main className="min-h-screen bg-[#050505] p-6 text-white">

      <h1 className="text-4xl font-black mb-2">
        Cart Page Audit
      </h1>

      <p className="text-gray-400 mb-8">
        src/app/cart/page.tsx
      </p>

      <div className="grid gap-6 md:grid-cols-2">

        <AuditCard
          title="Route Audit"
          status="PASS"
          issues={[
            "Cart Route Connected",
            "Checkout Route Connected",
            "Product Page Connected",
          ]}
        />

        <AuditCard
          title="Firestore Audit"
          status="PASS"
          issues={[
            "users/{uid}/cart Connected",
            "Realtime Snapshot Enabled",
            "Quantity Update Working",
            "Delete Cart Item Working",
          ]}
        />

        <AuditCard
          title="Theme Audit"
          status="FAIL"
          issues={[
            "Hardcoded Background Found",
            "Hardcoded Indigo Color Found",
            "Theme Context Missing",
            "Admin Theme Not Connected",
          ]}
        />

        <AuditCard
          title="Admin Control Audit"
          status="FAIL"
          issues={[
            "FREE_GIFT_THRESHOLD Hardcoded",
            "Checkout Button Hardcoded",
            "Gift Rule Hardcoded",
            "No Firestore Settings",
          ]}
        />

        <AuditCard
          title="Ecommerce Audit"
          status="PASS"
          issues={[
            "Cart Working",
            "Checkout Working",
            "Quantity Control Working",
            "Delete Product Working",
          ]}
        />

        <AuditCard
          title="Watch Earn Audit"
          status="WARNING"
          issues={[
            "No Watch Earn Connection",
            "Reward Unlock Rule Missing",
          ]}
        />

        <AuditCard
          title="Referral Audit"
          status="WARNING"
          issues={[
            "Referral Profit Preview Missing",
            "Referral Reward Visibility Missing",
          ]}
        />

        <AuditCard
          title="Security Audit"
          status="WARNING"
          issues={[
            "Auth Check Present",
            "Firestore Rules Not Verified",
            "Cart Abuse Detection Missing",
          ]}
        />

      </div>

      <div className="mt-8 rounded-3xl border border-white/10 bg-[#111111] p-6">

        <h2 className="text-2xl font-black mb-4">
          Critical Problems
        </h2>

        <div className="space-y-3">

          <div className="bg-red-500/10 p-3 rounded-xl text-red-300">
            FREE_GIFT_THRESHOLD = 3500 Hardcoded
          </div>

          <div className="bg-red-500/10 p-3 rounded-xl text-red-300">
            Admin Cannot Change Gift Rules
          </div>

          <div className="bg-red-500/10 p-3 rounded-xl text-red-300">
            Theme Not Connected To Admin Theme Engine
          </div>

          <div className="bg-red-500/10 p-3 rounded-xl text-red-300">
            Checkout Rules Not Firestore Driven
          </div>

        </div>

      </div>

    </main>
  );
}
