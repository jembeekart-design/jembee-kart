"use client";

import Link from "next/link";
import { ArrowLeft, Trophy } from "lucide-react";

export default function MLMLeaderboardPage() {
  return (
    <main className="min-h-screen bg-[var(--color-page-background)] pb-24">
      <header className="sticky top-0 z-50 bg-[var(--color-card-background)] px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/mlm/dashboard" aria-label="Back to MLM dashboard" className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-warning)] text-[var(--text-primary)]">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-[24px] font-black text-[var(--text-primary)]">Leaderboard</h1>
            <p className="text-[11px] text-[var(--text-secondary)]">MLM performance rankings</p>
          </div>
        </div>
      </header>
      <section className="px-4 pt-5">
        <div className="rounded-[30px] bg-[var(--color-primary-button)] p-5 text-[var(--button-text-color)] shadow-xl">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-card-background)]/20">
            <Trophy size={34} />
          </div>
          <h2 className="mt-5 text-[28px] font-black">MLM Leaderboard</h2>
          <p className="mt-3 text-[13px] leading-6">Rankings will appear here when verified commission and team-performance records are connected.</p>
        </div>
      </section>
      <section className="mt-6 px-4">
        <div className="rounded-[30px] bg-[var(--color-card-background)] p-6 text-center shadow-sm">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">Leaderboard data unavailable</h2>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">No verified leaderboard records are available yet. No sample names, ranks, team counts, or earnings are displayed.</p>
        </div>
      </section>
    </main>
  );
}
