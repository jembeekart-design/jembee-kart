"use client";

export const dynamic = "force-dynamic";

import { TicketPercent, Search, AlertTriangle } from "lucide-react";

export default function CouponManagerPage() {
  return (
    <main className="min-h-screen bg-[var(--color-page-background)] p-4 text-[var(--button-text-color)]">
      <header className="mb-8 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-[28px] bg-[var(--primary-color)]">
          <TicketPercent size={30} />
        </div>
        <div>
          <h1 className="text-3xl font-black">Coupon Manager</h1>
          <p className="mt-1 text-sm text-[var(--muted-text-color)]">
            Coupon records and discount validation are not connected to a verified coupon service.
          </p>
        </div>
      </header>

      <section className="rounded-[28px] border border-[var(--border-color)]/20 bg-[var(--primary-color)] p-6">
        <div className="flex items-center gap-3">
          <AlertTriangle size={22} className="text-[var(--warning-color)]" />
          <h2 className="text-lg font-bold">Coupon management unavailable</h2>
        </div>
        <p className="mt-3 text-sm text-[var(--muted-text-color)]">
          No coupons, usage totals, discount amounts, conversion rates, or expiry alerts are displayed because a verified coupon backend is not connected. Coupon creation and application remain unavailable until server-side validation and checkout integration are implemented.
        </p>
      </section>

      <section className="mt-6 rounded-[28px] border border-[var(--border-color)]/20 bg-[var(--primary-color)] p-5">
        <div className="flex items-center gap-3">
          <Search size={20} className="text-[var(--muted-text-color)]" />
          <p className="text-sm font-medium">Search is unavailable until coupon records are connected.</p>
        </div>
      </section>
    </main>
  );
}
