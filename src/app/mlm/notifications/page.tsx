"use client";

import Link from "next/link";

import {
  ArrowLeft,
  BadgeIndianRupee,
  Bell,
  Crown,
  Gift,
  ShieldCheck,
  Users
} from "lucide-react";

export default function MLMNotificationsPage() {

  const notifications = [

    {
      title:
        "New Referral Joined",
      message:
        "Rahul Kumar joined using your referral link.",
      icon: Users,
      color:
        "bg-[var(--primary-color)] text-[var(--primary-color)]",
      time:
        "2 min ago"
    },

    {
      title:
        "Income Received",
      message:
        "You received ₹450 Level 1 commission.",
      icon:
        BadgeIndianRupee,
      color:
        "bg-[var(--success-color)] text-[var(--success-color)]",
      time:
        "10 min ago"
    },

    {
      title:
        "Rank Upgraded",
      message:
        "Congratulations! You reached Gold Leader rank.",
      icon: Crown,
      color:
        "bg-[var(--warning-color)] text-[var(--warning-color)]",
      time:
        "1 hour ago"
    },

    {
      title:
        "Withdraw Approved",
      message:
        "Your ₹1500 withdraw request is approved.",
      icon:
        ShieldCheck,
      color:
        "bg-[var(--primary-color)] text-[var(--primary-color)]",
      time:
        "Today"
    },

    {
      title:
        "Bonus Unlocked",
      message:
        "You unlocked ₹500 team growth bonus.",
      icon: Gift,
      color:
        "bg-[var(--primary-color)] text-[var(--primary-color)]",
      time:
        "Today"
    }

  ];

  return (

    <main className="min-h-screen bg-[var(--primary-color)] pb-20">

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
              bg-[var(--primary-color)]
              text-[var(--primary-color)]
            "
          >

            <ArrowLeft size={20} />

          </Link>

          <div>

            <h1 className="text-[24px] font-black text-[var(--primary-color)]">

              Notifications

            </h1>

            <p className="text-[11px] text-[var(--muted-text-color)]">

              MLM Activity Updates

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

            <Bell size={34} />

          </div>

          <h2 className="mt-5 text-[32px] font-black leading-[38px]">

            Live MLM
            <br />
            Notifications 🔔

          </h2>

          <p className="mt-3 text-[13px] leading-6 text-[var(--button-text-color)]/90">

            Referral joins, income,
            bonuses aur rank updates
            yahan realtime dikhेंगे.

          </p>

        </div>

      </section>

      {/* NOTIFICATION LIST */}

      <section className="mt-6 px-4">

        <div className="space-y-4">

          {notifications.map(
            (
              notification,
              index
            ) => {

              const Icon =
                notification.icon;

              return (

                <div
                  key={index}
                  className="
                    rounded-[28px]
                    bg-[var(--card-color)]
                    p-4
                    shadow-sm
                  "
                >

                  <div className="flex gap-3">

                    <div
                      className={`
                        flex
                        h-14
                        w-14
                        items-center
                        justify-center
                        rounded-full
                        ${notification.color}
                      `}
                    >

                      <Icon size={26} />

                    </div>

                    <div className="flex-1">

                      <div className="flex items-center justify-between gap-3">

                        <h3 className="text-[16px] font-black">

                          {notification.title}

                        </h3>

                        <p className="text-[10px] font-bold text-[var(--muted-text-color)]">

                          {notification.time}

                        </p>

                      </div>

                      <p className="mt-2 text-[12px] leading-6 text-[var(--muted-text-color)]">

                        {notification.message}

                      </p>

                    </div>

                  </div>

                </div>

              );

            }
          )}

        </div>

      </section>

    </main>

  );

}
