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

export default function CategoryGovernancePage() {
  return (
    <main className="min-h-screen bg-[#050505] p-6 text-white">

      <h1 className="text-4xl font-black mb-2">
        Category Page Audit
      </h1>

      <p className="text-gray-400 mb-8">
        src/app/category/page.tsx
      </p>

      <div className="grid gap-6 md:grid-cols-2">

        <AuditCard
          title="Route Audit"
          status="PASS"
          issues={[
            "Category Route Connected",
            "Header Connected",
            "Bottom Navbar Connected",
            "WhatsApp Button Connected",
          ]}
        />

        <AuditCard
          title="Category Engine Audit"
          status="PASS"
          issues={[
            "DynamicCategorySection Connected",
            "Categories Loaded Dynamically",
            "Reusable Category Module Found",
          ]}
        />

        <AuditCard
          title="Theme Audit"
          status="FAIL"
          issues={[
            "Hardcoded Background #f6f7fb",
            "Hardcoded Text Colors",
            "Theme Context Missing",
            "Admin Theme Engine Not Connected",
          ]}
        />

        <AuditCard
          title="Admin Control Audit"
          status="FAIL"
          issues={[
            "Category Layout Hardcoded",
            "Page Title Hardcoded",
            "No Admin Page Builder",
            "No Dynamic UI Config",
          ]}
        />

        <AuditCard
          title="Firestore Audit"
          status="WARNING"
          issues={[
            "Categories Source Unknown",
            "No Collection Validation",
            "No Firestore Health Check",
          ]}
        />

        <AuditCard
          title="Ecommerce Audit"
          status="PASS"
          issues={[
            "Category Discovery Working",
            "Product Navigation Ready",
            "Ecommerce Structure Present",
          ]}
        />

        <AuditCard
          title="Page Connection Audit"
          status="PASS"
          issues={[
            "Homepage Connected",
            "Product Pages Connected",
            "Header Navigation Connected",
          ]}
        />

        <AuditCard
          title="Security Audit"
          status="WARNING"
          issues={[
            "Role Validation Missing",
            "Permission Layer Missing",
            "Access Rules Not Verified",
          ]}
        />

      </div>

      <div className="mt-8 rounded-3xl border border-white/10 bg-[#111111] p-6">

        <h2 className="text-2xl font-black mb-4">
          Critical Problems
        </h2>

        <div className="space-y-3">

          <div className="bg-red-500/10 p-3 rounded-xl text-red-300">
            Hardcoded Background Color Found
          </div>

          <div className="bg-red-500/10 p-3 rounded-xl text-red-300">
            Theme Not Controlled From Admin Panel
          </div>

          <div className="bg-red-500/10 p-3 rounded-xl text-red-300">
            Category Page Layout Hardcoded
          </div>

          <div className="bg-red-500/10 p-3 rounded-xl text-red-300">
            No Dynamic Page Builder Connected
          </div>

        </div>

      </div>

    </main>
  );
}
