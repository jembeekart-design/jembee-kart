"use client";

import { useEffect, useState } from "react";

import { businessRules } from "@/firestore/businessRules";

import type {
  FeatureFlags,
} from "@/firestore/businessRules";

import FeatureFlagsEditDialog from "./FeatureFlagsEditDialog";

export default function FeatureFlagsCard() {

  const [flags, setFlags] =
    useState<FeatureFlags | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [open, setOpen] =
    useState(false);

  useEffect(() => {

    async function loadFlags() {

      try {

        const data =
          await businessRules.getFeatureFlags();

        setFlags(data);

      } catch (error) {

        console.error(error);

      } finally {

        setLoading(false);

      }

    }

    loadFlags();

  }, []);

  if (loading) {

    return (
      <div className="rounded-xl border border-[var(--border-color)] bg-[var(--card-color)] p-6">
        Loading...
      </div>
    );

  }

  return (

    <div className="rounded-xl border border-[var(--border-color)] bg-[var(--card-color)] p-6">

      <div className="flex items-center justify-between">

        <div>

          <h2 className="text-xl font-bold">
            Feature Flags
          </h2>

          <p className="mt-1 text-sm text-[var(--text-color)]">
            Enable or disable JembeeKart modules.
          </p>

        </div>

        <button
          onClick={() => setOpen(true)}
          className="rounded-lg bg-[var(--primary-color)] px-4 py-2 text-sm font-medium hover:bg-[var(--primary-color)]"
        >
          Edit
        </button>

      </div>

      <div className="mt-6 grid gap-3">

        <div className="flex justify-between">
          <span>Ecommerce</span>
          <span>{flags?.ecommerceEnabled ? "ON" : "OFF"}</span>
        </div>

        <div className="flex justify-between">
          <span>Referral</span>
          <span>{flags?.referralEnabled ? "ON" : "OFF"}</span>
        </div>

        <div className="flex justify-between">
          <span>Watch & Earn</span>
          <span>{flags?.watchEarnEnabled ? "ON" : "OFF"}</span>
        </div>

        <div className="flex justify-between">
          <span>Creator Economy</span>
          <span>{flags?.creatorEconomyEnabled ? "ON" : "OFF"}</span>
        </div>

        <div className="flex justify-between">
          <span>Cashback</span>
          <span>{flags?.cashbackEnabled ? "ON" : "OFF"}</span>
        </div>

        <div className="flex justify-between">
          <span>Advertisements</span>
          <span>{flags?.adsEnabled ? "ON" : "OFF"}</span>
        </div>

        <div className="flex justify-between">
          <span>Wallet</span>
          <span>{flags?.walletEnabled ? "ON" : "OFF"}</span>
        </div>

        <div className="flex justify-between">
          <span>Loyalty Program</span>
          <span>{flags?.loyaltyEnabled ? "ON" : "OFF"}</span>
        </div>

      </div>

      {flags && (

        <FeatureFlagsEditDialog

          open={open}

          flags={flags}

          onClose={() => setOpen(false)}

          onSave={async (updatedFlags) => {

            await businessRules.saveFeatureFlags(
              updatedFlags
            );

            setFlags(updatedFlags);

            setOpen(false);

          }}

        />

      )}

    </div>

  );

}
