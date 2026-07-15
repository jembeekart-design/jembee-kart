"use client";

import { useAdminConfig } from "@/lib/admin-config/provider";
import { useRouter } from "next/navigation";

export default function FixCenter() {
  const { config, status, error, lastUpdated } = useAdminConfig();
  const router = useRouter();

  const StatusCard = ({ 
    title, 
    status 
  }: { 
    title: string; 
    status: "Active" | "Disabled" | "Connected" | "Disconnected" | "Loaded" | "Missing" 
  }) => {
    const statusColors = {
      Active: "text-green-500",
      Disabled: "text-red-500",
      Connected: "text-green-500",
      Disconnected: "text-red-500",
      Loaded: "text-green-500",
      Missing: "text-red-500",
    };

    return (
      <div className="border border-gray-200 p-4 rounded-lg flex justify-between items-center bg-card">
        <span className="font-medium text-text">{title}</span>
        <span className={`font-bold ${statusColors[status]}`}>{status}</span>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-primary">JembeeKart Control Tower</h1>
      
      <div className="grid gap-4 mb-8">
        {/* 1. Firestore Connection Health */}
        <StatusCard 
          title="Firestore Config" 
          status={status === "ready" && !error ? "Connected" : "Disconnected"} 
        />
        
        {/* 2. Theme Health */}
        <StatusCard 
          title="Theme Engine" 
          status={config.theme?.primaryColor ? "Loaded" : "Missing"} 
        />

        {/* 3. Feature Flags Health */}
        <StatusCard 
          title="Feature Flags" 
          status={config.featureFlags?.ecommerce && config.featureFlags?.referral ? "Loaded" : "Missing"} 
        />
        
        {/* 4. Business Modules */}
        <StatusCard title="Wallet Module" status={config.wallet.commissionWalletEnabled ? "Active" : "Disabled"} />
        <StatusCard title="MLM Module" status={config.mlm.enabled ? "Active" : "Disabled"} />
      </div>

      <div className="bg-card p-4 rounded-lg border border-gray-200 text-sm space-y-2">
        <p className="flex justify-between">
          <span>Last Config Update:</span> 
          <span>{lastUpdated ? lastUpdated.toLocaleString() : "Never"}</span>
        </p>
        <p className="flex justify-between">
          <span>System Status:</span> 
          <span className={status === "ready" ? "text-green-500" : "text-yellow-500"}>{status}</span>
        </p>
      </div>

      <button 
        onClick={() => router.refresh()} // Next.js optimized refresh
        className="mt-6 w-full bg-primary text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-all"
      >
        Re-verify System Integrity
      </button>
    </div>
  );
}
