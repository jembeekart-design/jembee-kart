"use client";

import Link from "next/link";

const governancePages = [
  {
    id: "001",
    name: "MLM Wallet Audit",
    href: "/admin/governance/pages/mlm-wallet",
  },
  {
    id: "002",
    name: "Watch Earn Audit",
    href: "/admin/governance/pages/watch-earn",
  },
  {
    id: "003",
    name: "Watch Earn Upload Audit",
    href: "/admin/governance/pages/watch-earn-upload",
  },
  {
    id: "004",
    name: "Watch Earn Hook Audit",
    href: "/admin/governance/pages/watch-earn-hook",
  },
  {
    id: "005",
    name: "Watch Tracking Audit",
    href: "/admin/governance/pages/watch-tracking",
  },
  {
    id: "006",
    name: "Coins Popup Audit",
    href: "/admin/governance/pages/coins-popup",
  },
  {
    id: "007",
    name: "Floating Rewards Audit",
    href: "/admin/governance/pages/floating-rewards",
  },
  {
    id: "008",
    name: "Orders Audit",
    href: "/admin/governance/pages/orders",
  },
];

export default function GovernanceAllPage() {
  return (
    <main className="min-h-screen bg-[#050505] p-6 text-white">

      <div className="mb-8">
        <h1 className="text-4xl font-black">
          Governance Center
        </h1>

        <p className="mt-2 text-gray-400">
          All Governance Audit Reports
        </p>
      </div>

      <div className="grid gap-4">

        {governancePages.map((page) => (
          <Link
            key={page.id}
            href={page.href}
            className="
              flex
              items-center
              justify-between
              rounded-3xl
              border
              border-white/10
              bg-[#111111]
              p-5
              transition-all
              hover:border-violet-500
              hover:bg-[#181818]
            "
          >
            <div>
              <p className="text-sm text-gray-500">
                Audit #{page.id}
              </p>

              <h2 className="mt-1 text-xl font-black">
                {page.name}
              </h2>
            </div>

            <div
              className="
                rounded-full
                bg-violet-600
                px-4
                py-2
                text-sm
                font-black
              "
            >
              Open
            </div>
          </Link>
        ))}

      </div>

    </main>
  );
}
