"use client";

import Link from "next/link";

import {
  ArrowLeft,
  BadgeIndianRupee,
  CheckCircle2,
  Crown,
  Gift,
  Sparkles,
  Star,
  Users
} from "lucide-react";

export default function MLMTasksPage() {

  const tasks = [

    {
      title:
        "Invite 1 Friend",
      reward:
        "₹50 Bonus",
      completed: true,
      icon: Users
    },

    {
      title:
        "Share Product",
      reward:
        "₹20 Cashback",
      completed: false,
      icon: Gift
    },

    {
      title:
        "Daily Login",
      reward:
        "10 Reward Coins",
      completed: true,
      icon: Star
    },

    {
      title:
        "Complete 5 Referrals",
      reward:
        "₹500 MLM Bonus",
      completed: false,
      icon:
        BadgeIndianRupee
    }

  ];

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

              Daily Tasks

            </h1>

            <p className="text-[11px] text-gray-500">

              Complete Tasks & Earn Rewards

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

            Daily MLM
            <br />
            Rewards 🎁

          </h2>

          <p className="mt-3 text-[13px] leading-6 text-white/90">

            Roz tasks complete karo,
            rewards earn karo aur
            apni MLM income increase karo.

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

            <Sparkles
              size={28}
              className="text-yellow-600"
            />

            <h3 className="mt-3 text-[24px] font-black">

              250

            </h3>

            <p className="text-[12px] text-gray-500">

              Reward Coins

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

            <Star
              size={28}
              className="text-orange-500"
            />

            <h3 className="mt-3 text-[24px] font-black">

              7 Days

            </h3>

            <p className="text-[12px] text-gray-500">

              Login Streak

            </p>

          </div>

        </div>

      </section>

      {/* TASK LIST */}

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

            Today's Tasks

          </h2>

          <div className="mt-5 space-y-4">

            {tasks.map(
              (
                task,
                index
              ) => {

                const Icon =
                  task.icon;

                return (

                  <div
                    key={index}
                    className="
                      rounded-2xl
                      bg-gray-50
                      p-4
                    "
                  >

                    <div className="flex items-center justify-between">

                      <div className="flex items-center gap-3">

                        <div
                          className="
                            flex
                            h-14
                            w-14
                            items-center
                            justify-center
                            rounded-full
                            bg-violet-100
                            text-violet-700
                          "
                        >

                          <Icon size={26} />

                        </div>

                        <div>

                          <h3 className="text-[15px] font-black">

                            {task.title}

                          </h3>

                          <p className="mt-1 text-[11px] text-gray-500">

                            Reward:
                            {" "}
                            {task.reward}

                          </p>

                        </div>

                      </div>

                      {task.completed ? (

                        <div
                          className="
                            flex
                            items-center
                            gap-2
                            rounded-full
                            bg-green-100
                            px-3
                            py-1
                            text-[11px]
                            font-black
                            text-green-700
                          "
                        >

                          <CheckCircle2 size={14} />

                          Done

                        </div>

                      ) : (

                        <button
                          className="
                            rounded-full
                            bg-violet-700
                            px-4
                            py-2
                            text-[11px]
                            font-black
                            text-white
                          "
                        >

                          Complete

                        </button>

                      )}

                    </div>

                  </div>

                );

              }
            )}

          </div>

        </div>

      </section>

      {/* BONUS */}

      <section className="mt-6 px-4">

        <div
          className="
            rounded-[30px]
            bg-gradient-to-r
            from-yellow-400
            to-orange-500
            p-5
            text-white
            shadow-xl
          "
        >

          <Gift size={40} />

          <h2 className="mt-4 text-[28px] font-black">

            Weekly Bonus 🎉

          </h2>

          <p className="mt-3 text-[13px] leading-6 text-white/90">

            7 din continuously tasks
            complete karne par extra
            ₹1000 MLM reward milega.

          </p>

          <button
            className="
              mt-5
              rounded-2xl
              bg-white
              px-5
              py-3
              text-[14px]
              font-black
              text-orange-600
            "
          >

            Claim Bonus

          </button>

        </div>

      </section>

    </main>

  );

}
