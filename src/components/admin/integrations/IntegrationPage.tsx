"use client";

import { useState } from "react";

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

  async function integrate(
    id: string
  ) {

    setLoading((prev) => ({
      ...prev,
      [id]: true,
    }));

    await new Promise((resolve) =>
      setTimeout(resolve, 1000)
    );

    setIntegrated((prev) => ({
      ...prev,
      [id]: true,
    }));

    setLoading((prev) => ({
      ...prev,
      [id]: false,
    }));

  }

  return (

    <div className="min-h-screen bg-slate-950 p-6 text-white">

      <div className="mx-auto max-w-5xl">

        <h1 className="text-3xl font-bold">
          Integration Center
        </h1>

        <p className="mt-2 text-slate-400">
          Connect Business Rules with JembeeKart modules.
        </p>

        <div className="mt-8 space-y-4">

          {modules.map((module) => (

            <div
              key={module.id}
              className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-900 p-6"
            >

              <div>

                <h2 className="text-xl font-semibold">
                  {module.name}
                </h2>

                <p className="mt-2 text-sm text-slate-400">

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
                className="rounded-lg bg-indigo-600 px-5 py-2 font-medium hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-green-600"
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
