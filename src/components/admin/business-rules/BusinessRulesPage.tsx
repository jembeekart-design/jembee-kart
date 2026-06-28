"use client";

import ProfitabilityCard from "./ProfitabilityCard";

import WatchEarnCard from "./WatchEarnCard";

import ReferralCard from "./ReferralCard";

export default function BusinessRulesPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto">

        <h1 className="text-3xl font-bold">
          Business Rules
        </h1>

        <p className="mt-2 text-slate-400">
          Manage all JembeeKart business rules from one place.
        </p>

        <div className="mt-8 grid gap-6">

          <ProfitabilityCard />

          <WatchEarnCard />

         <ReferralCard />
          
          <div className="rounded-xl border border-slate-700 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">
              Wallet
            </h2>
            <p className="text-slate-400 mt-2">
              Configuration coming soon...
            </p>
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">
              Creator Economy
            </h2>
            <p className="text-slate-400 mt-2">
              Configuration coming soon...
            </p>
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">
              Feature Flags
            </h2>
            <p className="text-slate-400 mt-2">
              Configuration coming soon...
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
