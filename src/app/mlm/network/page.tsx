"use client";

import Link from "next/link";

import {
  ArrowLeft,
  Crown,
  Users,
  UserPlus2
} from "lucide-react";

export default function MLMNetworkPage() {

  const networkData = [

    {
      name: "Rahul Kumar",
      level: 1,
      earnings: 1200
    },

    {
      name: "Aman Ali",
      level: 1,
      earnings: 950
    },

    {
      name: "Sana Parveen",
      level: 2,
      earnings: 600
    },

    {
      name: "Rohit Raj",
      level: 2,
      earnings: 480
    },

    {
      name: "Imran Khan",
      level: 3,
      earnings: 250
    }

  ];

  return (

    <main className="min-h-screen bg-[#f6f6f6] pb-20">

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

              MLM Network

            </h1>

            <p className="text-[11px] text-gray-500">

              Your Referral Team

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

          <h2 className="mt-5 text-[30px] font-black">

            Total Team
            <br />
            125 Members 🚀

          </h2>

          <p className="mt-3 text-[13px] leading-6 text-white/90">

            Aapke referral network me
            jitne jyada log honge,
            utni jyada earning hogi.

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

            <h3 className="mt-3 text-[24px] font-black">

              25

            </h3>

            <p className="text-[12px] text-gray-500">

              Direct Referrals

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

            <UserPlus2
              size={28}
              className="text-green-600"
            />

            <h3 className="mt-3 text-[24px] font-black">

              100

            </h3>

            <p className="text-[12px] text-gray-500">

              Team Members

            </p>

          </div>

        </div>

      </section>

      {/* NETWORK TREE */}

      <section className="mt-6 px-4">

        <div
          className="
            rounded-[28px]
            bg-white
            p-5
            shadow-sm
          "
        >

          <h2 className="text-[22px] font-black">

            Referral Tree

          </h2>

          <div className="mt-5 space-y-4">

            {networkData.map(
              (member, index) => (

                <div
                  key={index}
                  className="
                    rounded-2xl
                    border
                    border-gray-100
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

                        Level {member.level} Referral

                      </p>

                    </div>

                    <div
                      className="
                        rounded-full
                        bg-violet-100
                        px-3
                        py-1
                        text-[11px]
                        font-black
                        text-violet-700
                      "
                    >

                      ₹{member.earnings}

                    </div>

                  </div>

                </div>

              )
            )}

          </div>

        </div>

      </section>

      {/* LEVEL INFO */}

      <section className="mt-6 px-4">

        <div
          className="
            rounded-[28px]
            bg-white
            p-5
            shadow-sm
          "
        >

          <h2 className="text-[22px] font-black">

            MLM Levels

          </h2>

          <div className="mt-4 space-y-3">

            <div
              className="
                flex
                items-center
                justify-between
                rounded-2xl
                bg-violet-50
                p-4
              "
            >

              <div>

                <h3 className="text-[15px] font-black">

                  Level 1

                </h3>

                <p className="text-[11px] text-gray-600">

                  Direct Joining Income

                </p>

              </div>

              <div
                className="
                  rounded-full
                  bg-violet-700
                  px-3
                  py-1
                  text-[11px]
                  font-black
                  text-white
                "
              >

                10%

              </div>

            </div>

            <div
              className="
                flex
                items-center
                justify-between
                rounded-2xl
                bg-pink-50
                p-4
              "
            >

              <div>

                <h3 className="text-[15px] font-black">

                  Level 2

                </h3>

                <p className="text-[11px] text-gray-600">

                  Team Referral Income

                </p>

              </div>

              <div
                className="
                  rounded-full
                  bg-pink-600
                  px-3
                  py-1
                  text-[11px]
                  font-black
                  text-white
                "
              >

                5%

              </div>

            </div>

            <div
              className="
                flex
                items-center
                justify-between
                rounded-2xl
                bg-orange-50
                p-4
              "
            >

              <div>

                <h3 className="text-[15px] font-black">

                  Level 3

                </h3>

                <p className="text-[11px] text-gray-600">

                  Passive Team Income

                </p>

              </div>

              <div
                className="
                  rounded-full
                  bg-orange-500
                  px-3
                  py-1
                  text-[11px]
                  font-black
                  text-white
                "
              >

                2%

              </div>

            </div>

          </div>

        </div>

      </section>

    </main>

  );

}
