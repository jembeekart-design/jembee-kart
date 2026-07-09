"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";

import {
  Percent,
  Save,
  Users,
  IndianRupee,
  TrendingUp
} from "lucide-react";

export default function CommissionsPage() {

  const [
    affiliateCommission,
    setAffiliateCommission
  ] = useState("10");

  const [
    resellerCommission,
    setResellerCommission
  ] = useState("15");

  const [
    levelTwoCommission,
    setLevelTwoCommission
  ] = useState("5");

  function saveCommission() {

    alert(
      "Commission Settings Saved"
    );
  }

  return (

    <main className="min-h-screen bg-[#0b0b0b] p-4 text-[var(--button-text-color)]">

      {/* HEADER */}

      <div className="mb-8 flex items-center justify-between">

        <div className="flex items-center gap-4">

          <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-fuchsia-600">

            <Percent size={30} />

          </div>

          <div>

            <h1 className="text-3xl font-black">
              Commission Settings
            </h1>

            <p className="mt-1 text-sm text-gray-400">
              Manage MLM & affiliate commissions
            </p>

          </div>

        </div>

        <button
          onClick={saveCommission}
          className="flex items-center gap-2 rounded-2xl bg-fuchsia-600 px-5 py-3 text-sm font-bold text-[var(--button-text-color)]"
        >

          <Save size={18} />

          Save Settings

        </button>

      </div>

      {/* SETTINGS */}

      <div className="space-y-5">

        {/* AFFILIATE */}

        <div className="rounded-[30px] bg-[#151515] p-5">

          <div className="mb-5 flex items-center gap-3">

            <Users
              size={24}
              className="text-pink-400"
            />

            <h2 className="text-2xl font-black">
              Affiliate Commission %
            </h2>

          </div>

          <input
            type="number"
            value={affiliateCommission}
            onChange={(e) =>
              setAffiliateCommission(
                e.target.value
              )
            }
            className="w-full rounded-2xl border border-white/10 bg-black px-4 py-4 text-[var(--button-text-color)] outline-none"
          />

        </div>

        {/* RESELLER */}

        <div className="rounded-[30px] bg-[#151515] p-5">

          <div className="mb-5 flex items-center gap-3">

            <IndianRupee
              size={24}
              className="text-green-400"
            />

            <h2 className="text-2xl font-black">
              Reseller Commission %
            </h2>

          </div>

          <input
            type="number"
            value={resellerCommission}
            onChange={(e) =>
              setResellerCommission(
                e.target.value
              )
            }
            className="w-full rounded-2xl border border-white/10 bg-black px-4 py-4 text-[var(--button-text-color)] outline-none"
          />

        </div>

        {/* LEVEL 2 */}

        <div className="rounded-[30px] bg-[#151515] p-5">

          <div className="mb-5 flex items-center gap-3">

            <TrendingUp
              size={24}
              className="text-cyan-400"
            />

            <h2 className="text-2xl font-black">
              Level 2 MLM Commission %
            </h2>

          </div>

          <input
            type="number"
            value={levelTwoCommission}
            onChange={(e) =>
              setLevelTwoCommission(
                e.target.value
              )
            }
            className="w-full rounded-2xl border border-white/10 bg-black px-4 py-4 text-[var(--button-text-color)] outline-none"
          />

        </div>

      </div>

      {/* PREVIEW */}

      <div className="mt-6 rounded-[30px] bg-gradient-to-r from-fuchsia-600 to-pink-500 p-6">

        <h2 className="text-3xl font-black">
          Commission Overview
        </h2>

        <p className="mt-2 text-[var(--button-text-color)]/80">
          MLM & affiliate earning system
        </p>

        <div className="mt-6 grid grid-cols-3 gap-4">

          <div className="rounded-2xl bg-[var(--card-color)]/10 p-4">

            <p className="text-sm">
              Affiliate
            </p>

            <h3 className="mt-2 text-2xl font-black">
              {affiliateCommission}%
            </h3>

          </div>

          <div className="rounded-2xl bg-[var(--card-color)]/10 p-4">

            <p className="text-sm">
              Reseller
            </p>

            <h3 className="mt-2 text-2xl font-black">
              {resellerCommission}%
            </h3>

          </div>

          <div className="rounded-2xl bg-[var(--card-color)]/10 p-4">

            <p className="text-sm">
              Level 2
            </p>

            <h3 className="mt-2 text-2xl font-black">
              {levelTwoCommission}%
            </h3>

          </div>

        </div>

      </div>

    </main>

  );
}
