"use client";

import { useEffect, useState } from "react";

import { businessRules } from "@/firestore/businessRules";

import type {
  WatchEarnRules,
} from "@/firestore/businessRules";

import WatchEarnEditDialog from "./WatchEarnEditDialog";

export default function WatchEarnCard() {
  const [rules, setRules] =
    useState<WatchEarnRules | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [open, setOpen] =
    useState(false);

  useEffect(() => {
    async function loadRules() {
      try {
        const data =
          await businessRules.getWatchEarnRules();

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
            Watch &amp; Earn Rules
          </h2>

          <p className="mt-1 text-sm text-[var(--text-color)]">
            Configure Watch &amp; Earn settings.
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
  <span>Reward Per Video</span>
  <span>₹{rules?.rewardPerVideo ?? "--"}</span>
</div>

        <div className="flex justify-between">
          <span>Videos Required</span>
          <span>{rules?.videosRequired ?? "--"}</span>
        </div>

        <div className="flex justify-between">
          <span>Reward Amount</span>
          <span>₹{rules?.rewardAmount ?? "--"}</span>
        </div>

        <div className="flex justify-between">
          <span>Required Sales</span>
          <span>{rules?.requiredSales ?? "--"}</span>
        </div>

        <div className="flex justify-between">
          <span>Maximum Active Cycles</span>
          <span>{rules?.maxActiveCycles ?? "--"}</span>
        </div>

        <div className="flex justify-between">
          <span>Minimum Watch Duration</span>
          <span>{rules?.minimumWatchDuration ?? "--"} sec</span>
        </div>

      </div>

      {rules && (
        <WatchEarnEditDialog
          open={open}
          rules={rules}
          onClose={() => setOpen(false)}
          onSave={async (updatedRules) => {
            await businessRules.saveWatchEarnRules(updatedRules);
            setRules(updatedRules);
            setOpen(false);
          }}
        />
      )}

    </div>
  );
}
