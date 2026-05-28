/* ======================================================
FILE:
src/app/affiliate/page.tsx
====================================================== */

"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";

import {
  ArrowRight,
  BadgeIndianRupee,
  Bell,
  BriefcaseBusiness,
  CircleDollarSign,
  ClipboardCheck,
  Crown,
  Gift,
  LayoutDashboard,
  LifeBuoy,
  Medal,
  Network,
  Package,
  PlayCircle,
  ShieldCheck,
  Trophy,
  Users,
  Wallet,
  WalletCards
} from "lucide-react";

/* ======================================================
MENU ITEMS
====================================================== */

const dashboardItems = [

  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/mlm/dashboard",
    color:
      "from-indigo-500 to-blue-500"
  },

  {
    title: "Invite",
    icon: Users,
    href: "/mlm/invite",
    color:
      "from-violet-500 to-fuchsia-500"
  },

  {
    title: "Network",
    icon: Network,
    href: "/mlm/network",
    color:
      "from-cyan-500 to-sky-500"
  },

  {
    title: "Earnings",
    icon: BadgeIndianRupee,
    href: "/mlm/earnings",
    color:
      "from-green-500 to-emerald-500"
  },

  {
    title: "Wallet",
    icon: Wallet,
    href: "/mlm/wallet",
    color:
      "from-orange-500 to-amber-500"
  },

  {
    title: "Withdraw",
    icon: WalletCards,
    href: "/mlm/withdraw",
    color:
      "from-pink-500 to-rose-500"
  },

  {
    title: "Leaderboard",
    icon: Trophy,
    href: "/mlm/leaderboard",
    color:
      "from-yellow-500 to-orange-500"
  },

  {
    title: "Ranks",
    icon: Medal,
    href: "/mlm/ranks",
    color:
      "from-purple-500 to-indigo-500"
  },

  {
    title: "Cashback",
    icon: Gift,
    href: "/mlm/cashback",
    color:
      "from-teal-500 to-green-500"
  },

  {
    title: "Watch Earn",
    icon: PlayCircle,
    href: "/mlm/watch-earn",
    color:
      "from-red-500 to-pink-500"
  },

  {
    title: "Team Business",
    icon: BriefcaseBusiness,
    href: "/mlm/team-business",
    color:
      "from-sky-500 to-indigo-500"
  },

  {
    title: "Orders",
    icon: Package,
    href: "/mlm/orders",
    color:
      "from-lime-500 to-green-500"
  },

  {
    title: "Notifications",
    icon: Bell,
    href: "/mlm/notifications",
    color:
      "from-fuchsia-500 to-pink-500"
  },

  {
    title: "Permissions",
    icon: ClipboardCheck,
    href: "/mlm/permissions",
    color:
      "from-gray-600 to-gray-800"
  },

  {
    title: "Support",
    icon: LifeBuoy,
    href: "/mlm/support",
    color:
      "from-blue-500 to-cyan-500"
  }

];

/* ======================================================
COMPONENT
====================================================== */

