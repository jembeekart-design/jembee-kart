"use client";

import Link from "next/link";

import {
  ArrowLeft,
  Award,
  BadgeCheck,
  Crown,
  Gem,
  Shield,
  Sparkles,
  Trophy
} from "lucide-react";

export default function MLMRanksPage() {

  const currentRank =
    "Gold Leader";

  const nextRank =
    "Diamond Leader";

  const currentTeam =
    125;

  const nextTarget =
    200;

  const remaining =
    nextTarget - currentTeam;

  const ranks = [

    {
      title: "Bronze Leader",
      color:
        "from-[var(--color-primary-button)] to-[var(--color-primary-button)]",
      reward: "₹1,000 Bonus",
      members: 10
    },

    {
      title: "Silver Leader",
      color:
        "from-[var(--color-primary-button)] to-[var(--color-primary-button)]",
      reward: "₹5,000 Bonus",
      members: 50
    },

    {
      title: "Gold Leader",
      color:
        "from-[var(--color-primary-button)] to-[var(--color-primary-button)]",
      reward: "₹15,000 Bonus",
      members: 100
    },

    {
      title: "Diamond Leader",
      color:
        "from-[var(--color-primary-button)] to-[var(--color-primary-button)]",
      reward: "₹50,000 Bonus",
      members: 200
    },

    {
      title: "Crown Leader",
      color:
        "from-[var(--color-primary-button)] to-[var(--color-primary-button)]",
      reward: "₹1 Lakh Bonus",
      members: 500
    }

  ];

  return (

    <main className="min-h-screen bg-[var(--color-page-background)] pb-24">

      {/* HEADER */}

      <div
        className="
          sticky
          top-0
          z-50
          bg-[var(--color-card-background)]
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
              bg-[var(--color-warning)]
              text-[var(--color-warning)]
            "
          >

            <ArrowLeft size={20} />

          </Link>

          <div>

            <h1 className="text-[24px] font-black text-[var(--color-warning)]">

              MLM Ranks

            </h1>

            <p className="text-[11px] text-[var(--text-secondary)]">

              Achievements & Rewards

            </p>

          </div>

        </div>

      </div>

      {/* HERO */}

      <section className="px-4 pt-5">

        <div
          className="
            overflow-hidden
            rounded-[32px]
            bg-gradient-to-br
            from-[var(--color-primary-button)]
            via-[var(--color-primary-button)]
            to-[var(--color-primary-button)]
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
              bg-[var(--color-card-background)]/20
            "
          >

            <Crown size={34} />

          </div>

          <p className="mt-5 text-[13px] text-[var(--button-text-color)]/85">

            Current Rank

          </p>

          <h2 className="mt-2 text-[34px] font-black">

            {currentRank}

          </h2>

          <p className="mt-4 text-[13px] leading-6 text-[var(--button-text-color)]/90">

            Aapki team aur earnings ke
            basis par aapko rank aur
            bonus diya jata hai.

          </p>

        </div>

      </section>

      {/* NEXT RANK */}

      <section className="mt-6 px-4">

        <div
          className="
            rounded-[30px]
            bg-[var(--color-card-background)]
            p-5
            shadow-sm
          "
        >

          <div className="flex items-center gap-3">

            <Gem
              size={26}
              className="text-[var(--color-primary-button)]"
            />

            <div>

              <h2 className="text-[22px] font-black">

                Next Rank

              </h2>

              <p className="text-[11px] text-[var(--text-secondary)]">

                Upgrade Progress

              </p>

            </div>

          </div>

          <div className="mt-5">

            <div className="flex items-center justify-between">

              <h3 className="text-[18px] font-black">

                {nextRank}

              </h3>

              <p className="text-[12px] font-bold text-[var(--color-primary-button)]">

                {currentTeam}/{nextTarget}

              </p>

            </div>

            {/* PROGRESS */}

            <div
              className="
                mt-3
                h-4
                overflow-hidden
                rounded-full
                bg-[var(--color-card-background)]
              "
            >

              <div
                style={{
                  width: `${(currentTeam / nextTarget) * 100}%`
                }}
                className="
                  h-full
                  rounded-full
                  bg-gradient-to-r
                  from-[var(--color-primary-button)]
                  to-[var(--color-primary-button)]
                "
              />

            </div>

            <p className="mt-3 text-[12px] text-[var(--text-secondary)]">

              Sirf{" "}
              <span className="font-black text-[var(--color-primary-button)]">

                {remaining} members

              </span>{" "}
              aur add karne par aapka
              next rank unlock ho jayega.

            </p>

          </div>

        </div>

      </section>

      {/* RANK LIST */}

      <section className="mt-6 px-4">

        <div className="space-y-4">

          {ranks.map(
            (rank, index) => (

              <div
                key={index}
                className="
                  overflow-hidden
                  rounded-[28px]
                  bg-[var(--color-card-background)]
                  shadow-sm
                "
              >

                <div
                  className={`
                    bg-gradient-to-r
                    ${rank.color}
                    p-5
                    text-[var(--button-text-color)]
                  `}
                >

                  <div className="flex items-center justify-between">

                    <div>

                      <h2 className="text-[22px] font-black">

                        {rank.title}

                      </h2>

                      <p className="mt-1 text-[12px] text-[var(--button-text-color)]/90">

                        {rank.members}+ Team Members

                      </p>

                    </div>

                    <Award size={36} />

                  </div>

                </div>

                <div className="p-5">

                  <div className="flex items-center gap-3">

                    <BadgeCheck
                      size={22}
                      className="text-[var(--color-success)]"
                    />

                    <p className="text-[14px] font-bold">

                      Reward:
                      {" "}
                      {rank.reward}

                    </p>

                  </div>

                </div>

              </div>

            )
          )}

        </div>

      </section>

      {/* ACHIEVEMENT */}

      <section className="mt-6 px-4">

        <div
          className="
            rounded-[30px]
            bg-[var(--color-card-background)]
            p-5
            shadow-sm
          "
        >

          <div className="flex items-center gap-3">

            <Trophy
              size={26}
              className="text-[var(--color-warning)]"
            />

            <h2 className="text-[22px] font-black">

              Achievements

            </h2>

          </div>

          <div className="mt-5 space-y-3">

            <div
              className="
                flex
                items-center
                gap-3
                rounded-2xl
                bg-[var(--color-warning)]
                p-4
              "
            >

              <Sparkles
                size={24}
                className="text-[var(--color-warning)]"
              />

              <div>

                <h3 className="text-[15px] font-black">

                  Fast Growing Leader

                </h3>

                <p className="text-[11px] text-[var(--text-secondary)]">

                  50 referrals completed

                </p>

              </div>

            </div>

            <div
              className="
                flex
                items-center
                gap-3
                rounded-2xl
                bg-[var(--color-primary-button)]
                p-4
              "
            >

              <Shield
                size={24}
                className="text-[var(--color-primary-button)]"
              />

              <div>

                <h3 className="text-[15px] font-black">

                  Trusted MLM Partner

                </h3>

                <p className="text-[11px] text-[var(--text-secondary)]">

                  100 successful joins

                </p>

              </div>

            </div>

          </div>

        </div>

      </section>

    </main>

  );

}
