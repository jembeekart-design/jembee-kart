"use client";

import { useState } from "react";

import {
  addDoc,
  collection
} from "firebase/firestore";

import {
  ArrowLeft,
  CheckCircle2,
  User,
  Phone,
  Mail
} from "lucide-react";

import Link from "next/link";

import { db } from "@/firebase/config";

export default function JoinMLMPage() {

  const [name, setName] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  async function joinMLM() {

    if (
      !name ||
      !phone
    ) {

      alert(
        "Please fill all fields"
      );

      return;
    }

    try {

      setLoading(true);

      const referralCode =
        name
          .replace(/\s+/g, "")
          .toLowerCase() +
        Math.floor(
          Math.random() * 9999
        );

      await addDoc(
        collection(
          db,
          "mlm_members"
        ),
        {
          name,
          phone,
          email,
          referralCode,
          referralLink:
            `https://jembeekart.com/register?ref=${referralCode}`,
          createdAt:
            Date.now()
        }
      );

      alert(
        "Successfully Joined MLM"
      );

      setName("");
      setPhone("");
      setEmail("");

    } catch (error) {

      console.error(error);

      alert(
        "Something went wrong"
      );

    } finally {

      setLoading(false);

    }

  }

  return (

    <main className="min-h-screen bg-[#f6f6f6] pb-10">

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
            href="/mlm"
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

            <h1 className="text-[22px] font-black text-violet-700">

              Join MLM

            </h1>

            <p className="text-[11px] text-gray-500">

              Start Your Earning Journey

            </p>

          </div>

        </div>

      </div>

      {/* HERO */}

      <section className="px-4 pt-5">

        <div
          className="
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

          <CheckCircle2 size={40} />

          <h2 className="mt-4 text-[30px] font-black leading-[36px]">

            Join MLM &
            <br />
            Earn Daily 🚀

          </h2>

          <p className="mt-3 text-[13px] leading-6 text-white/90">

            Team build karo,
            products share karo
            aur unlimited earning
            start karo.

          </p>

        </div>

      </section>

      {/* FORM */}

      <section className="mt-6 px-4">

        <div
          className="
            rounded-[28px]
            bg-white
            p-5
            shadow-sm
          "
        >

          {/* NAME */}

          <div>

            <label className="text-[13px] font-black">

              Full Name

            </label>

            <div
              className="
                mt-2
                flex
                items-center
                gap-3
                rounded-2xl
                border
                border-gray-200
                bg-gray-50
                px-4
                py-3
              "
            >

              <User
                size={18}
                className="text-violet-700"
              />

              <input
                type="text"
                placeholder="Enter full name"
                value={name}
                onChange={(e) =>
                  setName(
                    e.target.value
                  )
                }
                className="
                  w-full
                  bg-transparent
                  text-[14px]
                  outline-none
                "
              />

            </div>

          </div>

          {/* PHONE */}

          <div className="mt-5">

            <label className="text-[13px] font-black">

              Mobile Number

            </label>

            <div
              className="
                mt-2
                flex
                items-center
                gap-3
                rounded-2xl
                border
                border-gray-200
                bg-gray-50
                px-4
                py-3
              "
            >

              <Phone
                size={18}
                className="text-violet-700"
              />

              <input
                type="tel"
                placeholder="Enter mobile number"
                value={phone}
                onChange={(e) =>
                  setPhone(
                    e.target.value
                  )
                }
                className="
                  w-full
                  bg-transparent
                  text-[14px]
                  outline-none
                "
              />

            </div>

          </div>

          {/* EMAIL */}

          <div className="mt-5">

            <label className="text-[13px] font-black">

              Email Address

            </label>

            <div
              className="
                mt-2
                flex
                items-center
                gap-3
                rounded-2xl
                border
                border-gray-200
                bg-gray-50
                px-4
                py-3
              "
            >

              <Mail
                size={18}
                className="text-violet-700"
              />

              <input
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) =>
                  setEmail(
                    e.target.value
                  )
                }
                className="
                  w-full
                  bg-transparent
                  text-[14px]
                  outline-none
                "
              />

            </div>

          </div>

          {/* BUTTON */}

          <button
            onClick={joinMLM}
            disabled={loading}
            className="
              mt-7
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

            {loading
              ? "Joining..."
              : "Join MLM Now"}

          </button>

        </div>

      </section>

    </main>

  );

}
