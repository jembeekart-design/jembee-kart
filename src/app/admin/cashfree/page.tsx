"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle, CreditCard, ShieldCheck, Server, KeyRound } from "lucide-react";

export const dynamic = "force-dynamic";

export default function CashfreePage() {
  const [showSetup, setShowSetup] = useState(false);

  return (
    <main className="min-h-screen bg-[var(--color-page-background)] p-4 text-[var(--button-text-color)]">
      <div className="mx-auto max-w-3xl">
        <header className="mb-6 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl theme-primary-bg">
            <CreditCard size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black">Cashfree Settings</h1>
            <p className="text-sm text-[var(--muted-text-color)]">Secure server-side payment gateway configuration</p>
          </div>
        </header>

        <section className="rounded-2xl border border-amber-400/50 bg-amber-500/10 p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-1 shrink-0 text-amber-600" />
            <div>
              <h2 className="font-bold">Not connected — payment integration is not verified</h2>
              <p className="mt-2 text-sm leading-6">
                This page no longer saves Cashfree secrets in browser-accessible Firestore or displays them in plain text.
                Checkout must not treat Cashfree as active until server-side payment session creation, webhook/signature
                verification and order-status reconciliation are implemented and tested.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-background)] p-5">
            <Server className="mb-3" size={24} />
            <h3 className="font-bold">Credential storage</h3>
            <p className="mt-2 text-sm text-[var(--muted-text-color)]">
              Configure Cashfree credentials as server-only environment variables or through a secured admin API with encrypted storage.
              Never put secret keys in client-side state or a client-readable document.
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-background)] p-5">
            <ShieldCheck className="mb-3" size={24} />
            <h3 className="font-bold">Payment verification</h3>
            <p className="mt-2 text-sm text-[var(--muted-text-color)]">
              Only a server-verified Cashfree payment result may mark an order as paid. A browser redirect alone is not proof of payment.
            </p>
          </div>
        </section>

        <button
          type="button"
          onClick={() => setShowSetup((value) => !value)}
          className="mt-5 rounded-xl border border-[var(--color-border)] px-4 py-3 font-semibold"
        >
          {showSetup ? "Hide required setup" : "Show required setup"}
        </button>

        {showSetup && (
          <section className="mt-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-background)] p-5">
            <h2 className="mb-3 flex items-center gap-2 font-bold"><KeyRound size={20} /> Required before enabling</h2>
            <ol className="list-decimal space-y-2 pl-5 text-sm leading-6">
              <li>Set Cashfree App ID and Secret only on the server; never expose the secret to the browser.</li>
              <li>Add an authenticated admin-only connection-test endpoint that returns status only.</li>
              <li>Create payment sessions using server-calculated order totals.</li>
              <li>Verify webhook signatures and confirm payment status server-to-server.</li>
              <li>Use idempotent order state transitions and test failures/retries before production.</li>
            </ol>
          </section>
        )}

        <p className="mt-5 flex items-center gap-2 text-xs text-[var(--muted-text-color)]">
          <CheckCircle size={16} /> This safety page does not claim a live Cashfree connection.
        </p>
      </div>
    </main>
  );
}
