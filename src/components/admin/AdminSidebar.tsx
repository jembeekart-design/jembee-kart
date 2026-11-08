"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Video, ShieldCheck, GraduationCap, ChartNoAxesCombined, Users, Bell, Wallet, Smartphone, HardDrive, Settings, Radio, Megaphone, FileVideo } from "lucide-react";

const items = [
  ["Dashboard", "/admin", LayoutDashboard], ["Video moderation", "/admin/moderation", ShieldCheck],
  ["Media library", "/admin/media-library", FileVideo], ["School learning", "/admin/education/schools", GraduationCap],
  ["Video analytics", "/admin/analytics", ChartNoAxesCombined], ["Creator payouts (review only)", "/admin/payouts", Wallet],
  ["Ad revenue", "/admin/monetag-revenue", Megaphone], ["Shorts expenses", "/admin/shorts-expenses", Video],
  ["Live streams", "/admin/live-stream", Radio], ["Users", "/admin/users", Users],
  ["Notifications", "/admin/notifications", Bell], ["Mobile app", "/admin/mobile-app", Smartphone],
  ["Storage", "/admin/storage", HardDrive], ["Security", "/admin/security", ShieldCheck], ["Settings", "/admin/settings", Settings],
] as const;

export default function AdminSidebar() {
  const pathname = usePathname();
  return <aside className="hidden h-screen w-[280px] shrink-0 overflow-y-auto border-r border-white/10 bg-[#101827] p-5 text-white lg:block"><Link href="/admin" className="mb-8 block"><h1 className="text-2xl font-black">JEMBEE PLAY</h1><p className="text-sm text-white/60">Video Platform Admin</p></Link><nav className="space-y-2">{items.map(([label,href,Icon])=><Link key={href} href={href} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold ${pathname===href?"bg-cyan-400 text-slate-950":"text-white/80 hover:bg-white/10"}`}><Icon size={19}/>{label}</Link>)}</nav></aside>;
}
