export function MonetagGlobalControl() {
  return (
    <section className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-black">Monetag serving mode</h2>
        <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-700">MANUAL PLACEMENTS ONLY</span>
      </div>
      <p className="text-sm leading-6 text-[var(--text-muted)]">
        पूरी वेबसाइट पर चलने वाला Monetag auto-tag बंद है। Ads Manager में चुने गए page slots पर ही Monetag Direct Link card दिखेगा। User के click के बिना कोई ad window या redirect नहीं खुलेगा।
      </p>
    </section>
  );
}
