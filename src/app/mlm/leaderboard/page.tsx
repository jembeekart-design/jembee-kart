"use client";

import Link from "next/link";

import {
  ArrowLeft,
  Crown,
  Medal,
  Sparkles,
  Trophy,
  Users
} from "lucide-react";

export default function MLMLeaderboardPage() {

  const leaders = [

    {
      name: "MD Alim Ansari",
      earnings: 45200,
      team: 320,
      rank: 1
    },

    {
      name: "Rahul Kumar",
      earnings: 32100,
      team: 250,
      rank: 2
    },

    {
      name: "Sana Parveen",
      earnings: 28700,
      team: 210,
      rank: 3
    },

    {
      name: "Aman Ali",
      earnings: 19500,
      team: 160,
      rank: 4
    },

    {
      name: "Rohit Raj",
      earnings: 14200,
      team: 120,
      rank: 5
    }

  ];

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
              bg-[var(--warning-color)]
              text-[var(--warning-color)]
            "
          >

            <ArrowLeft size={20} />

          </Link>

          <div>

            <h1 className="text-[24px] font-black text-[var(--warning-color)]">

              Leaderboard

            </h1>

            <p className="text-[11px] text-[var(--muted-text-color)]">

              Top MLM Earners

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

            <Trophy size={34} />

          </div>

          <h2 className="mt-5 text-[32px] font-black leading-[38px]">

            Top MLM
            <br />
            Leaders 🏆

          </h2>

          <p className="mt-3 text-[13px] leading-6 text-[var(--button-text-color)]/90">

            Sabse jyada earning aur
            strongest network wale
            members yahan dikhte hain.

          </p>

        </div>

      </section>

      {/* TOP 3 */}

      <section className="mt-6 px-4">

        <div className="grid grid-cols-3 gap-3">

          {/* 2nd */}

          <div
            className="
              rounded-3xl
              bg-[var(--card-color)]
              p-4
              text-center
              shadow-sm
            "
          >

            <div
              className="
                mx-auto
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-full
                bg-[var(--card-color)]
                text-[var(--text-color)]
              "
            >

              <Medal size={26} />

            </div>

            <h3 className="mt-3 text-[13px] font-black">

              Rahul

            </h3>

            <p className="mt-1 text-[11px] text-[var(--muted-text-color)]">

              ₹32,100

            </p>

            <div
              className="
                mt-3
                rounded-full
                bg-[var(--background-color)]
                py-1
                text-[10px]
                font-black
              "
            >

              #2

            </div>

          </div>

          {/* 1st */}

          <div
            className="
              rounded-3xl
              bg-gradient-to-br
              from-[var(--primary-color)]
              to-[var(--primary-color)]
              p-4
              text-center
              text-[var(--button-text-color)]
              shadow-xl
            "
          >

            <div
              className="
                mx-auto
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-full
                bg-[var(--card-color)]/20
              "
            >

              <Crown size={30} />

            </div>

            <h3 className="mt-3 text-[14px] font-black">

              MD Alim

            </h3>

            <p className="mt-1 text-[11px] text-[var(--button-text-color)]/90">

              ₹45,200

            </p>

            <div
              className="
                mt-3
                rounded-full
                bg-[var(--card-color)]
                py-1
                text-[10px]
                font-black
                text-[var(--warning-color)]
              "
            >

              #1

            </div>

          </div>

          {/* 3rd */}

          <div
            className="
              rounded-3xl
              bg-[var(--card-color)]
              p-4
              text-center
              shadow-sm
            "
          >

            <div
              className="
                mx-auto
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-full
                bg-[var(--warning-color)]
                text-[var(--warning-color)]
              "
            >

              <Medal size={26} />

            </div>

            <h3 className="mt-3 text-[13px] font-black">

              Sana

            </h3>

            <p className="mt-1 text-[11px] text-[var(--muted-text-color)]">

              ₹28,700

            </p>

            <div
              className="
                mt-3
                rounded-full
                bg-[var(--warning-color)]
                py-1
                text-[10px]
                font-black
                text-[var(--warning-color)]
              "
            >

              #3

            </div>

          </div>

        </div>

      </section>

      {/* FULL LIST */}

      <section className="mt-6 px-4">

        <div
          className="
            rounded-[30px]
            bg-[var(--card-color)]
            p-5
            shadow-sm
          "
        >

          <div className="flex items-center gap-3">

            <Sparkles
              size={24}
              className="text-[var(--warning-color)]"
            />

            <h2 className="text-[22px] font-black">

              Top Performers

            </h2>

          </div>

          <div className="mt-5 space-y-3">

            {leaders.map(
              (leader) => (

                <div
                  key={leader.rank}
                  className="
                    flex
                    items-center
                    justify-between
                    rounded-2xl
                    bg-[var(--background-color)]
                    p-4
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
                        bg-[var(--warning-color)]
                        text-[var(--warning-color)]
                        font-black
                      "
                    >

                      #{leader.rank}

                    </div>

                    <div>

                      <h3 className="text-[15px] font-black">

                        {leader.name}

                      </h3>

                      <div className="mt-1 flex items-center gap-2">

                        <Users
                          size={12}
                          className="text-[var(--muted-text-color)]"
                        />

                        <p className="text-[11px] text-[var(--muted-text-color)]">

                          {leader.team} Team Members

                        </p>

                      </div>

                    </div>

                  </div>

                  <div
                    className="
                      rounded-full
                      bg-[var(--success-color)]
                      px-3
                      py-1
                      text-[12px]
                      font-black
                      text-[var(--success-color)]
                    "
                  >

                    ₹{leader.earnings}

                  </div>

                </div>

              )
            )}

          </div>

        </div>

      </section>

    </main>

  );

}
