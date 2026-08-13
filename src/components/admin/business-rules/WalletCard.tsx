"use client";

import { useEffect, useState } from "react";

import { businessRules } from "@/firestore/businessRules";

import type {
  WalletRules,
} from "@/firestore/businessRules";

import WalletEditDialog from "./WalletEditDialog";

export default function WalletCard() {

  const [rules, setRules] =
    useState<WalletRules | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [open, setOpen] =
    useState(false);

  useEffect(() => {

    async function loadRules() {

      try {

        const data =
          await businessRules.getWalletRules();

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
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card-background)] p-6">

      <div className="flex items-center justify-between">

        <div>

          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            Wallet Rules
          </h2>

          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Configure withdrawal and wallet settings.
          </p>

        </div>

        <button
          onClick={() => setOpen(true)}
          className="rounded-lg bg-[var(--color-primary-button)] px-4 py-2 text-sm font-medium text-[var(--button-text-color)] hover:bg-[var(--color-primary-button)]"
        >
          Edit
        </button>

      </div>

      <div className="mt-6 grid gap-3 text-[var(--text-primary)]">

        <div className="flex justify-between">
          <span>Minimum Withdrawal</span>
          <span>₹{rules?.minimumWithdrawal ?? "--"}</span>
        </div>

        <div className="flex justify-between">
          <span>Withdrawal Charge</span>
          <span>{rules?.withdrawalCharge ?? "--"}</span>
        </div>

        <div className="flex justify-between">
          <span>Charge Type</span>
          <span>{rules?.withdrawalChargeType ?? "--"}</span>
        </div>

        <div className="flex justify-between">
          <span>KYC Required</span>
          <span>{rules?.kycRequired ? "Yes" : "No"}</span>
        </div>

        <div className="flex justify-between">
          <span>Maximum Daily Withdrawal</span>
          <span>₹{rules?.maxDailyWithdrawal ?? "--"}</span>
        </div>

      </div>

      {rules && (

        <WalletEditDialog
          open={open}
          rules={rules}
          onClose={() => setOpen(false)}
          onSave={async (updatedRules) => {

            await businessRules.saveWalletRules(
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
