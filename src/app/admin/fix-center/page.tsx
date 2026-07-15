"use client";
import { useJembeeConfig } from "@/lib/hooks/useJembeeConfig";

export default function FixCenter() {
  const config = useJembeeConfig();

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">JembeeKart System Status</h1>
      <div className="mt-4 grid gap-4">
        <StatusCard title="MLM Module" status={config.mlm.enabled ? "Active" : "Disabled"} />
        <StatusCard title="Ecommerce" status={config.features.ecommerce ? "Active" : "Disabled"} />
        <StatusCard title="Theme Engine" status="Connected & Dynamic" />
      </div>
      <button 
        onClick={() => window.location.reload()}
        className="mt-6 bg-primary text-white p-2 rounded"
      >
        Re-verify System Integrity
      </button>
    </div>
  );
}

function StatusCard({ title, status }: { title: string, status: string }) {
  return (
    <div className="border p-4 rounded-lg flex justify-between">
      <span>{title}</span>
      <span className={status === "Active" ? "text-green-500" : "text-red-500"}>{status}</span>
    </div>
  );
}
