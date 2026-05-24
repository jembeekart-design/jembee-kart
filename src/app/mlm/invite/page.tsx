"use client";

import { useState } from "react";

import Link from "next/link";

import {
  ArrowLeft,
  Copy,
  Gift,
  QrCode,
  Send,
  Share2,
  Users
} from "lucide-react";

export default function MLMInvitePage() {

  const [copied, setCopied] =
    useState(false);

  const referralName =
    "MD Alim Ansari";

  const referralCode =
    "mdalim1234";

  const referralLink =
    `https://jembeekart.com/register?ref=${referralCode}`;

  async function copyReferral() {

    try {

      await navigator.clipboard.writeText(
        `${referralName}\n${referralLink}`
      );

      setCopied(true);

      setTimeout(() => {

        setCopied(false);

      }, 2000);

    } catch (error) {

      console.error(error);

    }

  }

  function shareWhatsApp() {

    const text =
      `Join JembeeKart MLM 🚀\n\n${referralName}\n${referralLink}`;

    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      "_blank"
    );

  }

  function shareTelegram() {

    const text =
      `Join JembeeKart MLM 🚀\n\n${referralName}\n${referralLink}`;

    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(
        referralLink
      )}&text=${encodeURIComponent(text)}`,
      "_blank"
    );

  }

  return (

    <main className="min-h-screen bg-[#f6f6f6] pb-24">

      {/* HEADER */}

      <div
        className="
          sticky
          top-0
          z-50
          bg-white
          px-4
          py-3
          shadow-sm
        "
      >

        <div className="flex items-center gap-3">

          <Link
            href="/mlm/dashboard"
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              bg-violet-100
              text-violet-700
            "
          >

            <ArrowLeft size={20} />

          </Link>

          <div>

            <h1 className="text-[24px] font-black text-violet-700">

              Invite & Earn

            </h1>

            <p className="text-[11px] text-gray-500">

              Share Referral Link

            </p>

          </div>

        </div>

      </div>

      {/* HERO */}

      <section className="px-4 pt-5">

        <div
          className="
            overflow-hidden
            rounded-[30px]
            bg-gradient-to-br
            from-violet-700
            via-fuchsia-600
            to-orange-500
            p-5
            text-white
            shadow-xl
          "
        >

          <div
            className="
              flex
              h-16
              w-16
              items-center
              justify-center
              rounded-full
              bg-white/20
            "
          >

            <Gift size={34} />

          </div>

          <h2 className="mt-5 text-[32px] font-black leading-[38px]">

            Invite Friends
            <br />
            Earn Money 🚀

          </h2>

          <p className="mt-3 text-[13px] leading-6 text-white/90">

            Referral link share karo,
            team build karo aur
            unlimited MLM earning
            start karo.

          </p>

        </div>

      </section>

      {/* REFERRAL */}

      <section className="mt-6 px-4">

        <div
          className="
            rounded-[30px]
            bg-white
            p-5
            shadow-sm
          "
        >

          <div className="flex items-center gap-3">

            <Users
              size={24}
              className="text-violet-700"
            />

            <h2 className="text-[22px] font-black">

              Your Referral

            </h2>

          </div>

          <div
            className="
              mt-5
              rounded-2xl
              bg-gray-100
              p-4
            "
          >

            <p className="text-[11px] text-gray-500">

              Referral Name

            </p>

            <h3 className="mt-1 text-[18px] font-black">

              {referralName}

            </h3>

            <div
              className="
                mt-4
                rounded-xl
                bg-white
                p-3
                text-[11px]
                break-all
              "
            >

              {referralLink}

            </div>

          </div>

          {/* COPY */}

          <button
            onClick={copyReferral}
            className="
              mt-5
              flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-2xl
              bg-violet-700
              py-3
              text-[14px]
              font-black
              text-white
            "
          >

            <Copy size={18} />

            {copied
              ? "Copied"
              : "Copy Referral"}

          </button>

        </div>

      </section>

      {/* SHARE OPTIONS */}

      <section className="mt-6 px-4">

        <div className="grid grid-cols-2 gap-3">

          {/* WHATSAPP */}

          <button
            onClick={shareWhatsApp}
            className="
              rounded-3xl
              bg-green-500
              p-5
              text-white
              shadow-lg
            "
          >

            <Share2 size={32} />

            <h3 className="mt-4 text-[18px] font-black">

              WhatsApp

            </h3>

            <p className="mt-1 text-[11px] text-white/90">

              Share instantly

            </p>

          </button>

          {/* TELEGRAM */}

          <button
            onClick={shareTelegram}
            className="
              rounded-3xl
              bg-sky-500
              p-5
              text-white
              shadow-lg
            "
          >

            <Send size={32} />

            <h3 className="mt-4 text-[18px] font-black">

              Telegram

            </h3>

            <p className="mt-1 text-[11px] text-white/90">

              Invite your network

            </p>

          </button>

        </div>

      </section>

      {/* QR */}

      <section className="mt-6 px-4">

        <div
          className="
            rounded-[30px]
            bg-white
            p-5
            text-center
            shadow-sm
          "
        >

          <div
            className="
              mx-auto
              flex
              h-20
              w-20
              items-center
              justify-center
              rounded-full
              bg-violet-100
              text-violet-700
            "
          >

            <QrCode size={40} />

          </div>

          <h2 className="mt-5 text-[22px] font-black">

            Referral QR Code

          </h2>

          <p className="mt-2 text-[12px] leading-6 text-gray-600">

            QR scan karke direct
            referral joining karao.

          </p>

          <div
            className="
              mt-5
              mx-auto
              flex
              h-52
              w-52
              items-center
              justify-center
              rounded-3xl
              border-4
              border-dashed
              border-violet-200
              bg-violet-50
            "
          >

            <QrCode
              size={120}
              className="text-violet-700"
            />

          </div>

        </div>

      </section>

    </main>

  );

}
