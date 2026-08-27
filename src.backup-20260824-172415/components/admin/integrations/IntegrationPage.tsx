"use client";
import { useEffect, useState } from "react";

import {
  getIntegrationStatus,
  saveIntegrationStatus,
} from "@/firestore/integrations";

type ModuleItem = {
  id: string;
  name: string;
};

const modules: ModuleItem[] = [
  {
    id: "profitability",
    name: "Profitability",
  },
  {
    id: "watchEarn",
    name: "Watch & Earn",
  },
  {
    id: "referral",
    name: "Referral",
  },
  {
    id: "wallet",
    name: "Wallet",
  },
  {
    id: "creatorEconomy",
    name: "Creator Economy",
  },
  {
    id: "featureFlags",
    name: "Feature Flags",
  },
];

export default function IntegrationPage() {

  const [integrated, setIntegrated] =
    useState<Record<string, boolean>>({});

  const [loading, setLoading] =
    useState<Record<string, boolean>>({});
  useEffect(() => {

  async function loadStatus() {

    const data: Record<string, boolean> = {};

    for (const module of modules) {

      const status =
        await getIntegrationStatus(
          module.id
        );

      data[module.id] =
        status?.integrated ?? false;

    }

    setIntegrated(data);

  }

  loadStatus();

}, []);

  async function integrate(
  id: string
) {

  setLoading((prev) => ({
    ...prev,
    [id]: true,
  }));

  try {

    await saveIntegrationStatus(id);

    setIntegrated((prev) => ({
      ...prev,
      [id]: true,
    }));

  } finally {

    setLoading((prev) => ({
      ...prev,
      [id]: false,
    }));

  }

}
  

  return (

    <div className="min-h-screen bg-[var(--card-color)] p-6 text-[var(--button-text-color)]">

      <div className="mx-auto max-w-5xl">

        <h1 className="text-3xl font-bold">
          Integration Center
        </h1>

        <p className="mt-2 text-[var(--text-color)]">
          Connect Business Rules with JembeeKart modules.
        </p>

        <div className="mt-8 space-y-4">

          {modules.map((module) => (

            <div
              key={module.id}
              className="flex items-center justify-between rounded-xl border border-[var(--border-color)] bg-[var(--card-color)] p-6"
            >

              <div>

                <h2 className="text-xl font-semibold">
                  {module.name}
                </h2>

                <p className="mt-2 text-sm text-[var(--text-color)]">

                  {integrated[module.id]
                    ? `${module.name} Integration Successful`
                    : "Not Integrated"}

                </p>

              </div>

              <button
                disabled={
                  integrated[module.id] ||
                  loading[module.id]
                }
                onClick={() =>
                  integrate(module.id)
                }
                className="rounded-lg bg-[var(--primary-color)] px-5 py-2 font-medium hover:bg-[var(--primary-color)] disabled:cursor-not-allowed disabled:bg-[var(--success-color)]"
              >

                {loading[module.id]
                  ? "Integrating..."
                  : integrated[module.id]
                  ? "Integrated"
                  : "Integrate"}

              </button>

            </div>

          ))}

        </div>

      </div>

    </div>

  );

}
