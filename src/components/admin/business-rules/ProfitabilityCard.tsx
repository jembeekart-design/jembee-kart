"use client";

export default function ProfitabilityCard() {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900 p-6">

      <div className="flex items-center justify-between">

        <div>

          <h2 className="text-xl font-bold">
            Profitability Rules
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Configure order profit and expenses.
          </p>

        </div>

        <button
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium hover:bg-indigo-700"
        >
          Edit
        </button>

      </div>

      <div className="mt-6 grid gap-3">

        <div className="flex justify-between">
          <span>Order Profit</span>
          <span>--</span>
        </div>

        <div className="flex justify-between">
          <span>Cashback Percentage</span>
          <span>--</span>
        </div>

        <div className="flex justify-between">
          <span>Cashback Expense</span>
          <span>--</span>
        </div>

        <div className="flex justify-between">
          <span>Referral Expense</span>
          <span>--</span>
        </div>

        <div className="flex justify-between">
          <span>Reward Expense</span>
          <span>--</span>
        </div>

        <div className="flex justify-between">
          <span>Creator Expense</span>
          <span>--</span>
        </div>

        <div className="flex justify-between">
          <span>Protection Fund Expense</span>
          <span>--</span>
        </div>

      </div>

    </div>
  );
}