export default function AffiliatePage() {

  const referralName =
    "MD Alim Ansari";

  return (

    <main
      className="
        min-h-screen
        bg-[#f6f7fb]
        pb-32
      "
    >

      {/* ======================================================
      HERO SECTION
      ====================================================== */}

      <section
        className="
          relative
          overflow-hidden

          bg-gradient-to-br
          from-violet-700
          via-fuchsia-600
          to-orange-500

          px-4
          pb-10
          pt-12

          text-white
        "
      >

        {/* BG CIRCLES */}

        <div
          className="
            absolute
            right-[-40px]
            top-[-40px]

            h-40
            w-40

            rounded-full
            bg-white/10
          "
        />

        <div
          className="
            absolute
            bottom-[-60px]
            left-[-40px]

            h-44
            w-44

            rounded-full
            bg-white/10
          "
        />

        <div className="relative z-10">

          {/* TOP */}

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

            <div>

              <h1
                className="
                  text-[30px]
                  font-black
                "
              >

                MLM Dashboard

              </h1>

              <p
                className="
                  text-sm
                  text-white/80
                "
              >

                Build Team & Earn Daily

              </p>

            </div>

          </div>

          {/* USER CARD */}

          <div
            className="
              mt-8
              rounded-[28px]
              bg-white/10
              p-5
              backdrop-blur-md
            "
          >

            <p
              className="
                text-xs
                text-white/70
              "
            >

              Referral Name

            </p>

            <h2
              className="
                mt-1
                text-[28px]
                font-black
              "
            >

              {referralName}

            </h2>

            {/* STATS */}

            <div
              className="
                mt-5
                grid
                grid-cols-3
                gap-3
              "
            >

              <div>

                <p className="text-xs text-white/70">

                  Team

                </p>

                <h3 className="text-xl font-black">

                  1,284

                </h3>

              </div>

              <div>

                <p className="text-xs text-white/70">

                  Income

                </p>

                <h3 className="text-xl font-black">

                  ₹58k

                </h3>

              </div>

              <div>

                <p className="text-xs text-white/70">

                  Rank

                </p>

                <h3 className="text-xl font-black">

                  Gold

                </h3>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* ======================================================
      QUICK STATS
      ====================================================== */}

      <section
        className="
          -mt-8
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

          {/* TODAY INCOME */}

          <div
            className="
              rounded-[28px]
              bg-white
              p-5
              shadow-xl
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
                text-green-600
              "
            >

              <CircleDollarSign size={30} />

            </div>

            <p
              className="
                mt-4
                text-sm
                font-semibold
                text-gray-500
              "
            >

              Today Income

            </p>

            <h2
              className="
                mt-1
                text-[28px]
                font-black
              "
            >

              ₹2,850

            </h2>

          </div>

          {/* TOTAL WITHDRAW */}

          <div
            className="
              rounded-[28px]
              bg-white
              p-5
              shadow-xl
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
                text-violet-600
              "
            >

              <ShieldCheck size={28} />

            </div>

            <p
              className="
                mt-4
                text-sm
                font-semibold
                text-gray-500
              "
            >

              Total Withdraw

            </p>

            <h2
              className="
                mt-1
                text-[28px]
                font-black
              "
            >

              ₹84k

            </h2>

          </div>

        </div>

      </section>

      {/* ======================================================
      GRID MENU
      ====================================================== */}

      <section
        className="
          mt-8
          px-4
        "
      >

        <div
          className="
            mb-5
          "
        >

          <h2
            className="
              text-[28px]
              font-black
            "
          >

            MLM Features

          </h2>

          <p
            className="
              text-sm
              text-gray-500
            "
          >

            Manage your business

          </p>

        </div>

        {/* GRID */}

        <div
          className="
            grid
            grid-cols-2
            gap-4
          "
        >

          {dashboardItems.map(
            (item) => {

              const Icon =
                item.icon;

              return (

                <Link
                  key={item.title}

                  href={item.href}

                  className="
                    group

                    overflow-hidden

                    rounded-[30px]

                    bg-white

                    p-4

                    shadow-sm

                    transition-all
                    duration-300

                    active:scale-[0.98]
                  "
                >

                  {/* ICON */}

                  <div
                    className={`
                      flex
                      h-16
                      w-16
                      items-center
                      justify-center

                      rounded-2xl

                      bg-gradient-to-br
                      ${item.color}

                      text-white

                      shadow-lg
                    `}
                  >

                    <Icon size={30} />

                  </div>

                  {/* TITLE */}

                  <h3
                    className="
                      mt-4
                      text-[16px]
                      font-black
                      text-black
                    "
                  >

                    {item.title}

                  </h3>

                  {/* BUTTON */}

                  <div
                    className="
                      mt-3
                      flex
                      items-center
                      gap-1

                      text-xs
                      font-bold
                      text-violet-600
                    "
                  >

                    Open

                    <ArrowRight
                      size={14}
                    />

                  </div>

                </Link>

              );

            }
          )}

        </div>

      </section>

    </main>

  );

}
