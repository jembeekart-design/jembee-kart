"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";

import {
  Wallet,
  Save,
  CheckCircle,
  CreditCard,
  ShieldCheck
} from "lucide-react";

export default function PaymentsPage() {

  const [cashfreeAppId, setCashfreeAppId] =
    useState("");

  const [
    cashfreeSecretKey,
    setCashfreeSecretKey
  ] = useState("");

  const [codEnabled, setCodEnabled] =
    useState(true);

  const [upiEnabled, setUpiEnabled] =
    useState(true);

  const [
    walletEnabled,
    setWalletEnabled
  ] = useState(true);

  function saveSettings() {

    alert(
      "Payment Settings Saved"
    );
  }

  return (

    <main className="min-h-screen bg-[var(--primary-color)] p-4 text-[var(--button-text-color)]">

      {/* HEADER */}

      <div className="mb-8 flex items-center justify-between">

        <div className="flex items-center gap-4">

          <div className="flex h-16 w-16 items-center justify-center rounded-[24px] theme-primary-bg">

            <Wallet size={30} />

          </div>

          <div>

            <h1 className="text-3xl font-black">
              Cashfree Settings
            </h1>

            <p className="mt-1 text-sm text-[var(--muted-text-color)]">
              Manage Cashfree payment gateway
            </p>

          </div>

        </div>

        <button
          onClick={saveSettings}
          className="flex items-center gap-2 rounded-2xl theme-primary-bg px-5 py-3 text-sm font-bold text-[var(--button-text-color)]"
        >

          <Save size={18} />

          Save Settings

        </button>

      </div>

      {/* SETTINGS */}

      <div className="space-y-5">

        {/* CASHFREE APP ID */}

        <div className="rounded-[30px] bg-[var(--primary-color)] p-5">

          <div className="mb-5 flex items-center gap-3">

            <CreditCard
              size={24}
              className="text-[var(--primary-color)]"
            />

            <h2 className="text-2xl font-black">
              Cashfree App ID
            </h2>

          </div>

          <input
            type="text"
            value={cashfreeAppId}
            onChange={(e) =>
              setCashfreeAppId(
                e.target.value
              )
            }
            placeholder="Enter Cashfree App ID"
            className="w-full rounded-2xl border border-[var(--border-color)]/10 bg-[var(--card-color)] px-4 py-4 text-[var(--button-text-color)] outline-none"
          />

        </div>

        {/* SECRET KEY */}

        <div className="rounded-[30px] bg-[var(--primary-color)] p-5">

          <div className="mb-5 flex items-center gap-3">

            <ShieldCheck
              size={24}
              className="text-[var(--success-color)]"
            />

            <h2 className="text-2xl font-black">
              Cashfree Secret Key
            </h2>

          </div>

          <input
            type="password"
            value={cashfreeSecretKey}
            onChange={(e) =>
              setCashfreeSecretKey(
                e.target.value
              )
            }
            placeholder="Enter Secret Key"
            className="w-full rounded-2xl border border-[var(--border-color)]/10 bg-[var(--card-color)] px-4 py-4 text-[var(--button-text-color)] outline-none"
          />

        </div>

        {/* COD */}

        <div className="rounded-[30px] bg-[var(--primary-color)] p-5">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-2xl font-black">
                Cash On Delivery
              </h2>

              <p className="mt-1 text-sm text-[var(--muted-text-color)]">
                Enable COD payments
              </p>

            </div>

            <button
              onClick={() =>
                setCodEnabled(
                  !codEnabled
                )
              }
              className={`rounded-2xl px-5 py-3 font-bold ${
                codEnabled
                  ? "bg-[var(--success-color)]"
                  : "bg-[var(--danger-color)]"
              }`}
            >

              {codEnabled
                ? "Enabled"
                : "Disabled"}

            </button>

          </div>

        </div>

        {/* UPI */}

        <div className="rounded-[30px] bg-[var(--primary-color)] p-5">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-2xl font-black">
                UPI Payments
              </h2>

              <p className="mt-1 text-sm text-[var(--muted-text-color)]">
                Accept UPI payments
              </p>

            </div>

            <button
              onClick={() =>
                setUpiEnabled(
                  !upiEnabled
                )
              }
              className={`rounded-2xl px-5 py-3 font-bold ${
                upiEnabled
                  ? "bg-[var(--success-color)]"
                  : "bg-[var(--danger-color)]"
              }`}
            >

              {upiEnabled
                ? "Enabled"
                : "Disabled"}

            </button>

          </div>

        </div>

        {/* WALLET */}

        <div className="rounded-[30px] bg-[var(--primary-color)] p-5">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-2xl font-black">
                Wallet Payments
              </h2>

              <p className="mt-1 text-sm text-[var(--muted-text-color)]">
                Accept wallet payments
              </p>

            </div>

            <button
              onClick={() =>
                setWalletEnabled(
                  !walletEnabled
                )
              }
              className={`rounded-2xl px-5 py-3 font-bold ${
                walletEnabled
                  ? "bg-[var(--success-color)]"
                  : "bg-[var(--danger-color)]"
              }`}
            >

              {walletEnabled
                ? "Enabled"
                : "Disabled"}

            </button>

          </div>

        </div>

      </div>

      {/* PREVIEW */}

      <div className="mt-6 rounded-[30px] bg-gradient-to-r from-[var(--primary-color)] to-[var(--primary-color)] p-6">

        <h2 className="text-3xl font-black">
          Payment Preview
        </h2>

        <p className="mt-2 text-[var(--button-text-color)]/80">
          Cashfree payment system overview
        </p>

        <div className="mt-6 grid grid-cols-2 gap-4">

          <div className="rounded-2xl bg-[var(--card-color)]/10 p-4">

            <p className="text-sm">
              Gateway
            </p>

            <h3 className="mt-2 text-xl font-black">
              Cashfree
            </h3>

          </div>

          <div className="rounded-2xl bg-[var(--card-color)]/10 p-4">

            <p className="text-sm">
              COD Status
            </p>

            <h3 className="mt-2 text-xl font-black">
              {codEnabled
                ? "Enabled"
                : "Disabled"}
            </h3>

          </div>

        </div>

      </div>

    </main>

  );
}
