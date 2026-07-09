"use client";

import { useState } from "react";

import Link from "next/link";

import {
  ArrowLeft,
  Headphones,
  Send,
  ShieldCheck,
  Wallet,
  Users
} from "lucide-react";

export default function MLMSupportPage() {

  const [message, setMessage] =
    useState("");

  const [messages, setMessages] =
    useState([
      {
        sender: "admin",
        text:
          "Hello 👋 Welcome to MLM Support. How can we help you?"
      }
    ]);

  function sendMessage() {

    if (!message.trim()) return;

    setMessages([
      ...messages,
      {
        sender: "user",
        text: message
      }
    ]);

    setMessage("");

    setTimeout(() => {

      setMessages((prev) => [
        ...prev,
        {
          sender: "admin",
          text:
            "Our MLM support team will contact you soon."
        }
      ]);

    }, 1000);

  }

  return (

    <main className="flex min-h-screen flex-col bg-[#f6f6f6]">

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
              bg-violet-100
              text-violet-700
            "
          >

            <ArrowLeft size={20} />

          </Link>

          <div>

            <h1 className="text-[24px] font-black text-violet-700">

              MLM Support

            </h1>

            <p className="text-[11px] text-[var(--muted-text-color)]">

              Live Help & Support

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

            <Headphones size={34} />

          </div>

          <h2 className="mt-5 text-[30px] font-black leading-[38px]">

            MLM Help
            <br />
            Center 🎧

          </h2>

          <p className="mt-3 text-[13px] leading-6 text-[var(--button-text-color)]/90">

            Referral, earnings,
            withdraw aur MLM issues ke
            liye yahan support le sakte ho.

          </p>

        </div>

      </section>

      {/* QUICK HELP */}

      <section className="mt-6 px-4">

        <div className="grid grid-cols-2 gap-3">

          <button
            className="
              rounded-2xl
              bg-[var(--card-color)]
              p-4
              text-left
              shadow-sm
            "
          >

            <Wallet
              size={28}
              className="text-[var(--success-color)]"
            />

            <h3 className="mt-3 text-[15px] font-black">

              Withdraw Issue

            </h3>

            <p className="mt-1 text-[11px] text-[var(--muted-text-color)]">

              Payment related help

            </p>

          </button>

          <button
            className="
              rounded-2xl
              bg-[var(--card-color)]
              p-4
              text-left
              shadow-sm
            "
          >

            <Users
              size={28}
              className="text-violet-700"
            />

            <h3 className="mt-3 text-[15px] font-black">

              Referral Help

            </h3>

            <p className="mt-1 text-[11px] text-[var(--muted-text-color)]">

              Team & referral support

            </p>

          </button>

          <button
            className="
              rounded-2xl
              bg-[var(--card-color)]
              p-4
              text-left
              shadow-sm
            "
          >

            <ShieldCheck
              size={28}
              className="text-orange-600"
            />

            <h3 className="mt-3 text-[15px] font-black">

              Account Safety

            </h3>

            <p className="mt-1 text-[11px] text-[var(--muted-text-color)]">

              Secure MLM account

            </p>

          </button>

          <button
            className="
              rounded-2xl
              bg-[var(--card-color)]
              p-4
              text-left
              shadow-sm
            "
          >

            <Headphones
              size={28}
              className="text-pink-600"
            />

            <h3 className="mt-3 text-[15px] font-black">

              Live Support

            </h3>

            <p className="mt-1 text-[11px] text-[var(--muted-text-color)]">

              Talk to support team

            </p>

          </button>

        </div>

      </section>

      {/* CHAT */}

      <section className="mt-6 flex-1 px-4 pb-32">

        <div
          className="
            rounded-[30px]
            bg-[var(--card-color)]
            p-4
            shadow-sm
          "
        >

          <h2 className="text-[22px] font-black">

            Live Chat

          </h2>

          <div className="mt-5 space-y-4">

            {messages.map(
              (
                item,
                index
              ) => (

                <div
                  key={index}
                  className={`flex ${
                    item.sender === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >

                  <div
                    className={`
                      max-w-[80%]
                      rounded-2xl
                      px-4
                      py-3
                      text-[13px]
                      leading-6
                      ${
                        item.sender === "user"
                          ? "bg-violet-700 text-[var(--button-text-color)]"
                          : "bg-[var(--background-color)] text-[var(--text-color)]"
                      }
                    `}
                  >

                    {item.text}

                  </div>

                </div>

              )
            )}

          </div>

        </div>

      </section>

      {/* INPUT */}

      <div
        className="
          fixed
          bottom-0
          left-0
          w-full
          border-t
          bg-[var(--card-color)]
          p-3
        "
      >

        <div className="flex items-center gap-3">

          <input
            type="text"
            placeholder="Type your message..."
            value={message}
            onChange={(e) =>
              setMessage(
                e.target.value
              )
            }
            className="
              h-12
              flex-1
              rounded-2xl
              bg-[var(--background-color)]
              px-4
              text-[14px]
              outline-none
            "
          />

          <button
            onClick={sendMessage}
            className="
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-2xl
              bg-gradient-to-r
              from-violet-700
              to-fuchsia-600
              text-[var(--button-text-color)]
              shadow-lg
            "
          >

            <Send size={20} />

          </button>

        </div>

      </div>

    </main>

  );

}
