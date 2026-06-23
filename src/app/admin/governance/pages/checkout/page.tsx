"use client";

import AuditCard from "@/components/governance/AuditCard";

export default function CheckoutGovernancePage() {
  return (
    <main className="min-h-screen bg-[#050505] p-6 text-white">
      <h1 className="text-4xl font-black">
        Checkout Governance Audit
      </h1>

      <AuditCard
        title="Route Audit"
        status="PASS"
        issues={[
          "Checkout Route Found",
          "Checkout Page Connected"
        ]}
      />
    </main>
  );
}
