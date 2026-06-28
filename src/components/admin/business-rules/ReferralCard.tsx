"use client";

import { useEffect, useState } from "react";

import { businessRules } from "@/firestore/businessRules";

import type {
  ReferralRules,
} from "@/firestore/businessRules";

import ReferralEditDialog from "./ReferralEditDialog";

export default function ReferralCard() {

  const [rules, setRules] =
    useState<ReferralRules | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [open, setOpen] =
    useState(false);

  useEffect(() => {

    async function loadRules() {

      try {

        const data =
          await businessRules.getReferralRules();

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
            Referral Rules
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Configure referral commission settings.
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
          <span>Level 1 Commission</span>
          <span>{rules?.level1Commission ?? "--"}%</span>
        </div>

        <div className="flex justify-between">
          <span>Level 2 Commission</span>
          <span>{rules?.level2Commission ?? "--"}%</span>
        </div>

        <div className="flex justify-between">
          <span>Level 3 Commission</span>
          <span>{rules?.level3Commission ?? "--"}%</span>
        </div>

        <div className="flex justify-between">
          <span>Level 4 Commission</span>
          <span>{rules?.level4Commission ?? "--"}%</span>
        </div>

      </div>

      {rules && (

        <ReferralEditDialog
          open={open}
          rules={rules}
          onClose={() => setOpen(false)}
          onSave={async (updatedRules) => {

            await businessRules.saveReferralRules(
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
