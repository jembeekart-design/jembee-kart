"use client";

import { useEffect, useState } from "react";

import {
  collection,
  getDocs
} from "firebase/firestore";

import {
  BadgeIndianRupee,
  Copy,
  Crown,
  Gift,
  Users,
  Wallet
} from "lucide-react";

import { db } from "@/firebase/config";

interface MLMMember {

  id: string;

  name?: string;

  referralCode?: string;

  referralLink?: string;

}

export default function MLMDashboardPage() {

  const [members, setMembers] =
    useState<MLMMember[]>([]);

  const [loading, setLoading] =
    useState(true);

  const userName =
    "MD Alim Ansari";

  const referralCode =
    "mdalim1234";

  const referralLink =
    `https://jembeekart.com/register?ref=${referralCode}`;

  useEffect(() => {

    async function fetchMembers() {

      try {

        const snapshot =
          await getDocs(
            collection(
              db,
              "mlm_members"
            )
          );

        const data =
          snapshot.docs.map(
            (doc) => ({
              id: doc.id,
              ...doc.data()
            })
          );

        setMembers(
          data as MLMMember[]
        );

      } catch (error) {

        console.error(error);

      } finally {

        setLoading(false);

      }

    }

    fetchMembers();

  }, []);

  async function copyReferral() {

    try {

      await navigator.clipboard.writeText(
        `${userName}\n${referralLink}`
      );

      alert(
        "Referral Copied"
      );

    } catch (error) {

      console.error(error);

    }

  }

  return (

    <main className="min-h-screen bg-[#f6f6f6] pb-28">

      {/* HEADER */}

      <div
        className="
          sticky
          top-0
          z-50
          bg-white
          px-4
          py-4
          shadow-sm
        "
      >

        <h1 className="text-[26px] font-black text-violet-700">

          MLM Dashboard

        </h1>

        <p className="text-[12px] text-gray-500">

          Welcome back, {userName}

        </p>

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

          <h2 className="mt-5 text-[30px] font-black">

            ₹12,450

          </h2>

          <p className="mt-1 text-[13px] text-white/85">

            Total MLM Earnings

          </p>

          <button
            onClick={copyReferral}
            className="
              mt-5
              flex
              items-center
              gap-2
              rounded-2xl
              bg-white
              px-5
              py-3
              text-[14px]
              font-black
              text-violet-700
            "
          >

            <Copy size={18} />

            Copy Referral

          </button>

        </div>

      </section>

      {/* STATS */}

      <section className="mt-6 px-4">

        <div className="grid grid-cols-2 gap-3">

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
              className="text-violet-700"
            />

            <h3 className="mt-3 text-[24px] font-black">

              {members.length}

            </h3>

            <p className="text-[12px] text-gray-500">

              Total Team

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

            <Wallet
              size={28}
              className="text-green-600"
            />

            <h3 className="mt-3 text-[24px] font-black">

              ₹4,520

            </h3>

            <p className="text-[12px] text-gray-500">

              Wallet Balance

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

            <Gift
              size={28}
              className="text-pink-600"
            />

            <h3 className="mt-3 text-[24px] font-black">

              18

            </h3>

            <p className="text-[12px] text-gray-500">

              Active Referrals

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

            <h3 className="mt-3 text-[24px] font-black">

              ₹820

            </h3>

            <p className="text-[12px] text-gray-500">

              Today's Income

            </p>

          </div>

        </div>

      </section>

      {/* REFERRAL CARD */}

      <section className="mt-6 px-4">

        <div
          className="
            rounded-[28px]
            bg-white
            p-5
            shadow-sm
          "
        >

          <h2 className="text-[20px] font-black">

            Your Referral Link

          </h2>

          <div
            className="
              mt-4
              rounded-2xl
              bg-gray-100
              p-4
              text-[12px]
              break-all
            "
          >

            {referralLink}

          </div>

          <button
            onClick={copyReferral}
            className="
              mt-4
              w-full
              rounded-2xl
              bg-violet-700
              py-3
              text-[14px]
              font-black
              text-white
            "
          >

            Copy Link

          </button>

        </div>

      </section>

      {/* RECENT JOINS */}

      <section className="mt-6 px-4">

        <div
          className="
            rounded-[28px]
            bg-white
            p-5
            shadow-sm
          "
        >

          <h2 className="text-[20px] font-black">

            Recent Team Joins

          </h2>

          <div className="mt-4 space-y-3">

            {loading ? (

              <p className="text-sm">

                Loading...

              </p>

            ) : (

              members.map(
                (member) => (

                  <div
                    key={member.id}
                    className="
                      flex
                      items-center
                      justify-between
                      rounded-2xl
                      bg-gray-50
                      p-3
                    "
                  >

                    <div>

                      <h3 className="text-[14px] font-black">

                        {member.name}

                      </h3>

                      <p className="text-[11px] text-gray-500">

                        Joined MLM

                      </p>

                    </div>

                    <div
                      className="
                        rounded-full
                        bg-green-100
                        px-3
                        py-1
                        text-[11px]
                        font-black
                        text-green-700
                      "
                    >

                      Active

                    </div>

                  </div>

                )
              )

            )}

          </div>

        </div>

      </section>

      {/* FIXED BUTTON */}

      <div
        className="
          fixed
          bottom-0
          left-0
          w-full
          border-t
          bg-white
          p-3
        "
      >

        <button
          className="
            w-full
            rounded-2xl
            bg-gradient-to-r
            from-violet-700
            to-fuchsia-600
            py-3
            text-[15px]
            font-black
            text-white
            shadow-lg
          "
        >

          Withdraw Earnings

        </button>

      </div>

    </main>

  );

}
