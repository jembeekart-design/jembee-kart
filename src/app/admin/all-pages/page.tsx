"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";

import {
  Activity,
  AppWindow,
  BadgeCheck,
  BadgeDollarSign,
  BadgePercent,
  BarChart3,
  Bell,
  Blocks,
  Bot,
  Boxes,
  Brain,
  Building2,
  CircleDollarSign,
  CircleHelp,
  ClipboardList,
  Cloud,
  Coins,
  Contact,
  CreditCard,
  Cpu,
  Database,
  FileBarChart,
  FileCog,
  FileSearch,
  FileText,
  Folder,
  FolderCog,
  GalleryVertical,
  Gift,
  Globe,
  Headphones,
  Home,
  Image,
  IndianRupee,
  KeyRound,
  LayoutDashboard,
  Layers3,
  LifeBuoy,
  Lock,
  Megaphone,
  MessageCircle,
  MessageSquare,
  Monitor,
  Network,
  Newspaper,
  Package,
  Palette,
  Percent,
  Radio,
  Receipt,
  ScanSearch,
  Search,
  Send,
  Server,
  Settings,
  Shield,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Star,
  Store,
  Ticket,
  Timer,
  Truck,
  UserCog,
  Users,
  Wallet,
  WalletCards,
  Wand2,
  Zap,
  Share2
} from "lucide-react";

