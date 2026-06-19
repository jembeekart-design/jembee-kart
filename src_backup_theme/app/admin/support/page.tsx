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

    <main className="min-h-screen bg-[#0b0b0b] p-4 text-white">

      {/* HEADER */}

      <div className="mb-8 flex items-center justify-between">

        <div className="flex items-center gap-4">

          <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-emerald-500">

            <Headphones size={30} />

          </div>

          <div>

            <h1 className="text-3xl font-black">
              Support Settings
            </h1>

            <p className="mt-1 text-sm text-gray-400">
              Manage support contacts
            </p>

          </div>

        </div>

        <button
          className="flex items-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-bold"
        >

          <Save size={18} />

          Save Settings

        </button>

      </div>

      {/* SUPPORT FORM */}

      <div className="space-y-5">

        <div className="rounded-[30px] bg-[#151515] p-5">

          <div className="mb-5 flex items-center gap-3">

            <Mail
              size={24}
              className="text-blue-400"
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
            className="w-full rounded-2xl border border-white/10 bg-black px-4 py-4 outline-none"
          />

        </div>

        <div className="rounded-[30px] bg-[#151515] p-5">

          <div className="mb-5 flex items-center gap-3">

            <Phone
              size={24}
              className="text-yellow-400"
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
            className="w-full rounded-2xl border border-white/10 bg-black px-4 py-4 outline-none"
          />

        </div>

        <div className="rounded-[30px] bg-[#151515] p-5">

          <div className="mb-5 flex items-center gap-3">

            <MessageCircle
              size={24}
              className="text-green-400"
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
            className="w-full rounded-2xl border border-white/10 bg-black px-4 py-4 outline-none"
          />

        </div>

      </div>

      {/* PREVIEW */}

      <div className="mt-6 rounded-[30px] bg-gradient-to-r from-emerald-500 to-green-600 p-6">

        <h2 className="text-3xl font-black">
          Support Preview
        </h2>

        <p className="mt-2 text-white/80">
          Customer support information
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4">

          <div className="rounded-2xl bg-white/10 p-4">

            <p className="text-sm">
              Email
            </p>

            <h3 className="mt-2 text-lg font-black break-all">
              {email}
            </h3>

          </div>

          <div className="rounded-2xl bg-white/10 p-4">

            <p className="text-sm">
              Phone
            </p>

            <h3 className="mt-2 text-lg font-black">
              {phone}
            </h3>

          </div>

          <div className="rounded-2xl bg-white/10 p-4">

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
