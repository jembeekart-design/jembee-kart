"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Wallet,
  Bell,
  Settings,
  Shield,
  Store,
  Truck,
  BarChart3,
  MessageSquare,
  Ticket,
  Folder,
  Palette,
  Search,
  Sparkles,
  Database,
  Percent,
  CreditCard,
  Radio,
  Boxes,
  Megaphone,
  Globe,
  Cpu,
  FileText,
  Headphones,
  ClipboardList,
  AppWindow
} from "lucide-react";

const menuItems = [

  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/admin"
  },

  {
    title: "Analytics",
    icon: BarChart3,
    href: "/admin/analytics"
  },

  {
    title: "Orders",
    icon: ShoppingCart,
    href: "/admin/orders"
  },

  {
    title: "Products",
    icon: Package,
    href: "/admin/products"
  },

  {
    title: "Inventory",
    icon: Boxes,
    href: "/admin/inventory"
  },

  {
    title: "Users",
    icon: Users,
    href: "/admin/users"
  },

  {
    title: "Wallet",
    icon: Wallet,
    href: "/admin/wallet"
  },

  {
    title: "Payments",
    icon: CreditCard,
    href: "/admin/payments"
  },

  {
    title: "Affiliate",
    icon: Store,
    href: "/admin/affiliate"
  },

  {
    title: "Commission",
    icon: Percent,
    href: "/admin/commission-engine"
  },

  {
    title: "Delivery",
    icon: Truck,
    href: "/admin/delivery"
  },

  {
    title: "Live Stream",
    icon: Radio,
    href: "/admin/live-stream"
  },

  {
    title: "Notifications",
    icon: Bell,
    href: "/admin/notifications"
  },

  {
    title: "Announcement",
    icon: Megaphone,
    href: "/admin/announcement"
  },

  {
    title: "Messages",
    icon: MessageSquare,
    href: "/admin/messages"
  },

  {
    title: "Support",
    icon: Headphones,
    href: "/admin/support"
  },

  {
    title: "Tickets",
    icon: Ticket,
    href: "/admin/support-tickets"
  },

  {
    title: "SEO",
    icon: Search,
    href: "/admin/seo"
  },

  {
    title: "AI Tools",
    icon: Sparkles,
    href: "/admin/ai-tools"
  },

  {
    title: "Pages",
    icon: AppWindow,
    href: "/admin/all-pages"
  },

  {
    title: "Storage",
    icon: Folder,
    href: "/admin/storage"
  },

  {
    title: "Database",
    icon: Database,
    href: "/admin/database"
  },

  {
    title: "Theme",
    icon: Palette,
    href: "/admin/theme"
  },

  {
    title: "System",
    icon: Cpu,
    href: "/admin/system"
  },

  {
    title: "Logs",
    icon: ClipboardList,
    href: "/admin/system-logs"
  },

  {
    title: "Reports",
    icon: FileText,
    href: "/admin/reports"
  },

  {
    title: "Security",
    icon: Shield,
    href: "/admin/security"
  },

  {
    title: "Settings",
    icon: Settings,
    href: "/admin/settings"
  }

];

export default function AdminSidebar() {

  const pathname =
    usePathname();

  return (

    <aside className="hidden h-screen w-[280px] overflow-y-auto border-r border-white/10 bg-[#0b0b0b] p-5 text-[var(--button-text-color)] lg:block">

      {/* LOGO */}

      <div className="mb-8 flex items-center gap-3">

        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500 text-[var(--text-color)]">

          <LayoutDashboard size={28} />

        </div>

        <div>

          <h1 className="text-2xl font-black">
            JembeeKart
          </h1>

          <p className="text-sm text-gray-400">
            Admin Panel
          </p>

        </div>

      </div>

      {/* MENU */}

      <div className="space-y-2">

        {menuItems.map((item, index) => {

          const Icon =
            item.icon;

          const active =
            pathname === item.href;

          return (

            <Link
              key={index}
              href={item.href}
              className={`flex items-center gap-4 rounded-2xl px-4 py-4 transition-all duration-300 ${
                active
                  ? "bg-cyan-500 text-[var(--text-color)]"
                  : "bg-[#151515] hover:bg-cyan-500 hover:text-[var(--text-color)]"
              }`}
            >

              <Icon size={22} />

              <span className="text-sm font-bold">

                {item.title}

              </span>

            </Link>

          );

        })}

      </div>

      {/* FOOTER */}

      <div className="mt-10 rounded-3xl border border-cyan-500/30 bg-cyan-500/10 p-5">

        <h2 className="text-lg font-black">
          Admin System
        </h2>

        <p className="mt-2 text-sm text-gray-300">

          Manage products, orders, users, AI tools,
          marketing, payments and analytics.

        </p>

      </div>

    </aside>

  );

}
