/* ======================================================
FILE:
src/app/affiliate/page.tsx

UPDATED:

✅ User MLM Dashboard
✅ Referral Copy
✅ Team Stats
✅ Total Earnings
✅ Withdrawal Card
✅ Referral List
✅ Modern Gradient UI
✅ Mobile Responsive
✅ Bottom Navbar
✅ WhatsApp Button
====================================================== */

"use client";

export const dynamic = "force-dynamic";

import {
  useMemo,
  useState
} from "react";

import Link from "next/link";

import {
  ArrowLeft,
  BadgeIndianRupee,
  CheckCircle2,
  Copy,
  Crown,
  Gift,
  ShieldCheck,
  Users,
  Wallet,
  Zap
} from "lucide-react";

import BottomNavbar
from "@/components/navigation/BottomNavbar";

import WhatsAppButton
from "@/components/navigation/WhatsAppButton";

/* ======================================================
COMPONENT
====================================================== */

export default function AffiliatePage() {

  /* ======================================================
  USER DATA
  ====================================================== */

  const userName =
    "MD Alim Ansari";

  const referralCode =
    "ALIM7061";

  const referralLink =
    `https://jembeekart.com/register?ref=${referralCode}`;

  /* ======================================================
  MLM DATA
  ====================================================== */

  const totalTeam =
    128;

  const activeMembers =
    92;

  const totalIncome =
    25840;

  const todayIncome =
    1280;

  const withdrawable =
    12450;

  /* ======================================================
  TEAM LIST
  ====================================================== */

  const teamMembers = [

    {
      name:
        "Rahul Kumar",

      joined:
        "2 days ago",

      income:
        520
    },

    {
      name:
        "Aman Raj",

      joined:
        "5 days ago",

      income:
        840
    },

    {
      name:
        "Shivam",

      joined:
        "1 week ago",

      income:
        1250
    }

  ];

  /* ======================================================
  COPY LINK
  ====================================================== */

  async function copyReferral() {

    try {

      await navigator.clipboard.writeText(
        `${userName}

Referral Code:
${referralCode}

Referral Link:
${referralLink}`
      );

      alert(
        "Referral Details Copied"
      );

    } catch (error) {

      console.error(error);
    }
  }

  /* ======================================================
  UI
  ====================================================== */

  return (

    <main
      className="
        min-h-screen
        bg-[#f6f7fb]
        pb-32
      "
    >

      {/* ======================================================
      HEADER
      ====================================================== */}

      <div
        className="
          sticky
          top-0
          z-50

          bg-white/90
          px-4
          py-3

          backdrop-blur-md
          shadow-sm
        "
      >

        <div
          className="
            flex
            items-center
            gap-3
          "
        >

          <Link
            href="/account"
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

            <ArrowLeft
              size={20}
            />

          </Link>

          <div>

            <h1
              className="
                text-[24px]
                font-black
                text-violet-700
              "
            >

              Affiliate Dashboard

            </h1>

            <p
              className="
                text-[11px]
                text-gray-500
              "
            >

              Build Team & Earn Money

            </p>

          </div>

        </div>

      </div>

      {/* ======================================================
      HERO CARD
      ====================================================== */}

      <section
        className="
          px-4
          pt-5
        "
      >

        <div
          className="
            overflow-hidden

            rounded-[35px]

            bg-gradient-to-br
            from-violet-700
            via-fuchsia-600
            to-orange-500

            p-5

            text-white

            shadow-2xl
          "
        >

          {/* TOP */}

          <div
            className="
              flex
              items-center
              justify-between
            "
          >

            <div>

              <p
                className="
                  text-[12px]
                  text-white/80
                "
              >

                Total Earnings

              </p>

              <h2
                className="
                  mt-2
                  text-[38px]
                  font-black
                "
              >

                ₹
                {totalIncome}

              </h2>

            </div>

            <div
              className="
                flex
                h-20
                w-20
                items-center
                justify-center

                rounded-full

                bg-white/20
              "
            >

              <Crown
                size={38}
              />

            </div>

          </div>

          {/* TODAY */}

          <div
            className="
              mt-5
              flex
              items-center
              gap-2
            "
          >

            <Zap
              size={16}
            />

            <p
              className="
                text-sm
                font-bold
              "
            >

              Today Income:
              {" "}
              ₹{todayIncome}

            </p>

          </div>

          {/* REFERRAL */}

          <div
            className="
              mt-5

              rounded-3xl

              bg-white/10

              p-4

              backdrop-blur-md
            "
          >

            <p
              className="
                text-[11px]
                text-white/80
              "
            >

              Referral Code

            </p>

            <h3
              className="
                mt-1
                text-[22px]
                font-black
              "
            >

              {referralCode}

            </h3>

            <div
              className="
                mt-4

                rounded-2xl

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

                text-sm
                font-black
                text-violet-700
              "
            >

              <Copy
                size={18}
              />

              Copy Referral Link

            </button>

          </div>

        </div>

      </section>

      {/* ======================================================
      STATS
      ====================================================== */}

      <section
        className="
          mt-6
          px-4
        "
      >

        <div
          className="
            grid
            grid-cols-2
            gap-4
          "
        >

          {/* TEAM */}

          <div
            className="
              rounded-[28px]
              bg-white
              p-5
              shadow-sm
            "
          >

            <div
              className="
                flex
                h-14
                w-14
                items-center
                justify-center

                rounded-2xl

                bg-violet-100
                text-violet-700
              "
            >

              <Users
                size={28}
              />

            </div>

            <h3
              className="
                mt-4
                text-[28px]
                font-black
              "
            >

              {totalTeam}

            </h3>

            <p
              className="
                mt-1
                text-sm
                text-gray-500
              "
            >

              Total Team

            </p>

          </div>

          {/* ACTIVE */}

          <div
            className="
              rounded-[28px]
              bg-white
              p-5
              shadow-sm
            "
          >

            <div
              className="
                flex
                h-14
                w-14
                items-center
                justify-center

                rounded-2xl

                bg-green-100
                text-green-700
              "
            >

              <CheckCircle2
                size={28}
              />

            </div>

            <h3
              className="
                mt-4
                text-[28px]
                font-black
              "
            >

              {activeMembers}

            </h3>

            <p
              className="
                mt-1
                text-sm
                text-gray-500
              "
            >

              Active Members

            </p>

          </div>

        </div>

      </section>

      {/* ======================================================
      WITHDRAW CARD
      ====================================================== */}

      <section
        className="
          mt-6
          px-4
        "
      >

        <div
          className="
            rounded-[35px]

            bg-white

            p-6

            shadow-sm
          "
        >

          <div
            className="
              flex
              items-center
              justify-between
            "
          >

            <div>

              <p
                className="
                  text-sm
                  text-gray-500
                "
              >

                Withdrawable Balance

              </p>

              <h2
                className="
                  mt-2
                  text-[36px]
                  font-black
                "
              >

                ₹
                {withdrawable}

              </h2>

            </div>

            <div
              className="
                flex
                h-16
                w-16
                items-center
                justify-center

                rounded-full

                bg-green-100
                text-green-700
              "
            >

              <Wallet
                size={30}
              />

            </div>

          </div>

          <button
            className="
              mt-6

              flex
              w-full
              items-center
              justify-center
              gap-2

              rounded-[20px]

              bg-gradient-to-r
              from-violet-600
              to-fuchsia-500

              py-4

              text-sm
              font-black
              text-white
            "
          >

            <BadgeIndianRupee
              size={18}
            />

            Withdraw Income

          </button>

        </div>

      </section>

      {/* ======================================================
      HOW IT WORKS
      ====================================================== */}

      <section
        className="
          mt-7
          px-4
        "
      >

        <h2
          className="
            text-[24px]
            font-black
          "
        >

          How It Works?

        </h2>

        <div
          className="
            mt-4
            space-y-3
          "
        >

          {/* STEP */}

          <div
            className="
              rounded-2xl
              bg-white
              p-4
              shadow-sm
            "
          >

            <div
              className="
                flex
                items-center
                gap-3
              "
            >

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

                <Users
                  size={22}
                />

              </div>

              <div>

                <h3
                  className="
                    text-[16px]
                    font-black
                  "
                >

                  Invite People

                </h3>

                <p
                  className="
                    text-[12px]
                    text-gray-600
                  "
                >

                  Share your referral link.

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

            <div
              className="
                flex
                items-center
                gap-3
              "
            >

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

                <Gift
                  size={22}
                />

              </div>

              <div>

                <h3
                  className="
                    text-[16px]
                    font-black
                  "
                >

                  Build Team

                </h3>

                <p
                  className="
                    text-[12px]
                    text-gray-600
                  "
                >

                  Grow your referral network.

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

            <div
              className="
                flex
                items-center
                gap-3
              "
            >

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

                <BadgeIndianRupee
                  size={22}
                />

              </div>

              <div>

                <h3
                  className="
                    text-[16px]
                    font-black
                  "
                >

                  Earn Commission

                </h3>

                <p
                  className="
                    text-[12px]
                    text-gray-600
                  "
                >

                  Earn from orders & referrals.

                </p>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* ======================================================
      TEAM MEMBERS
      ====================================================== */}

      <section
        className="
          mt-7
          px-4
        "
      >

        <div
          className="
            flex
            items-center
            justify-between
          "
        >

          <h2
            className="
              text-[24px]
              font-black
            "
          >

            My Team

          </h2>

          <button
            className="
              text-sm
              font-black
              text-violet-700
            "
          >

            View All

          </button>

        </div>

        <div
          className="
            mt-4
            space-y-3
          "
        >

          {teamMembers.map(
            (member) => (

              <div
                key={member.name}
                className="
                  flex
                  items-center
                  justify-between

                  rounded-[24px]

                  bg-white

                  p-4

                  shadow-sm
                "
              >

                <div
                  className="
                    flex
                    items-center
                    gap-3
                  "
                >

                  <div
                    className="
                      flex
                      h-14
                      w-14
                      items-center
                      justify-center

                      rounded-full

                      bg-gradient-to-r
                      from-violet-600
                      to-fuchsia-500

                      text-lg
                      font-black
                      text-white
                    "
                  >

                    {member.name.charAt(0)}

                  </div>

                  <div>

                    <h3
                      className="
                        text-[15px]
                        font-black
                      "
                    >

                      {member.name}

                    </h3>

                    <p
                      className="
                        text-[11px]
                        text-gray-500
                      "
                    >

                      Joined {member.joined}

                    </p>

                  </div>

                </div>

                <div
                  className="
                    text-right
                  "
                >

                  <p
                    className="
                      text-[11px]
                      text-gray-500
                    "
                  >

                    Income

                  </p>

                  <h3
                    className="
                      text-[18px]
                      font-black
                      text-green-600
                    "
                  >

                    ₹{member.income}

                  </h3>

                </div>

              </div>

            )
          )}

        </div>

      </section>

      {/* FLOATING */}

      <WhatsAppButton />

      <BottomNavbar />

    </main>

  );

}
