"use client";

import { Database, Palette, Wallet, Network } from "lucide-react";
import { useAdminConfig } from "@/lib/admin-config/provider";

export default function SystemHealth() {
  const { config, status, error } = useAdminConfig();

  const items = [
    {
      title: "Firestore",
      status: status === "ready" && !error,
      icon: Database,
    },
    {
      title: "Theme Engine",
      status: !!config.theme.primaryColor,
      icon: Palette,
    },
    {
      title: "Wallet",
      status: config.wallet.commissionWalletEnabled,
      icon: Wallet,
    },
    {
      title: "MLM",
      status: config.mlm.enabled,
      icon: Network,
    },
  ];

  return (
    <div className="rounded-xl border p-6">
      <h2 className="mb-6 text-xl font-bold">
        System Health
      </h2>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-xl border p-5"
            >
              <Icon
                className={
                  item.status
                    ? "text-green-600"
                    : "text-red-600"
                }
              />

              <h3 className="mt-4 font-semibold">
                {item.title}
              </h3>

              <p
                className={
                  item.status
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
                {item.status
                  ? "Healthy"
                  : "Problem"}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
