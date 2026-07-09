"use client";

import ProfitabilityCard from "./ProfitabilityCard";
import WatchEarnCard from "./WatchEarnCard";
import ReferralCard from "./ReferralCard";
import WalletCard from "./WalletCard";
import CreatorEconomyCard from "./CreatorEconomyCard";
import FeatureFlagsCard from "./FeatureFlagsCard";
export default function BusinessRulesPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-[var(--button-text-color)] p-6">
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
          
          <WalletCard />

          <CreatorEconomyCard />
          
          <FeatureFlagsCard />
          
        </div>
      </div>
    </div>
  );
}
