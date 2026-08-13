"use client";

import ProfitabilityCard from "./ProfitabilityCard";
import WatchEarnCard from "./WatchEarnCard";
import ReferralCard from "./ReferralCard";
import WalletCard from "./WalletCard";
import CreatorEconomyCard from "./CreatorEconomyCard";
import FeatureFlagsCard from "./FeatureFlagsCard";
export default function BusinessRulesPage() {
  return (
    <div className="min-h-screen bg-[var(--color-page-background)] text-[var(--text-primary)] p-6">
      <div className="max-w-7xl mx-auto">

        <h1 className="text-3xl font-bold text-[var(--text-primary)]">
          Business Rules
        </h1>

        <p className="mt-2 text-[var(--text-muted)]">
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
