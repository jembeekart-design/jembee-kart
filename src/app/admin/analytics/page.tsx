import Link from "next/link";
const metrics = [
  ["Published videos", "Awaiting live Firestore metrics", "/admin/media-library"],
  ["Pending moderation", "Review the moderation queue", "/admin/moderation"],
  ["Paid video purchases", "Use verified Cashfree records", "/admin/cashfree"],
  ["Creator settlement", "Ledger review only; no live payout", "/admin/payouts"],
  ["School video answers", "Manage education content", "/admin/education/schools"],
  ["Ad revenue", "Review imported and verified revenue", "/admin/monetag-revenue"],
];
export default function AnalyticsPage(){return <main className="min-h-screen bg-[#0b1220] p-5 text-white md:p-8"><div className="mx-auto max-w-5xl"><h1 className="text-3xl font-black">JEMBEE PLAY Video Analytics</h1><p className="mt-2 text-sm text-white/60">No sample numbers are displayed. Live metrics must come from verified video-platform data.</p><div className="mt-7 grid gap-4 sm:grid-cols-2">{metrics.map(([title,detail,href])=><Link key={title} href={href} className="rounded-2xl border border-white/10 bg-white/5 p-5"><h2 className="text-lg font-bold">{title}</h2><p className="mt-2 text-sm text-white/60">{detail}</p><span className="mt-4 inline-block text-sm font-bold text-cyan-300">Open →</span></Link>)}</div></div></main>}
