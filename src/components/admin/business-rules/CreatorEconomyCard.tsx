"use client";

import { useEffect, useState } from "react";

import { businessRules } from "@/firestore/businessRules";

import type {
  CreatorEconomyRules,
} from "@/firestore/businessRules";

import CreatorEconomyEditDialog from "./CreatorEconomyEditDialog";

export default function CreatorEconomyCard() {

  const [rules, setRules] =
    useState<CreatorEconomyRules | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [open, setOpen] =
    useState(false);

  useEffect(() => {

    async function loadRules() {

      try {

        const data =
          await businessRules.getCreatorEconomyRules();

        setRules(data);

      } catch (error) {

        console.error(error);

      } finally {

        setLoading(false);

      }

    }

    loadRules();

  }, []);

  if (loading) {

    return (
      <div className="rounded-xl border border-slate-700 bg-slate-900 p-6">
        Loading...
      </div>
    );

  }

  return (

    <div className="rounded-xl border border-slate-700 bg-slate-900 p-6">

      <div className="flex items-center justify-between">

        <div>

          <h2 className="text-xl font-bold">
            Creator Economy
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Configure creator earnings and payouts.
          </p>

        </div>

        <button
          onClick={() => setOpen(true)}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium hover:bg-indigo-700"
        >
          Edit
        </button>

      </div>

      <div className="mt-6 grid gap-3">

        <div className="flex justify-between">
          <span>Creator Revenue Share</span>
          <span>{rules?.creatorRevenueShare ?? "--"}%</span>
        </div>

        <div className="flex justify-between">
          <span>Affiliate Revenue Share</span>
          <span>{rules?.affiliateRevenueShare ?? "--"}%</span>
        </div>

        <div className="flex justify-between">
          <span>Minimum Payout</span>
          <span>₹{rules?.minimumPayout ?? "--"}</span>
        </div>

      </div>

      {rules && (

        <CreatorEconomyEditDialog

          open={open}

          rules={rules}

          onClose={() => setOpen(false)}

          onSave={async (updatedRules) => {

            await businessRules.saveCreatorEconomyRules(
              updatedRules
            );

            setRules(updatedRules);

            setOpen(false);

          }}

        />

      )}

    </div>

  );

}
