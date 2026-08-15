"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";

import {
  AppWindow,
  Plus,
  Save,
  Trash2,
  Eye,
  Sparkles,
  Bell,
  Gift,
  Wand2,
  Smartphone,
  Monitor,
  XCircle
} from "lucide-react";

export default function PopupManagerPage() {

  const [popups, setPopups] =
    useState([
      {
        title: "Welcome Offer",
        message:
          "Get 20% OFF on your first order 🚀"
      },

      {
        title: "Mega Sale",
        message:
          "Flash Sale Live Now 🔥"
      }

    ]);

  function addPopup() {

    setPopups([
      ...popups,

      {
        title:
          `New Popup ${popups.length + 1}`,

        message:
          "New popup message"
      }

    ]);

  }

  function removePopup(
    index: number
  ) {

    const updated =
      [...popups];

    updated.splice(index, 1);

    setPopups(updated);

  }

  return (

    <main className="min-h-screen bg-[var(--primary-color)] p-4 text-[var(--button-text-color)]">

      {/* HEADER */}

      <div className="mb-8 flex items-center justify-between">

        <div className="flex items-center gap-4">

          <div className="flex h-16 w-16 items-center justify-center rounded-[30px] bg-[var(--warning-color)]">

            <AppWindow
              size={30}
              className="text-[var(--text-color)]"
            />

          </div>

          <div>

            <h1 className="text-4xl font-black">

              Popup Manager

            </h1>

            <p className="mt-1 text-sm text-[var(--muted-text-color)]">

              Create promotional popups & offers

            </p>

          </div>

        </div>

        <button
          className="flex items-center gap-2 rounded-2xl bg-[var(--warning-color)] px-6 py-4 font-black text-[var(--text-color)]"
        >

          <Save size={20} />

          Save Popups

        </button>

      </div>

      {/* QUICK ACTIONS */}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

        <ActionCard
          title="Add Popup"
          icon={Plus}
        />

        <ActionCard
          title="AI Popup"
          icon={Sparkles}
        />

        <ActionCard
          title="Offers"
          icon={Gift}
        />

        <ActionCard
          title="Alerts"
          icon={Bell}
        />

      </div>

      {/* POPUPS */}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">

        {popups.map(
          (
            item,
            index
          ) => (

            <div
              key={index}
              className="rounded-[30px] border border-[var(--border-color)]/10 bg-[var(--primary-color)] p-6"
            >

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-3">

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--warning-color)]">

                    <Bell
                      size={24}
                      className="text-[var(--text-color)]"
                    />

                  </div>

                  <div>

                    <h2 className="text-2xl font-black">

                      {item.title}

                    </h2>

                    <p className="mt-1 text-sm text-[var(--muted-text-color)]">

                      Popup Notification

                    </p>

                  </div>

                </div>

                <button
                  onClick={() =>
                    removePopup(
                      index
                    )
                  }
                  className="rounded-2xl bg-[var(--danger-color)]/20 p-3 text-[var(--danger-color)]"
                >

                  <Trash2 size={20} />

                </button>

              </div>

              <div className="mt-5 rounded-2xl bg-[var(--card-color)]/30 p-5">

                <p className="text-[var(--text-color)]">

                  {item.message}

                </p>

              </div>

              <div className="mt-5 flex gap-3">

                <button
                  className="rounded-2xl bg-[var(--success-color)] px-5 py-3 font-black text-[var(--text-color)]"
                >

                  Active

                </button>

                <button
                  className="rounded-2xl bg-[var(--card-color)]/10 px-5 py-3 font-black"
                >

                  Edit

                </button>

              </div>

            </div>

          )
        )}

      </div>

      {/* ADD */}

      <button
        onClick={addPopup}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-[30px] bg-[var(--warning-color)] px-6 py-5 font-black text-[var(--text-color)]"
      >

        <Plus size={22} />

        Add New Popup

      </button>

      {/* LIVE PREVIEW */}

      <div className="mt-6 rounded-[30px] bg-gradient-to-r from-[var(--primary-color)] to-[var(--primary-color)] p-6 text-[var(--text-color)]">

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-3">

            <Eye />

            <h2 className="text-3xl font-black">

              Popup Preview

            </h2>

          </div>

          <div className="flex gap-3">

            <button
              className="flex items-center gap-2 rounded-2xl bg-[var(--card-color)]/20 px-4 py-3 font-bold"
            >

              <Monitor size={18} />

              Desktop

            </button>

            <button
              className="flex items-center gap-2 rounded-2xl bg-[var(--card-color)] px-4 py-3 font-bold text-[var(--button-text-color)]"
            >

              <Smartphone size={18} />

              Mobile

            </button>

          </div>

        </div>

        {/* POPUP */}

        <div className="mt-8 flex justify-center">

          <div className="w-full max-w-md rounded-[30px] bg-[var(--card-color)] p-6 text-[var(--text-color)] shadow-2xl">

            <div className="flex items-center justify-between">

              <h3 className="text-2xl font-black">

                {popups[0]?.title}

              </h3>

              <button>

                <XCircle size={24} />

              </button>

            </div>

            <p className="mt-4 text-[var(--text-color)]">

              {popups[0]?.message}

            </p>

            <button className="mt-6 w-full rounded-2xl bg-[var(--warning-color)] px-5 py-4 font-black">

              Claim Offer

            </button>

          </div>

        </div>

      </div>

      {/* AI FEATURES */}

      <div className="mt-6 rounded-[30px] border border-[var(--border-color)]/10 bg-[var(--primary-color)] p-6">

        <div className="flex items-center gap-3">

          <Sparkles className="text-[var(--warning-color)]" />

          <h2 className="text-3xl font-black">

            AI Popup Tools

          </h2>

        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">

          <FeatureCard
            title="Smart Timing"
            desc="AI shows popup at perfect time"
          />

          <FeatureCard
            title="High Conversion"
            desc="Optimized for better sales"
          />

          <FeatureCard
            title="Auto Offers"
            desc="Automatic promotional popups"
          />

        </div>

      </div>

      {/* ACTIONS */}

      <div className="mt-6 flex flex-wrap gap-4">

        <button
          className="flex items-center gap-2 rounded-2xl bg-[var(--success-color)] px-6 py-4 font-black text-[var(--text-color)]"
        >

          <Save size={20} />

          Publish Popup

        </button>

        <button
          className="flex items-center gap-2 rounded-2xl bg-[var(--primary-color)] px-6 py-4 font-black"
        >

          <Wand2 size={20} />

          Generate AI Popup

        </button>

      </div>

    </main>

  );
}

function ActionCard({
  title,
  icon: Icon
}: any) {

  return (

    <button
      className="rounded-[30px] border border-[var(--border-color)]/10 bg-[var(--primary-color)] p-5 text-left transition-all hover:scale-[1.03]"
    >

      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--warning-color)]">

        <Icon
          size={24}
          className="text-[var(--text-color)]"
        />

      </div>

      <h3 className="mt-4 text-xl font-black">

        {title}

      </h3>

    </button>

  );
}

function FeatureCard({
  title,
  desc
}: {
  title: string;
  desc: string;
}) {

  return (

    <div className="rounded-[24px] bg-[var(--card-color)]/30 p-5">

      <h3 className="text-2xl font-black">

        {title}

      </h3>

      <p className="mt-2 text-sm text-[var(--muted-text-color)]">

        {desc}

      </p>

    </div>

  );
}
