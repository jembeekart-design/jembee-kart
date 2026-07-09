"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";

import {
  Shield,
  Lock,
  KeyRound,
  Save,
  Eye,
  EyeOff
} from "lucide-react";

export default function SecurityPage() {

  const [adminEmail, setAdminEmail] =
    useState("admin@jembeekart.com");

  const [password, setPassword] =
    useState("");

  const [
    twoFactorEnabled,
    setTwoFactorEnabled
  ] = useState(true);

  const [
    showPassword,
    setShowPassword
  ] = useState(false);

  function saveSecurity() {

    alert(
      "Security Settings Saved"
    );
  }

  return (

    <main className="min-h-screen bg-[#0b0b0b] p-4 text-[var(--button-text-color)]">

      {/* HEADER */}

      <div className="mb-8 flex items-center justify-between">

        <div className="flex items-center gap-4">

          <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-[var(--danger-color)]">

            <Shield size={30} />

          </div>

          <div>

            <h1 className="text-3xl font-black">
              Security Settings
            </h1>

            <p className="mt-1 text-sm text-[var(--muted-text-color)]">
              Manage admin security
            </p>

          </div>

        </div>

        <button
          onClick={saveSecurity}
          className="flex items-center gap-2 rounded-2xl bg-[var(--danger-color)] px-5 py-3 text-sm font-bold text-[var(--button-text-color)]"
        >

          <Save size={18} />

          Save Settings

        </button>

      </div>

      {/* SECURITY FORM */}

      <div className="space-y-5">

        {/* ADMIN EMAIL */}

        <div className="rounded-[30px] bg-[#151515] p-5">

          <div className="mb-5 flex items-center gap-3">

            <Lock
              size={24}
              className="text-cyan-400"
            />

            <h2 className="text-2xl font-black">
              Admin Email
            </h2>

          </div>

          <input
            type="email"
            value={adminEmail}
            onChange={(e) =>
              setAdminEmail(
                e.target.value
              )
            }
            className="w-full rounded-2xl border border-white/10 bg-[var(--card-color)] px-4 py-4 text-[var(--button-text-color)] outline-none"
          />

        </div>

        {/* PASSWORD */}

        <div className="rounded-[30px] bg-[#151515] p-5">

          <div className="mb-5 flex items-center gap-3">

            <KeyRound
              size={24}
              className="text-yellow-400"
            />

            <h2 className="text-2xl font-black">
              Change Password
            </h2>

          </div>

          <div className="relative">

            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
              placeholder="Enter new password"
              className="w-full rounded-2xl border border-white/10 bg-[var(--card-color)] px-4 py-4 pr-14 text-[var(--button-text-color)] outline-none"
            />

            <button
              onClick={() =>
                setShowPassword(
                  !showPassword
                )
              }
              className="absolute right-4 top-4"
            >

              {showPassword ? (
                <EyeOff size={22} />
              ) : (
                <Eye size={22} />
              )}

            </button>

          </div>

        </div>

        {/* 2FA */}

        <div className="rounded-[30px] bg-[#151515] p-5">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-2xl font-black">
                Two Factor Authentication
              </h2>

              <p className="mt-1 text-sm text-[var(--muted-text-color)]">
                Extra login security
              </p>

            </div>

            <button
              onClick={() =>
                setTwoFactorEnabled(
                  !twoFactorEnabled
                )
              }
              className={`rounded-2xl px-5 py-3 font-bold ${
                twoFactorEnabled
                  ? "bg-[var(--success-color)]"
                  : "bg-[var(--danger-color)]"
              }`}
            >

              {twoFactorEnabled
                ? "Enabled"
                : "Disabled"}

            </button>

          </div>

        </div>

      </div>

      {/* PREVIEW */}

      <div className="mt-6 rounded-[30px] bg-gradient-to-r from-red-500 to-pink-500 p-6">

        <h2 className="text-3xl font-black">
          Security Overview
        </h2>

        <p className="mt-2 text-[var(--button-text-color)]/80">
          Current security status
        </p>

        <div className="mt-6 grid grid-cols-2 gap-4">

          <div className="rounded-2xl bg-[var(--card-color)]/10 p-4">

            <p className="text-sm">
              Admin Email
            </p>

            <h3 className="mt-2 text-lg font-black break-all">
              {adminEmail}
            </h3>

          </div>

          <div className="rounded-2xl bg-[var(--card-color)]/10 p-4">

            <p className="text-sm">
              2FA Status
            </p>

            <h3 className="mt-2 text-lg font-black">
              {twoFactorEnabled
                ? "Enabled"
                : "Disabled"}
            </h3>

          </div>

        </div>

      </div>

    </main>

  );
}
