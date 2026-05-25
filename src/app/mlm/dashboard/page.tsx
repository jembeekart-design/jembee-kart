"use client";

import Link from "next/link";

import {
  Bell,
  Crown,
  Gift,
  Medal,
  Network,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  Users,
  Wallet
} from "lucide-react";

export default function MLMDashboardPage() {

  const quickActions = [

    {
      title: "Invite",
      href: "/mlm/invite",
      icon: Users,
      color:
        "bg-violet-100 text-violet-700"
    },

    {
      title: "Wallet",
      href: "/mlm/wallet",
      icon: Wallet,
      color:
        "bg-green-100 text-green-700"
    },

    {
      title: "Network",
      href: "/mlm/network",
      icon: Network,
      color:
        "bg-orange-100 text-orange-700"
    },

    {
      title: "Tasks",
      href: "/mlm/tasks",
      icon: Gift,
      color:
        "bg-pink-100 text-pink-700"
    }

  ];

  const stats = [

    {
      title: "Total Team",
      value: "125",
      icon: Users,
      color:
        "text-violet-700"
    },

    {
      title: "Today's Income",
      value: "₹850",
      icon: Sparkles,
      color:
        "text-green-600"
    },

    {
      title: "Rank",
      value: "Gold",
      icon: Crown,
      color:
        "text-yellow-600"
    },

    {
      title: "Rewards",
      value: "18",
      icon: Trophy,
      color:
        "text-orange-600"
    }

  ];

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
          py-3
          shadow-sm
        "
      >

        <div className="flex items-center justify-between">

          <div>

            <h1 className="text-[28px] font-black text-violet-700">

              MLM Dashboard

            </h1>

            <p className="text-[11px] text-gray-500">

              Welcome Back 👋

            </p>

          </div>

          <Link
            href="/mlm/notifications"
            className="
              relative
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

            <Bell size={22} />

            <div
              className="
                absolute
                right-2
                top-2
                h-2.5
                w-2.5
                rounded-full
                bg-red-500
              "
            />

          </Link>

        </div>

      </div>

      {/* HERO */}

      <section className="px-4 pt-5">

        <div
          className="
            overflow-hidden
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

          <div className="flex items-center justify-between">

            <div>

              <p className="text-[13px] text-white/80">

                Total Earnings

              </p>

              <h2 className="mt-2 text-[42px] font-black">

                ₹45,280

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
                bg-white/20
              "
            >

              <Wallet size={34} />

            </div>

          </div>

          <div className="mt-6 flex items-center justify-between">

            <div>

              <p className="text-[11px] text-white/80">

                Current Rank

              </p>

              <h3 className="mt-1 text-[20px] font-black">

                Gold Leader 👑

              </h3>

            </div>

            <Link
              href="/mlm/ranks"
              className="
                rounded-2xl
                bg-white
                px-4
                py-2
                text-[12px]
                font-black
                text-violet-700
              "
            >

              View Rank

            </Link>

          </div>

        </div>

      </section>

      {/* QUICK ACTIONS */}

      <section className="mt-6 px-4">

        <div className="grid grid-cols-4 gap-3">

          {quickActions.map(
            (
              action,
              index
            ) => {

              const Icon =
                action.icon;

              return (

                <Link
                  key={index}
                  href={action.href}
                  className="
                    rounded-3xl
                    bg-white
                    p-4
                    text-center
                    shadow-sm
                  "
                >

                  <div
                    className={`
                      mx-auto
                      flex
                      h-14
                      w-14
                      items-center
                      justify-center
                      rounded-full
                      ${action.color}
                    `}
                  >

                    <Icon size={26} />

                  </div>

                  <h3 className="mt-3 text-[12px] font-black">

                    {action.title}

                  </h3>

                </Link>

              );

            }
          )}

        </div>

      </section>

      {/* STATS */}

      <section className="mt-6 px-4">

        <div className="grid grid-cols-2 gap-3">

          {stats.map(
            (
              stat,
              index
            ) => {

              const Icon =
                stat.icon;

              return (

                <div
                  key={index}
                  className="
                    rounded-2xl
                    bg-white
                    p-4
                    shadow-sm
                  "
                >

                  <Icon
                    size={28}
                    className={
                      stat.color
                    }
                  />

                  <h3 className="mt-3 text-[26px] font-black">

                    {stat.value}

                  </h3>

                  <p className="text-[12px] text-gray-500">

                    {stat.title}

                  </p>

                </div>

              );

            }
          )}

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

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-[22px] font-black">

                Referral Code

              </h2>

              <p className="mt-1 text-[11px] text-gray-500">

                Share & Earn

              </p>

            </div>

            <Users
              size={28}
              className="text-violet-700"
            />

          </div>

          <div
            className="
              mt-5
              rounded-2xl
              bg-violet-50
              p-4
              text-center
            "
          >

            <h3
              className="
                text-[28px]
                font-black
                tracking-widest
                text-violet-700
              "
            >

              MDALIM123

            </h3>

          </div>

          <Link
            href="/mlm/invite"
            className="
              mt-5
              flex
              items-center
              justify-center
              rounded-2xl
              bg-violet-700
              py-3
              text-[14px]
              font-black
              text-white
            "
          >

            Invite Friends

          </Link>

        </div>

      </section>

      {/* PERFORMANCE */}

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

            <Medal
              size={24}
              className="text-yellow-600"
            />

            <h2 className="text-[22px] font-black">

              Performance

            </h2>

          </div>

          <div className="mt-5 flex items-end gap-2">

            <div className="h-16 w-full rounded-t-xl bg-violet-200" />

            <div className="h-24 w-full rounded-t-xl bg-violet-400" />

            <div className="h-20 w-full rounded-t-xl bg-fuchsia-400" />

            <div className="h-36 w-full rounded-t-xl bg-orange-400" />

            <div className="h-44 w-full rounded-t-xl bg-violet-700" />

          </div>

        </div>

      </section>

      {/* EXTRA LINKS */}

      <section className="mt-6 px-4">

        <div className="space-y-3">

          <Link
            href="/mlm/earnings"
            className="
              flex
              items-center
              justify-between
              rounded-2xl
              bg-white
              p-4
              shadow-sm
            "
          >

            <div className="flex items-center gap-3">

              <Sparkles
                size={24}
                className="text-green-600"
              />

              <div>

                <h3 className="text-[15px] font-black">

                  Earnings

                </h3>

                <p className="text-[11px] text-gray-500">

                  MLM income details

                </p>

              </div>

            </div>

            <Star
              size={20}
              className="text-gray-400"
            />

          </Link>

          <Link
            href="/mlm/leaderboard"
            className="
              flex
              items-center
              justify-between
              rounded-2xl
              bg-white
              p-4
              shadow-sm
            "
          >

            <div className="flex items-center gap-3">

              <Trophy
                size={24}
                className="text-yellow-600"
              />

              <div>

                <h3 className="text-[15px] font-black">

                  Leaderboard

                </h3>

                <p className="text-[11px] text-gray-500">

                  Top MLM performers

                </p>

              </div>

            </div>

            <Star
              size={20}
              className="text-gray-400"
            />

          </Link>

          <Link
            href="/mlm/support"
            className="
              flex
              items-center
              justify-between
              rounded-2xl
              bg-white
              p-4
              shadow-sm
            "
          >

            <div className="flex items-center gap-3">

              <ShieldCheck
                size={24}
                className="text-orange-600"
              />

              <div>

                <h3 className="text-[15px] font-black">

                  MLM Support

                </h3>

                <p className="text-[11px] text-gray-500">

                  Help & live support

                </p>

              </div>

            </div>

            <Star
              size={20}
              className="text-gray-400"
            />

          </Link>

        </div>

      </section>

    </main>

  );

}
