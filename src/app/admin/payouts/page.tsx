"use client";

import Link from "next/link";

export default function PayoutsPage() {
  return (
    <main className="min-h-screen bg-[var(--color-page-background)] p-6">
      <section className="mx-auto max-w-2xl rounded-2xl bg-[var(--color-card-background)] p-6">
        <h1 className="text-2xl font-bold">Creator Payouts</h1>
        <p className="mt-3 text-sm text-[var(--text-secondary)]">Creator payout processing is not connected to a verified payment provider yet. No sample payouts are shown and no payout action is enabled.</p>
        <Link href="/admin/withdrawal-requests" className="mt-5 inline-flex rounded-xl bg-[var(--color-primary-button)] px-4 py-2 text-[var(--button-text-color)]">Open user withdrawal requests</Link>
      </section>
    </main>
  );
}
