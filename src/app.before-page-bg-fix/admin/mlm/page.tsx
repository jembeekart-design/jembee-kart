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

    <main className="min-h-screen bg-[var(--primary-color)] pb-24">

      {/* HEADER */}

      <div
        className="
          sticky
          top-0
          z-50
          bg-[var(--card-color)]
          px-4
          py-4
          shadow-sm
        "
      >

        <h1 className="text-[28px] font-black text-[var(--primary-color)]">

          MLM Admin Panel

        </h1>

        <p className="text-[12px] text-[var(--muted-text-color)]">

          Manage MLM Members & Earnings

        </p>

      </div>

      {/* HERO */}

      <section className="px-4 pt-5">

        <div
          className="
            rounded-[32px]
            bg-gradient-to-br
            from-[var(--primary-color)]
            via-[var(--primary-color)]
            to-[var(--primary-color)]
            p-5
            text-[var(--button-text-color)]
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
              bg-[var(--card-color)]/20
            "
          >

            <Crown size={34} />

          </div>

          <h2 className="mt-5 text-[32px] font-black leading-[38px]">

            MLM Control
            <br />
            Center 👑

          </h2>

          <p className="mt-3 text-[13px] leading-6 text-[var(--button-text-color)]/90">

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
              bg-[var(--card-color)]
              p-4
              shadow-sm
            "
          >

            <Users
              size={28}
              className="text-[var(--primary-color)]"
            />

            <h3 className="mt-3 text-[26px] font-black">

              {members.length}

            </h3>

            <p className="text-[12px] text-[var(--muted-text-color)]">

              MLM Members

            </p>

          </div>

          <div
            className="
              rounded-2xl
              bg-[var(--card-color)]
              p-4
              shadow-sm
            "
          >

            <Wallet
              size={28}
              className="text-[var(--success-color)]"
            />

            <h3 className="mt-3 text-[26px] font-black">

              ₹2.4L

            </h3>

            <p className="text-[12px] text-[var(--muted-text-color)]">

              Total Payout

            </p>

          </div>

          <div
            className="
              rounded-2xl
              bg-[var(--card-color)]
              p-4
              shadow-sm
            "
          >

            <BadgeIndianRupee
              size={28}
              className="text-[var(--warning-color)]"
            />

            <h3 className="mt-3 text-[26px] font-black">

              ₹48K

            </h3>

            <p className="text-[12px] text-[var(--muted-text-color)]">

              Pending Withdraw

            </p>

          </div>

          <div
            className="
              rounded-2xl
              bg-[var(--card-color)]
              p-4
              shadow-sm
            "
          >

            <ShieldCheck
              size={28}
              className="text-[var(--primary-color)]"
            />

            <h3 className="mt-3 text-[26px] font-black">

              18

            </h3>

            <p className="text-[12px] text-[var(--muted-text-color)]">

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
            bg-[var(--card-color)]
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
                      bg-[var(--background-color)]
                      p-4
                    "
                  >

                    <div className="flex items-center justify-between">

                      <div>

                        <h3 className="text-[15px] font-black">

                          {member.name}

                        </h3>

                        <p className="mt-1 text-[11px] text-[var(--muted-text-color)]">

                          {member.phone}

                        </p>

                        <p className="mt-1 text-[10px] text-[var(--primary-color)] font-bold">

                          {member.referralCode}

                        </p>

                      </div>

                      <div className="flex gap-2">

                        <button
                          className="
                            rounded-xl
                            bg-[var(--success-color)]
                            px-3
                            py-2
                            text-[11px]
                            font-black
                            text-[var(--button-text-color)]
                          "
                        >

                          Approve

                        </button>

                        <button
                          className="
                            rounded-xl
                            bg-[var(--danger-color)]
                            px-3
                            py-2
                            text-[11px]
                            font-black
                            text-[var(--button-text-color)]
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
