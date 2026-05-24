"use client";

import Link from "next/link";

import {
  ArrowLeft,
  BadgeIndianRupee,
  CheckCircle2,
  Copy,
  Crown,
  Gift,
  ShieldCheck,
  Users
} from "lucide-react";

export default function MLMPage() {

  const referralName =
    "MD Alim Ansari";

  const referralLink =
    `https://jembeekart.com/register?ref=${encodeURIComponent(
      referralName
    )}`;

  async function copyReferral() {

    try {

      await navigator.clipboard.writeText(
        `${referralName}\n${referralLink}`
      );

      alert(
        "Name & Referral Link Copied"
      );

    } catch (error) {

      console.error(error);

    }

  }

  return (

    <main className="min-h-screen bg-[#f6f6f6] pb-24">

      {/* HEADER */}

      <div
        className="
          sticky
          top-0
          z-50
          bg-white/90
          backdrop-blur-md
          px-4
          py-3
          shadow-sm
        "
      >

        <div className="flex items-center gap-3">

          <Link
            href="/"
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

            <h1 className="text-[22px] font-black text-violet-700">

              MLM Income

            </h1>

            <p className="text-[11px] text-gray-500">

              Build Team & Earn Money

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

            <Crown size={34} />

          </div>

          <h2 className="mt-5 text-[32px] font-black leading-[38px]">

            Earn Money
            <br />
            From Your Network 🚀

          </h2>

          <p className="mt-4 text-[13px] leading-6 text-white/90">

            MLM system me aap logon ko
            join karte ho aur jab wo
            shopping ya earning karte
            hain tab aapko commission
            milta hai.

          </p>

          {/* REFERRAL */}

          <div
            className="
              mt-5
              rounded-2xl
              bg-white/10
              p-4
              backdrop-blur-md
            "
          >

            <p className="text-[11px] text-white/80">

              Your Referral Name

            </p>

            <h3 className="mt-1 text-[18px] font-black">

              {referralName}

            </h3>

            <div
              className="
                mt-4
                rounded-xl
                bg-white/10
                p-3
                text-[11px]
                break-all
              "
            >

              {referralLink}

            </div>

            <button
              onClick={copyReferral}
              className="
                mt-4
                flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-2xl
                bg-white
                py-3
                text-[14px]
                font-black
                text-violet-700
              "
            >

              <Copy size={18} />

              Copy Name & Referral Link

            </button>

          </div>

        </div>

      </section>

      {/* HOW IT WORKS */}

      <section className="mt-6 px-4">

        <h2 className="text-[24px] font-black text-black">

          Kaise Kaam Karta Hai?

        </h2>

        <div className="mt-4 space-y-3">

          <div
            className="
              rounded-2xl
              bg-white
              p-4
              shadow-sm
            "
          >

            <div className="flex items-center gap-3">

              <div
                className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-full
                  bg-violet-100
                  text-violet-700
                "
              >

                <Users size={22} />

              </div>

              <div>

                <h3 className="text-[16px] font-black">

                  1. People Join

                </h3>

                <p className="text-[12px] text-gray-600">

                  Aap apne referral link se
                  logon ko join karte ho.

                </p>

              </div>

            </div>

          </div>

          <div
            className="
              rounded-2xl
              bg-white
              p-4
              shadow-sm
            "
          >

            <div className="flex items-center gap-3">

              <div
                className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-full
                  bg-green-100
                  text-green-700
                "
              >

                <Gift size={22} />

              </div>

              <div>

                <h3 className="text-[16px] font-black">

                  2. Team Grows

                </h3>

                <p className="text-[12px] text-gray-600">

                  Jab wo dusre logon ko
                  join karte hain tab
                  aapki team grow hoti hai.

                </p>

              </div>

            </div>

          </div>

          <div
            className="
              rounded-2xl
              bg-white
              p-4
              shadow-sm
            "
          >

            <div className="flex items-center gap-3">

              <div
                className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-full
                  bg-orange-100
                  text-orange-700
                "
              >

                <BadgeIndianRupee size={22} />

              </div>

              <div>

                <h3 className="text-[16px] font-black">

                  3. Earn Commission

                </h3>

                <p className="text-[12px] text-gray-600">

                  Har order aur referral se
                  aapko commission milta hai.

                </p>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* BENEFITS */}

      <section className="mt-7 px-4">

        <h2 className="text-[24px] font-black">

          MLM Benefits

        </h2>

        <div className="mt-4 grid grid-cols-2 gap-3">

          <div
            className="
              rounded-2xl
              bg-white
              p-4
              shadow-sm
            "
          >

            <CheckCircle2
              size={28}
              className="text-violet-700"
            />

            <h3 className="mt-3 text-[15px] font-black">

              Passive Income

            </h3>

            <p className="mt-1 text-[11px] text-gray-600">

              Team se automatic earning.

            </p>

          </div>

          <div
            className="
              rounded-2xl
              bg-white
              p-4
              shadow-sm
            "
          >

            <Users
              size={28}
              className="text-fuchsia-600"
            />

            <h3 className="mt-3 text-[15px] font-black">

              Unlimited Team

            </h3>

            <p className="mt-1 text-[11px] text-gray-600">

              Jitni badi team utni earning.

            </p>

          </div>

          <div
            className="
              rounded-2xl
              bg-white
              p-4
              shadow-sm
            "
          >

            <ShieldCheck
              size={28}
              className="text-green-600"
            />

            <h3 className="mt-3 text-[15px] font-black">

              Secure System

            </h3>

            <p className="mt-1 text-[11px] text-gray-600">

              Safe & transparent income.

            </p>

          </div>

          <div
            className="
              rounded-2xl
              bg-white
              p-4
              shadow-sm
            "
          >

            <BadgeIndianRupee
              size={28}
              className="text-orange-600"
            />

            <h3 className="mt-3 text-[15px] font-black">

              Daily Earnings

            </h3>

            <p className="mt-1 text-[11px] text-gray-600">

              Roz commission earn karo.

            </p>

          </div>

        </div>

      </section>

    </main>

  );

}
