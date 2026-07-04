"use client";

import Link from "next/link";

export default function AccessDeniedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#090909] px-6 text-white">
      <div className="max-w-lg text-center">

        <h1 className="text-7xl font-extrabold text-red-500">
          403
        </h1>

        <h2 className="mt-6 text-3xl font-bold">
          Access Denied
        </h2>

        <p className="mt-4 text-gray-400">
          You don't have permission to access the JembeeKart Admin Panel.
        </p>

        <div className="mt-8 flex justify-center gap-4">

          <Link
            href="/"
            className="rounded-xl bg-gray-700 px-6 py-3 font-semibold hover:bg-gray-600"
          >
            Home
          </Link>

          <Link
            href="/admin/login"
            className="rounded-xl bg-purple-600 px-6 py-3 font-semibold hover:bg-purple-700"
          >
            Admin Login
          </Link>

        </div>

      </div>
    </div>
  );
}
