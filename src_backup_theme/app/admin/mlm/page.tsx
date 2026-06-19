"use client";

import { useEffect, useState } from "react";

import {
  collection,
  getDocs
} from "firebase/firestore";

import {
  BadgeIndianRupee,
  Crown,
  ShieldCheck,
  Users,
  Wallet
} from "lucide-react";

import { db } from "@/firebase/config";

interface MLMMember {

  id: string;

  name?: string;

  phone?: string;

  referralCode?: string;

}

export default function AdminMLMPage() {

  const [members, setMembers] =
    useState<MLMMember[]>([]);

  const [loading, setLoading] =
    useState(true);

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
          py-4
          shadow-sm
        "
      >

        <h1 className="text-[28px] font-black text-violet-700">

          MLM Admin Panel

        </h1>

        <p className="text-[12px] text-gray-500">

          Manage MLM Members & Earnings

        </p>

      </div>

      {/* HERO */}

      <section className="px-4 pt-5">

        <div
          className="
            rounded-[32px]
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

            MLM Control
            <br />
            Center 👑

          </h2>

          <p className="mt-3 text-[13px] leading-6 text-white/90">

            Members, withdrawals,
            earnings aur MLM activity
            yahan manage kar sakte ho.

          </p>

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

            <h3 className="mt-3 text-[26px] font-black">

              {members.length}

            </h3>

            <p className="text-[12px] text-gray-500">

              MLM Members

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

            <h3 className="mt-3 text-[26px] font-black">

              ₹2.4L

            </h3>

            <p className="text-[12px] text-gray-500">

              Total Payout

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

            <h3 className="mt-3 text-[26px] font-black">

              ₹48K

            </h3>

            <p className="text-[12px] text-gray-500">

              Pending Withdraw

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
              className="text-pink-600"
            />

            <h3 className="mt-3 text-[26px] font-black">

              18

            </h3>

            <p className="text-[12px] text-gray-500">

              Active Leaders

            </p>

          </div>

        </div>

      </section>

      {/* MEMBER LIST */}

      <section className="mt-6 px-4">

        <div
          className="
            rounded-[30px]
            bg-white
            p-5
            shadow-sm
          "
        >

          <h2 className="text-[22px] font-black">

            MLM Members

          </h2>

          <div className="mt-5 space-y-4">

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
                      rounded-2xl
                      bg-gray-50
                      p-4
                    "
                  >

                    <div className="flex items-center justify-between">

                      <div>

                        <h3 className="text-[15px] font-black">

                          {member.name}

                        </h3>

                        <p className="mt-1 text-[11px] text-gray-500">

                          {member.phone}

                        </p>

                        <p className="mt-1 text-[10px] text-violet-700 font-bold">

                          {member.referralCode}

                        </p>

                      </div>

                      <div className="flex gap-2">

                        <button
                          className="
                            rounded-xl
                            bg-green-600
                            px-3
                            py-2
                            text-[11px]
                            font-black
                            text-white
                          "
                        >

                          Approve

                        </button>

                        <button
                          className="
                            rounded-xl
                            bg-red-500
                            px-3
                            py-2
                            text-[11px]
                            font-black
                            text-white
                          "
                        >

                          Block

                        </button>

                      </div>

                    </div>

                  </div>

                )
              )

            )}

          </div>

        </div>

      </section>

    </main>

  );

}
