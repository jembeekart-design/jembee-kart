import Link from "next/link";
import { Video, ShieldCheck, GraduationCap, ChartNoAxesCombined, Users, Wallet, Megaphone, Smartphone } from "lucide-react";

const sections = [
  ["Video moderation", "Review creator submissions, reports and comments.", "/admin/moderation", ShieldCheck],
  ["Media library", "Manage approved videos and their metadata.", "/admin/media-library", Video],
  ["School learning", "Manage the learning catalog and video answers.", "/admin/education/schools", GraduationCap],
  ["Video analytics", "View video-platform metrics when connected.", "/admin/analytics", ChartNoAxesCombined],
  ["Creators and users", "Manage accounts and creator access.", "/admin/users", Users],
  ["Creator payouts", "Review settlement readiness; live payouts remain disabled.", "/admin/payouts", Wallet],
  ["Ad revenue", "Review verified video advertising revenue.", "/admin/monetag-revenue", Megaphone],
  ["Mobile apps", "Manage video-only mobile and Android TV app settings.", "/admin/mobile-app", Smartphone],
];
export default function AdminHomePage(){return <main className="min-h-screen bg-[#0b1220] p-5 text-white md:p-8"><div className="mx-auto max-w-6xl"><p className="text-sm font-bold uppercase tracking-[.2em] text-cyan-300">JEMBEE PLAY</p><h1 className="mt-2 text-4xl font-black">Video Platform Control Center</h1><p className="mt-3 max-w-2xl text-white/65">Manage videos, learning content, creators, moderation and platform operations. Manage the video platform, learning content, creators and moderation.</p><div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{sections.map(([title,description,href,Icon])=>{const I=Icon as typeof Video;return <Link key={String(href)} href={String(href)} className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10"><I size={25} className="text-cyan-300"/><h2 className="mt-4 text-lg font-bold">{String(title)}</h2><p className="mt-2 text-sm text-white/60">{String(description)}</p><span className="mt-4 inline-block text-sm font-bold text-cyan-300">Open →</span></Link>})}</div><p className="mt-8 rounded-xl border border-amber-300/20 bg-amber-300/5 p-4 text-sm text-amber-100">Safety: paid-video checkout and playback require verified Cashfree payment and entitlement checks. Creator payouts remain disabled until settlement tests and approval are complete.</p></div></main>}
