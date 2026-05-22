"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";

import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Package,
  Wallet,
  Shield,
  Bell,
  Settings,
  Store,
  Truck,
  Megaphone,
  Percent,
  Search,
  Smartphone,
  Database,
  MessageSquare,
  FileText,
  BarChart3,
  Globe,
  Layers3,
  CreditCard,
  Boxes,
  Ticket,
  BadgeDollarSign,
  Headphones,
  Sparkles,
  Folder
} from "lucide-react";

const pages = [

  {
    title: "Analytics",
    icon: BarChart3,
    link: "/admin/analytics"
  },

  {
    title: "Orders",
    icon: ShoppingCart,
    link: "/admin/orders"
  },

  {
    title: "Products",
    icon: Package,
    link: "/admin/products"
  },

  {
    title: "Users",
    icon: Users,
    link: "/admin/users"
  },

  {
    title: "Wallet",
    icon: Wallet,
    link: "/admin/wallet"
  },

  {
    title: "Withdrawals",
    icon: CreditCard,
    link: "/admin/withdrawals"
  },

  {
    title: "Seller Earnings",
    icon: BadgeDollarSign,
    link: "/admin/seller-earnings"
  },

  {
    title: "Commission Engine",
    icon: Percent,
    link: "/admin/commission-engine"
  },

  {
    title: "Affiliate",
    icon: Store,
    link: "/admin/affiliate"
  },

  {
    title: "Affiliate Control",
    icon: Shield,
    link: "/admin/affiliate-control"
  },

  {
    title: "Categories",
    icon: Layers3,
    link: "/admin/categories"
  },

  {
    title: "Inventory",
    icon: Boxes,
    link: "/admin/inventory"
  },

  {
    title: "Delivery",
    icon: Truck,
    link: "/admin/delivery"
  },

  {
    title: "Payments",
    icon: CreditCard,
    link: "/admin/payments"
  },

  {
    title: "Cashfree",
    icon: CreditCard,
    link: "/admin/cashfree"
  },

  {
    title: "SMS",
    icon: Smartphone,
    link: "/admin/sms"
  },

  {
    title: "Notifications",
    icon: Bell,
    link: "/admin/notifications"
  },

  {
    title: "Push Notifications",
    icon: Bell,
    link: "/admin/push-notifications"
  },

  {
    title: "Announcement",
    icon: Megaphone,
    link: "/admin/announcement"
  },

  {
    title: "SEO AI",
    icon: Search,
    link: "/admin/seo-ai"
  },

  {
    title: "AI Product Generator",
    icon: Sparkles,
    link: "/admin/ai-product-generator"
  },

  {
    title: "Storage",
    icon: Folder,
    link: "/admin/storage"
  },

  {
    title: "Storage Manager",
    icon: Database,
    link: "/admin/storage-manager"
  },

  {
    title: "Page Builder",
    icon: LayoutDashboard,
    link: "/admin/pagebuilder"
  },

  {
    title: "Footer Builder",
    icon: Globe,
    link: "/admin/footer-builder"
  },

  {
    title: "Messages",
    icon: MessageSquare,
    link: "/admin/messages"
  },

  {
    title: "Support",
    icon: Headphones,
    link: "/admin/support"
  },

  {
    title: "Support Tickets",
    icon: Ticket,
    link: "/admin/support-tickets"
  },

  {
    title: "Reports",
    icon: FileText,
    link: "/admin/reports"
  },

  {
    title: "Database",
    icon: Database,
    link: "/admin/database"
  },

  {
    title: "Settings",
    icon: Settings,
    link: "/admin/settings"
  }

];

export default function AllPagesPage() {

  return (

    <main className="min-h-screen bg-[#0b0b0b] p-4 text-white">

      {/* HEADER */}

      <div className="mb-8 flex items-center gap-4">

        <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-cyan-500">

          <LayoutDashboard size={30} />

        </div>

        <div>

          <h1 className="text-3xl font-black">
            Admin Pages
          </h1>

          <p className="mt-1 text-sm text-gray-400">
            Quick access to all admin pages
          </p>

        </div>

      </div>

      {/* GRID */}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">

        {pages.map(
          (
            item,
            index
          ) => {

            const Icon =
              item.icon;

            return (

              <Link
                key={index}
                href={item.link}
                className="group rounded-[30px] border border-white/10 bg-[#151515] p-5 transition-all duration-300 hover:scale-[1.03] hover:border-cyan-500"
              >

                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500 text-black transition-all duration-300 group-hover:rotate-6">

                  <Icon size={28} />

                </div>

                <h2 className="mt-5 text-lg font-black">

                  {item.title}

                </h2>

                <p className="mt-2 text-sm text-gray-400">

                  Open Page

                </p>

              </Link>

            );

          }
        )}

      </div>

    </main>

  );
}
