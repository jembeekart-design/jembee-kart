/* ======================================================
FILE:
src/app/affiliate/page.tsx

FEATURES:

✅ Affiliate Dashboard
✅ Referral Link Box
✅ Copy Referral Link
✅ Total Earnings Card
✅ Referral Count
✅ Commission Wallet
✅ Withdraw Button
✅ Referral Team List
✅ Responsive Mobile UI
✅ Gradient Cards
✅ Firebase Ready
✅ Bottom Navbar
✅ WhatsApp Button
====================================================== */

"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";

import {
  Copy,
  Gift,
  IndianRupee,
  Share2,
  Trophy,
  Users,
  Wallet
} from "lucide-react";

import Header from "@/components/navigation/Header";

import BottomNavbar from "@/components/navigation/BottomNavbar";

import WhatsAppButton from "@/components/navigation/WhatsAppButton";

/* ======================================================
TYPES
====================================================== */

interface ReferralMember {

  id: string;

  name: string;

  joinedDate: string;

  earnings: number;

  avatar: string;
}

/* ======================================================
COMPONENT
====================================================== */

export default function AffiliatePage() {

  /* ======================================================
  USER DATA
  ====================================================== */

  const referralCode =
    "JEMBEE2026";

  const referralLink =
    `https://jembeekart.com/register?ref=${referralCode}`;

  /* ======================================================
  STATES
  ====================================================== */

  const [
    copied,
    setCopied
  ] = useState(false);

  const [
    teamMembers
  ] = useState<ReferralMember[]>([

    {
      id: "1",

      name:
        "Rahul Kumar",

      joinedDate:
        "12 Jun 2026",

      earnings: 1200,

      avatar:
        "https://placehold.co/100x100"
    },

    {
      id: "2",

      name:
        "Aman Singh",

      joinedDate:
        "20 Jun 2026",

      earnings: 850,

      avatar:
        "https://placehold.co/100x100"
    },

    {
      id: "3",

      name:
        "Priya Das",

      joinedDate:
        "25 Jun 2026",

      earnings: 1450,

      avatar:
        "https://placehold.co/100x100"
    }

  ]);

  /* ======================================================
  COPY LINK
  ====================================================== */

  async function copyLink() {

    try {

      await navigator.clipboard.writeText(
        referralLink
      );

      setCopied(
        true
      );

      setTimeout(() => {

        setCopied(
          false
        );

      }, 2000);

    } catch {

      alert(
        "Copy failed"
      );
    }
  }

  /* ======================================================
  SHARE LINK
  ====================================================== */

  async function shareLink() {

    if (
      navigator.share
    ) {

      await navigator.share({

        title:
          "Join JembeeKart",

        text:
          "Join using my referral link",

        url:
          referralLink
      });

    } else {

      copyLink();
    }
  }

  /* ======================================================
  UI
  ====================================================== */

  return (

    <main
      className="
        min-h-screen
        overflow-x-hidden
        bg-[#f6f7fb]
        pb-32
        pt-[115px]

        md:pt-[150px]
      "
    >

      {/* ======================================================
      HEADER
      ====================================================== */}

      <Header />

      {/* ======================================================
      TOP SECTION
      ====================================================== */}

      <section
        className="
          px-4
          pt-4
        "
      >

        <div
          className="
            overflow-hidden
            rounded-[35px]
            bg-gradient-to-br
            from-indigo-600
            via-purple-600
            to-pink-500

            p-6
            text-white
            shadow-2xl
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
                  font-semibold
                  text-white/80
                "
              >

                Affiliate Wallet

              </p>

              <h1
                className="
                  mt-2
                  text-4xl
                  font-black
                "
              >

                ₹12,580

              </h1>

            </div>

            <div
              className="
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-full
                bg-white/20
                backdrop-blur-md
              "
            >

              <Wallet
                size={30}
              />

            </div>

          </div>

          {/* BUTTON */}

          <button
            className="
              mt-6
              w-full
              rounded-2xl
              bg-white
              py-4
              text-sm
              font-black
              text-black
              transition-all
              duration-300

              hover:scale-[1.02]
            "
          >

            Withdraw Earnings

          </button>

        </div>

      </section>

      {/* ======================================================
      STATS
      ====================================================== */}

      <section
        className="
          mt-6
          grid
          grid-cols-2
          gap-4
          px-4
        "
      >

        {/* REFERRALS */}

        <div
          className="
            rounded-[30px]
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
              bg-indigo-100
              text-indigo-600
            "
          >

            <Users
              size={26}
            />

          </div>

          <h2
            className="
              mt-4
              text-3xl
              font-black
              text-black
            "
          >

            128

          </h2>

          <p
            className="
              mt-1
              text-sm
              font-semibold
              text-gray-500
            "
          >

            Total Referrals

          </p>

        </div>

        {/* COMMISSION */}

        <div
          className="
            rounded-[30px]
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
              bg-pink-100
              text-pink-600
            "
          >

            <Gift
              size={26}
            />

          </div>

          <h2
            className="
              mt-4
              text-3xl
              font-black
              text-black
            "
          >

            ₹8.5K

          </h2>

          <p
            className="
              mt-1
              text-sm
              font-semibold
              text-gray-500
            "
          >

            Monthly Commission

          </p>

        </div>

      </section>

      {/* ======================================================
      REFERRAL LINK
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
            p-5
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
                rounded-2xl
                bg-indigo-100
                text-indigo-600
              "
            >

              <Share2
                size={26}
              />

            </div>

            <div>

              <h2
                className="
                  text-xl
                  font-black
                  text-black
                "
              >

                Referral Link

              </h2>

              <p
                className="
                  text-sm
                  text-gray-500
                "
              >

                Share & earn commission

              </p>

            </div>

          </div>

          {/* LINK BOX */}

          <div
            className="
              mt-5
              overflow-hidden
              rounded-2xl
              bg-gray-100
              p-4
            "
          >

            <p
              className="
                break-all
                text-sm
                font-semibold
                text-gray-700
              "
            >

              {referralLink}

            </p>

          </div>

          {/* BUTTONS */}

          <div
            className="
              mt-5
              flex
              gap-3
            "
          >

            <button

              onClick={
                copyLink
              }

              className="
                flex
                flex-1
                items-center
                justify-center
                gap-2

                rounded-2xl
                bg-black
                py-4

                text-sm
                font-black
                text-white
              "
            >

              <Copy
                size={18}
              />

              {
                copied

                  ? "Copied"

                  : "Copy"
              }

            </button>

            <button

              onClick={
                shareLink
              }

              className="
                flex
                flex-1
                items-center
                justify-center
                gap-2

                rounded-2xl
                bg-gradient-to-r
                from-indigo-600
                to-purple-600

                py-4

                text-sm
                font-black
                text-white
              "
            >

              <Share2
                size={18}
              />

              Share

            </button>

          </div>

        </div>

      </section>

      {/* ======================================================
      TEAM MEMBERS
      ====================================================== */}

      <section
        className="
          mt-6
          px-4
        "
      >

        <div
          className="
            mb-5
            flex
            items-center
            justify-between
          "
        >

          <div>

            <h2
              className="
                text-2xl
                font-black
                text-black
              "
            >

              Referral Team

            </h2>

            <p
              className="
                mt-1
                text-sm
                text-gray-500
              "
            >

              Your active members

            </p>

          </div>

          <div
            className="
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-2xl
              bg-yellow-100
              text-yellow-600
            "
          >

            <Trophy
              size={22}
            />

          </div>

        </div>

        {/* MEMBERS */}

        <div
          className="
            space-y-4
          "
        >

          {teamMembers.map(
            (member) => {

              return (

                <div
                  key={
                    member.id
                  }

                  className="
                    flex
                    items-center
                    justify-between

                    rounded-[28px]
                    bg-white
                    p-4
                    shadow-sm
                  "
                >

                  {/* LEFT */}

                  <div
                    className="
                      flex
                      items-center
                      gap-4
                    "
                  >

                    <img
                      src={
                        member.avatar
                      }

                      alt=""

                      className="
                        h-16
                        w-16
                        rounded-2xl
                        object-cover
                      "
                    />

                    <div>

                      <h3
                        className="
                          text-lg
                          font-black
                          text-black
                        "
                      >

                        {
                          member.name
                        }

                      </h3>

                      <p
                        className="
                          mt-1
                          text-sm
                          text-gray-500
                        "
                      >

                        Joined
                        {" "}
                        {
                          member.joinedDate
                        }

                      </p>

                    </div>

                  </div>

                  {/* RIGHT */}

                  <div
                    className="
                      text-right
                    "
                  >

                    <p
                      className="
                        text-2xl
                        font-black
                        text-indigo-600
                      "
                    >

                      ₹
                      {
                        member.earnings
                      }

                    </p>

                    <p
                      className="
                        text-xs
                        font-semibold
                        text-gray-500
                      "
                    >

                      Earnings

                    </p>

                  </div>

                </div>

              );

            }
          )}

        </div>

      </section>

      {/* ======================================================
      FLOATING BUTTONS
      ====================================================== */}

      <WhatsAppButton />

      <BottomNavbar />

    </main>

  );

}
