"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";

import {
  Headphones,
  Phone,
  Mail,
  MessageCircle,
  Save
} from "lucide-react";

export default function SupportPage() {

  const [email, setEmail] =
    useState("support@jembeekart.com");

  const [phone, setPhone] =
    useState("+91 9876543210");

  const [whatsapp, setWhatsapp] =
    useState("+91 9876543210");

  return (

    <main className="min-h-screen bg-[var(--primary-color)] p-4 text-[var(--button-text-color)]">

      {/* HEADER */}

      <div className="mb-8 flex items-center justify-between">

        <div className="flex items-center gap-4">

          <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-[var(--success-color)]">

            <Headphones size={30} />

          </div>

          <div>

            <h1 className="text-3xl font-black">
              Support Settings
            </h1>

            <p className="mt-1 text-sm text-[var(--muted-text-color)]">
              Manage support contacts
            </p>

          </div>

        </div>

        <button
          className="flex items-center gap-2 rounded-2xl bg-[var(--success-color)] px-5 py-3 text-sm font-bold"
        >

          <Save size={18} />

          Save Settings

        </button>

      </div>

      {/* SUPPORT FORM */}

      <div className="space-y-5">

        <div className="rounded-[30px] bg-[var(--primary-color)] p-5">

          <div className="mb-5 flex items-center gap-3">

            <Mail
              size={24}
              className="theme-primary-text"
            />

            <h2 className="text-2xl font-black">
              Support Email
            </h2>

          </div>

          <input
            type="text"
            value={email}
            onChange={(e) =>
              setEmail(
                e.target.value
              )
            }
            className="w-full rounded-2xl border border-[var(--border-color)]/10 bg-[var(--card-color)] px-4 py-4 outline-none"
          />

        </div>

        <div className="rounded-[30px] bg-[var(--primary-color)] p-5">

          <div className="mb-5 flex items-center gap-3">

            <Phone
              size={24}
              className="text-[var(--warning-color)]"
            />

            <h2 className="text-2xl font-black">
              Support Phone
            </h2>

          </div>

          <input
            type="text"
            value={phone}
            onChange={(e) =>
              setPhone(
                e.target.value
              )
            }
            className="w-full rounded-2xl border border-[var(--border-color)]/10 bg-[var(--card-color)] px-4 py-4 outline-none"
          />

        </div>

        <div className="rounded-[30px] bg-[var(--primary-color)] p-5">

          <div className="mb-5 flex items-center gap-3">

            <MessageCircle
              size={24}
              className="text-[var(--success-color)]"
            />

            <h2 className="text-2xl font-black">
              WhatsApp Support
            </h2>

          </div>

          <input
            type="text"
            value={whatsapp}
            onChange={(e) =>
              setWhatsapp(
                e.target.value
              )
            }
            className="w-full rounded-2xl border border-[var(--border-color)]/10 bg-[var(--card-color)] px-4 py-4 outline-none"
          />

        </div>

      </div>

      {/* PREVIEW */}

      <div className="mt-6 rounded-[30px] bg-gradient-to-r from-[var(--primary-color)] to-[var(--primary-color)] p-6">

        <h2 className="text-3xl font-black">
          Support Preview
        </h2>

        <p className="mt-2 text-[var(--button-text-color)]/80">
          Customer support information
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4">

          <div className="rounded-2xl bg-[var(--card-color)]/10 p-4">

            <p className="text-sm">
              Email
            </p>

            <h3 className="mt-2 text-lg font-black break-all">
              {email}
            </h3>

          </div>

          <div className="rounded-2xl bg-[var(--card-color)]/10 p-4">

            <p className="text-sm">
              Phone
            </p>

            <h3 className="mt-2 text-lg font-black">
              {phone}
            </h3>

          </div>

          <div className="rounded-2xl bg-[var(--card-color)]/10 p-4">

            <p className="text-sm">
              WhatsApp
            </p>

            <h3 className="mt-2 text-lg font-black">
              {whatsapp}
            </h3>

          </div>

        </div>

      </div>

    </main>

  );
}
