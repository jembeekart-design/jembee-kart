"use client";
import { useEffect, useState } from "react";

import { businessRules } from "@/firestore/businessRules";

import type {
  ProfitabilityRules,
} from "@/firestore/businessRules";

import ProfitabilityEditDialog from "./ProfitabilityEditDialog";

export default function ProfitabilityCard() {
  const [rules, setRules] =
  useState<ProfitabilityRules | null>(null);

const [loading, setLoading] =
  useState(true);
  const [open, setOpen] = useState(false);

useEffect(() => {

  async function loadRules() {

    try {

      const data =
        await businessRules.getProfitabilityRules();

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
            Profitability Rules
          </h2>

          <p className="mt-1 text-sm text-[var(--text-color)]">
            Configure order profit and expenses.
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
          <span>Order Profit</span>
          <span>{rules?.orderProfit ?? "--"}</span>
        </div>

        <div className="flex justify-between">
          <span>Cashback Percentage</span>
          <span>Auto</span>
        </div>

        <div className="flex justify-between">
          <span>Cashback Expense</span>
          <span>{rules?.cashbackExpense ?? "--"}</span>
        </div>

        <div className="flex justify-between">
          <span>Referral Expense</span>
          <span>{rules?.referralExpense ?? "--"}</span>
        </div>

        <div className="flex justify-between">
          <span>Reward Expense</span>
          <span>{rules?.rewardExpense ?? "--"}</span>
        </div>

        <div className="flex justify-between">
          <span>Creator Expense</span>
          <span>{rules?.creatorExpense ?? "--"}</span>
        </div>

        <div className="flex justify-between">
          <span>Protection Fund Expense</span>
          <span>{rules?.protectionFundExpense ?? "--"}</span>
        </div>

      </div>
   {rules && (
  <ProfitabilityEditDialog
    open={open}
    rules={rules}
    onClose={() => setOpen(false)}
    onSave={async (updatedRules) => {
      await businessRules.saveProfitabilityRules(updatedRules)
      setRules(updatedRules);
      setOpen(false);
    }}
  />
)}
    </div>
  );
}