const pages = [

  {
    title: "Admin Dashboard",
    icon: LayoutDashboard,
    link: "/admin"
  },

  {
    title: "All Pages",
    icon: Blocks,
    link: "/admin/all-pages"
  },

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
    title: "Live Orders",
    icon: Activity,
    link: "/admin/live-orders"
  },

  {
    title: "Products",
    icon: Package,
    link: "/admin/products"
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
    title: "Users",
    icon: Users,
    link: "/admin/users"
  },

  {
    title: "Subadmins",
    icon: UserCog,
    link: "/admin/subadmins"
  },

  {
    title: "Roles",
    icon: BadgeCheck,
    link: "/admin/roles"
  },

  {
    title: "Wallet",
    icon: Wallet,
    link: "/admin/wallet"
  },

  {
    title: "Withdrawals",
    icon: WalletCards,
    link: "/admin/withdrawals"
  },

  {
    title: "Withdrawal Requests",
    icon: Receipt,
    link: "/admin/withdrawal-requests"
  },

  {
    title: "Finance",
    icon: Coins,
    link: "/admin/finance"
  },

  {
    title: "Seller Earnings",
    icon: IndianRupee,
    link: "/admin/seller-earnings"
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
    title: "Affiliate Settings",
    icon: Contact,
    link: "/admin/affiliate-settings"
  },

  {
    title: "Referrals",
    icon: Share2,
    link: "/admin/referrals"
  },

  {
    title: "Commission Engine",
    icon: BadgePercent,
    link: "/admin/commission-engine"
  },

  {
    title: "Commissions",
    icon: Percent,
    link: "/admin/commissions"
  },

  {
    title: "Payments",
    icon: CreditCard,
    link: "/admin/payments"
  },

  {
    title: "Cashfree",
    icon: CircleDollarSign,
    link: "/admin/cashfree"
  },

  {
    title: "Shipping",
    icon: Truck,
    link: "/admin/shipping"
  },

  {
    title: "Delivery",
    icon: Truck,
    link: "/admin/delivery"
  },

  {
    title: "Delivery Tracking",
    icon: Activity,
    link: "/admin/delivery-tracking"
  },

  {
    title: "Coupons",
    icon: Gift,
    link: "/admin/coupons"
  },

  {
    title: "Coupons Generator",
    icon: Wand2,
    link: "/admin/coupons-generator"
  },

  {
    title: "Flash Sale",
    icon: Zap,
    link: "/admin/flash-sale"
  },

  {
    title: "Spin Wheel",
    icon: CircleDollarSign,
    link: "/admin/spin-wheel"
  },

  {
    title: "Rewards",
    icon: Star,
    link: "/admin/rewards"
  },

  {
    title: "Subscriptions",
    icon: FileCog,
    link: "/admin/subscriptions"
  },

  {
    title: "Membership",
    icon: BadgeDollarSign,
    link: "/admin/membership"
  },

  {
    title: "KYC",
    icon: KeyRound,
    link: "/admin/kyc"
  },

  {
    title: "KYC Verification",
    icon: Shield,
    link: "/admin/kyc-verification"
  },

  {
    title: "Seller Verification",
    icon: ShoppingBag,
    link: "/admin/seller-verification"
  },

  {
    title: "Reviews",
    icon: MessageCircle,
    link: "/admin/reviews"
  },

  {
    title: "Reviews Ratings",
    icon: Star,
    link: "/admin/reviews-ratings"
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
    title: "Notifications",
    icon: Bell,
    link: "/admin/notifications"
  },

  {
    title: "Push Notifications",
    icon: Send,
    link: "/admin/push-notifications"
  },

  {
    title: "Announcement",
    icon: Megaphone,
    link: "/admin/announcement"
  },

  {
    title: "SMS",
    icon: Smartphone,
    link: "/admin/sms"
  },

  {
    title: "Live Chat",
    icon: Radio,
    link: "/admin/live-chat"
  },

  {
    title: "Live Stream",
    icon: Radio,
    link: "/admin/live-stream"
  },

  {
    title: "SEO",
    icon: Search,
    link: "/admin/seo"
  },

  {
    title: "SEO AI",
    icon: ScanSearch,
    link: "/admin/seo-ai"
  },

  {
    title: "AI Tools",
    icon: Bot,
    link: "/admin/ai-tools"
  },

  {
    title: "AI Product Generator",
    icon: Sparkles,
    link: "/admin/ai-product-generator"
  },

  {
    title: "Page Builder",
    icon: AppWindow,
    link: "/admin/pagebuilder"
  },

  {
    title: "Pages",
    icon: FileText,
    link: "/admin/pages"
  },

  {
    title: "Homepage",
    icon: Home,
    link: "/admin/homepage"
  },

  {
    title: "Theme",
    icon: Palette,
    link: "/admin/theme"
  },

  {
    title: "Appearance",
    icon: Image,
    link: "/admin/appearance"
  },

  {
    title: "Navigation",
    icon: Network,
    link: "/admin/navigation"
  },

  {
    title: "Footer Builder",
    icon: Globe,
    link: "/admin/footer-builder"
  },

  {
    title: "Mobile App",
    icon: Smartphone,
    link: "/admin/mobile-app"
  },

  {
    title: "Storage",
    icon: Folder,
    link: "/admin/storage"
  },

  {
    title: "Storage Manager",
    icon: FolderCog,
    link: "/admin/storage-manager"
  },

  {
    title: "Database",
    icon: Database,
    link: "/admin/database"
  },

  {
    title: "Database Manager",
    icon: Server,
    link: "/admin/database-manager"
  },

  {
    title: "Firestore",
    icon: Cloud,
    link: "/admin/firestore"
  },

  {
    title: "Security",
    icon: Lock,
    link: "/admin/security"
  },

  {
    title: "Fraud Protection",
    icon: Shield,
    link: "/admin/fraud-protection"
  },

  {
    title: "Backups",
    icon: Folder,
    link: "/admin/backups"
  },

  {
    title: "Backup Restore",
    icon: FolderCog,
    link: "/admin/backup-restore"
  },

  {
    title: "Reports",
    icon: FileBarChart,
    link: "/admin/reports"
  },

  {
    title: "Logs",
    icon: ClipboardList,
    link: "/admin/logs"
  },

  {
    title: "System Logs",
    icon: FileSearch,
    link: "/admin/system-logs"
  },

  {
    title: "System",
    icon: Cpu,
    link: "/admin/system"
  },

  {
    title: "Settings",
    icon: Settings,
    link: "/admin/settings"
  },

  {
    title: "Customize",
    icon: Palette,
    link: "/admin/customize"
  },

  {
    title: "App Config",
    icon: Building2,
    link: "/admin/app-config"
  },

  {
    title: "Blogs",
    icon: Newspaper,
    link: "/admin/blogs"
  },

  {
    title: "FAQ",
    icon: CircleHelp,
    link: "/admin/faq"
  },

  {
    title: "Tickets",
    icon: Ticket,
    link: "/admin/tickets"
  },

  {
    title: "System Monitor",
    icon: Monitor,
    link: "/admin/system-monitor"
  },

  {
    title: "Reports Analytics",
    icon: FileBarChart,
    link: "/admin/reports-analytics"
  },

  {
    title: "Theme Builder",
    icon: Palette,
    link: "/admin/theme-builder"
  },

  {
    title: "Banner Manager",
    icon: GalleryVertical,
    link: "/admin/banner-manager"
  },

  {
    title: "Popup Manager",
    icon: AppWindow,
    link: "/admin/popup-manager"
  },

  {
    title: "AI Chatbot",
    icon: Brain,
    link: "/admin/ai-chatbot"
  },

  {
    title: "Admin Activity",
    icon: Activity,
    link: "/admin/admin-activity"
  }

];

export default function AllPagesPage() {

  return (

    <main className="min-h-screen bg-[#050505] p-4 text-white">

      {/* HEADER */}

      <div className="mb-8 flex items-center gap-4">

        <div className="flex h-16 w-16 items-center justify-center rounded-[30px] bg-cyan-500 shadow-lg shadow-cyan-500/30">

          <LayoutDashboard size={32} className="text-black" />

        </div>

        <div>

          <h1 className="text-4xl font-black tracking-tight">

            All Admin Pages

          </h1>

          <p className="mt-1 text-sm text-gray-400">

            Complete Admin Control Center

          </p>

        </div>

      </div>

      {/* GRID */}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">

        {pages.map((item, index) => {

          const Icon = item.icon;

          return (

            <Link
              key={index}
              href={item.link}
              className="group rounded-[30px] border border-white/10 bg-[#111111] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500 hover:bg-[#181818]"
            >

              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500 text-black shadow-lg shadow-cyan-500/20 transition-all duration-300 group-hover:rotate-6">

                <Icon size={30} />

              </div>

              <h2 className="mt-5 text-lg font-black leading-tight">

                {item.title}

              </h2>

              <p className="mt-2 text-sm text-gray-400">

                Open Admin Page

              </p>

            </Link>

          );

        })}

      </div>

    </main>

  );
}
