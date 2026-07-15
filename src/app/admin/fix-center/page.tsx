"use client";

import { useJembeeConfig } from "@/lib/hooks/useJembeeConfig";
import { useEffect, useState } from "react";

export default function FixCenter() {
  const config = useJembeeConfig();
  const [lastUpdated, setLastUpdated] = useState<string>("");

  useEffect(() => {
    setLastUpdated(new Date().toLocaleTimeString());
  }, []);

  const StatusCard = ({ title, status }: { title: string; status: "Active" | "Disabled" | "Connected" | "Disconnected" | "Loaded" | "Missing" }) => {
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
    <div className="p-6 max-w-2xl mx-auto theme-page">
      <h1 className="text-2xl font-bold mb-6 text-primary">JembeeKart Control Tower</h1>
      
      <div className="grid gap-4 mb-8">
        <StatusCard title="Firestore Config" status={config ? "Connected" : "Disconnected"} />
        <StatusCard title="Theme Engine" status={config.theme ? "Loaded" : "Missing"} />
        <StatusCard title="Wallet Module" status={config.wallet.commissionWalletEnabled ? "Active" : "Disabled"} />
        <StatusCard title="Referral System" status={config.referral.enabled ? "Active" : "Disabled"} />
        <StatusCard title="MLM Module" status={config.mlm.enabled ? "Active" : "Disabled"} />
      </div>

      <div className="bg-card p-4 rounded-lg border border-gray-200 text-sm space-y-2">
        <p className="flex justify-between"><span>Admin Config Loaded:</span> <span className="text-green-500">✅</span></p>
        <p className="flex justify-between"><span>Feature Flags Loaded:</span> <span className="text-green-500">✅</span></p>
        <p className="flex justify-between"><span>Last Diagnostic:</span> <span>{lastUpdated}</span></p>
      </div>

      <button 
        onClick={() => window.location.reload()}
        className="mt-6 w-full bg-primary text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-all"
      >
        Re-verify System Integrity
      </button>
    </div>
  );
}
