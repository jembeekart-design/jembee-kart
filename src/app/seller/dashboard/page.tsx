"use client";

import { useTheme } from "@/shared/hooks/useTheme";

export default function SellerDashboard() {
  const { theme, updateTheme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-6">

      {/* 🔥 Glass Card */}
      <div className="glass w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">
          Seller Dashboard
        </h1>

        <p className="mb-4">
          Current Primary Color:
        </p>

        <div
          className="w-10 h-10 mx-auto rounded-full mb-4"
          style={{ background: theme.primary }}
        />

        {/* 🔥 Button */}
        <button
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700"
          onClick={() =>
            updateTheme({
              primary: "#22c55e",
              accent: "#f59e0b"
            })
          }
        >
          Change Theme
        </button>
      </div>

    </div>
  );
}
