"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ArrowDown, ArrowUp, Check, Eye, Palette, RotateCcw, Save, Sparkles } from "lucide-react";
import { db } from "@/firebase/config";

type HomeSectionKey = "learning" | "shorts" | "longVideos";
const HOME_SECTIONS: { key: HomeSectionKey; label: string; description: string }[] = [
  { key: "learning", label: "Learning banner", description: "School and textbook learning entry point" },
  { key: "shorts", label: "Shorts", description: "Short-form video feed preview" },
  { key: "longVideos", label: "Long videos", description: "Latest long-form videos grid" },
];
const DEFAULT_CONFIG = {
  siteName: "JEMBEE PLAY",
  tagline: "Watch • Learn • Create • Share",
  heroTitle: "अपनी किताब का हर सवाल सीखें",
  heroSubtitle: "अपनी class, book और chapter चुनें और सही video answer खोजें।",
  primaryColor: "#22d3ee",
  accentColor: "#8b5cf6",
  pageColor: "#090d16",
  surfaceColor: "#111827",
  announcementEnabled: false,
  announcementText: "",
  showLearningBanner: true,
  showShorts: true,
  showLongVideos: true,
  showHomeAds: true,
  compactCards: false,
};

type SiteExperience = {
  siteName: string;
  tagline: string;
  heroTitle: string;
  heroSubtitle: string;
  primaryColor: string;
  accentColor: string;
  pageColor: string;
  surfaceColor: string;
  announcementEnabled: boolean;
  announcementText: string;
  showLearningBanner: boolean;
  showShorts: boolean;
  showLongVideos: boolean;
  showHomeAds: boolean;
  compactCards: boolean;
};
type ToggleKey = "announcementEnabled" | "showLearningBanner" | "showShorts" | "showLongVideos" | "showHomeAds" | "compactCards";
type TextKey = "siteName" | "tagline" | "heroTitle" | "heroSubtitle" | "announcementText";
type ColorKey = "primaryColor" | "accentColor" | "pageColor" | "surfaceColor";

const COLOR_FIELDS: { key: ColorKey; label: string }[] = [
  { key: "primaryColor", label: "Primary brand colour" },
  { key: "accentColor", label: "Accent colour" },
  { key: "pageColor", label: "Page background" },
  { key: "surfaceColor", label: "Card / surface colour" },
];

const TOGGLES: { key: ToggleKey; title: string; description: string }[] = [
  { key: "announcementEnabled", title: "Top announcement", description: "Show or hide the announcement strip on the website." },
  { key: "showLearningBanner", title: "Learning banner", description: "Control the School Learning entry banner on Home." },
  { key: "showShorts", title: "Shorts section", description: "Show or hide the Shorts feed section on Home." },
  { key: "showLongVideos", title: "Long videos section", description: "Show or hide the long-form video section on Home." },
  { key: "showHomeAds", title: "Home ad placements", description: "Allow configured ad placements on the Home page. This does not create ad approval or guarantee ad delivery." },
  { key: "compactCards", title: "Compact video cards", description: "Use a denser card layout on supported video grids." },
];

function applyBrand(config: SiteExperience) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.style.setProperty("--primary-color", config.primaryColor);
  root.style.setProperty("--secondary-color", config.accentColor);
  root.style.setProperty("--background-color", config.pageColor);
  root.style.setProperty("--card-color", config.surfaceColor);
  root.style.setProperty("--color-primary-button", config.primaryColor);
  root.style.setProperty("--color-secondary-button", config.accentColor);
  root.style.setProperty("--color-page-background", config.pageColor);
  root.style.setProperty("--color-card-background", config.surfaceColor);
}

export default function WebsiteStudioPage() {
  const [config, setConfig] = useState<SiteExperience>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getDoc(doc(db, "admin_settings", "site_experience"))
      .then((snapshot) => {
        if (!active) return;
        if (snapshot.exists()) {
          const stored = snapshot.data() as Partial<SiteExperience>;
          const validOrder = Array.isArray(stored.sectionOrder) ? stored.sectionOrder.filter((item): item is HomeSectionKey => item === "learning" || item === "shorts" || item === "longVideos") : DEFAULT_CONFIG.sectionOrder;\n          const sectionOrder = [...new Set(validOrder)];\n          for (const item of DEFAULT_CONFIG.sectionOrder) if (!sectionOrder.includes(item)) sectionOrder.push(item);\n          const next = { ...DEFAULT_CONFIG, ...stored, sectionOrder };
          setConfig(next);
          applyBrand(next);
        } else {
          applyBrand(DEFAULT_CONFIG);
        }
      })
      .catch(() => {
        if (active) setError("Settings load नहीं हो पाईं। Firestore access और connection जाँचें।");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  function updateText(key: TextKey, value: string) {
    setConfig((current) => ({ ...current, [key]: value }));
    setNotice("");
  }

  function updateColor(key: ColorKey, value: string) {
    if (!/^#[0-9a-fA-F]{6}$/.test(value)) return;
    const next = { ...config, [key]: value };
    setConfig(next);
    applyBrand(next);
    setNotice("");
  }

  function updateToggle(key: ToggleKey, value: boolean) {
    setConfig((current) => ({ ...current, [key]: value }));
    setNotice("");
  }

  function moveSection(key: HomeSectionKey, direction: -1 | 1) {
    const currentIndex = config.sectionOrder.indexOf(key);
    const targetIndex = currentIndex + direction;
    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= config.sectionOrder.length) return;
    const sectionOrder = [...config.sectionOrder];
    [sectionOrder[currentIndex], sectionOrder[targetIndex]] = [sectionOrder[targetIndex], sectionOrder[currentIndex]];
    setConfig((current) => ({ ...current, sectionOrder }));
    setNotice("");
  }

  async function saveSettings() {
    if (!config.siteName.trim() || !config.heroTitle.trim()) {
      setError("Website name और Home headline खाली नहीं हो सकते।");
      return;
    }
    if (config.announcementText.length > 180) {
      setError("Announcement 180 characters से छोटा रखें।");
      return;
    }
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await setDoc(doc(db, "admin_settings", "site_experience"), {
        ...config,
        updatedAt: new Date().toISOString(),
        schemaVersion: 1,
      }, { merge: true });
      applyBrand(config);
      setNotice("Website experience settings save हो गईं।");
    } catch {
      setError("Save नहीं हुआ। Admin permission और Firestore rules जाँचें।");
    } finally {
      setSaving(false);
    }
  }

  function resetDraft() {
    setConfig(DEFAULT_CONFIG);
    applyBrand(DEFAULT_CONFIG);
    setError("");
    setNotice("Default preview लागू है। इसे स्थायी करने के लिए Save changes दबाएँ।");
  }

  if (loading) {
    return <main className="grid min-h-[60vh] place-items-center bg-[#090d16] text-slate-300"><p>Website Studio loading…</p></main>;
  }

  return (
    <main className="min-h-screen bg-[#090d16] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.24em] text-cyan-300"><Sparkles size={15}/> JEMBEE PLAY · CONTROL ROOM</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Website Studio</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Brand identity, Home page sections और visitor announcements को एक जगह से manage करें।</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={resetDraft} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/15 px-4 text-sm font-semibold text-slate-200 hover:bg-white/5"><RotateCcw size={16}/> Reset preview</button>
            <button type="button" onClick={saveSettings} disabled={saving} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-cyan-300 px-5 text-sm font-black text-slate-950 hover:bg-cyan-200 disabled:opacity-60"><Save size={17}/>{saving ? "Saving…" : "Save changes"}</button>
          </div>
        </header>

        {error ? <p role="alert" className="mb-5 rounded-xl border border-rose-400/30 bg-rose-400/10 p-3 text-sm text-rose-200">{error}</p> : null}
        {notice ? <p role="status" className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-400/25 bg-emerald-400/10 p-3 text-sm text-emerald-200"><Check size={17}/>{notice}</p> : null}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-6">
            <section className="rounded-3xl border border-white/10 bg-[#111827] p-5 sm:p-7">
              <div className="mb-6 flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-300/10 text-cyan-300"><Palette size={20}/></span><div><h2 className="text-lg font-bold">Brand identity</h2><p className="text-xs text-slate-400">नाम, tagline और visual theme</p></div></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-semibold text-slate-300">Website name<input maxLength={40} value={config.siteName} onChange={(event) => updateText("siteName", event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-white/10 bg-[#090d16] px-4 text-white outline-none focus:border-cyan-300"/></label>
                <label className="block text-sm font-semibold text-slate-300">Tagline<input maxLength={80} value={config.tagline} onChange={(event) => updateText("tagline", event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-white/10 bg-[#090d16] px-4 text-white outline-none focus:border-cyan-300"/></label>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {COLOR_FIELDS.map(({ key, label }) => <label key={key} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#090d16] p-4"><span className="text-sm font-medium text-slate-300">{label}</span><span className="flex items-center gap-3"><span className="font-mono text-xs text-slate-500">{config[key]}</span><input aria-label={label} type="color" value={config[key]} onChange={(event) => updateColor(key, event.target.value)} className="h-10 w-12 cursor-pointer rounded-lg border-0 bg-transparent"/></span></label>)}
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-[#111827] p-5 sm:p-7">
              <div className="mb-6"><h2 className="text-lg font-bold">Home page content</h2><p className="mt-1 text-xs text-slate-400">Hero headline, description और section visibility</p></div>
              <label className="block text-sm font-semibold text-slate-300">Learning headline<input maxLength={100} value={config.heroTitle} onChange={(event) => updateText("heroTitle", event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-white/10 bg-[#090d16] px-4 text-white outline-none focus:border-cyan-300"/></label>
              <label className="mt-4 block text-sm font-semibold text-slate-300">Learning description<textarea maxLength={220} rows={3} value={config.heroSubtitle} onChange={(event) => updateText("heroSubtitle", event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#090d16] px-4 py-3 text-white outline-none focus:border-cyan-300"/></label>
              <div className="mt-6 divide-y divide-white/10">
                {TOGGLES.filter((item) => item.key !== "announcementEnabled").map((item) => <label key={item.key} className="flex cursor-pointer items-center justify-between gap-4 py-4"><span><span className="block text-sm font-semibold">{item.title}</span><span className="mt-1 block text-xs leading-5 text-slate-500">{item.description}</span></span><input type="checkbox" checked={config[item.key]} onChange={(event) => updateToggle(item.key, event.target.checked)} className="h-5 w-5 shrink-0 accent-cyan-300"/></label>)}
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-[#111827] p-5 sm:p-7">
            <section className="rounded-3xl border border-white/10 bg-[#111827] p-5 sm:p-7">
              <h2 className="text-lg font-bold">Home page layout</h2>
              <p className="mt-1 text-xs text-slate-400">Visitors को sections इसी क्रम में दिखाई देंगे। ऊपर/नीचे करके क्रम बदलें।</p>
              <div className="mt-5 space-y-3">
                {config.sectionOrder.map((key, index) => {
                  const section = HOME_SECTIONS.find((item) => item.key === key);
                  if (!section) return null;
                  return <div key={key} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#090d16] p-3">
                    <div><p className="text-sm font-semibold">{index + 1}. {section.label}</p><p className="mt-1 text-xs text-slate-500">{section.description}</p></div>
                    <div className="flex gap-1">
                      <button type="button" aria-label={`Move ${section.label} up`} disabled={index === 0} onClick={() => moveSection(key, -1)} className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 hover:bg-white/10 disabled:opacity-30"><ArrowUp size={16}/></button>
                      <button type="button" aria-label={`Move ${section.label} down`} disabled={index === config.sectionOrder.length - 1} onClick={() => moveSection(key, 1)} className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 hover:bg-white/10 disabled:opacity-30"><ArrowDown size={16}/></button>
                    </div>
                  </div>;
                })}
              </div>
            </section>

              <h2 className="text-lg font-bold">Announcement bar</h2>
              <p className="mt-1 text-xs text-slate-400">Maintenance notice, launch message या important update</p>
              <label className="mt-5 flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-[#090d16] p-4"><span className="text-sm font-semibold">Enable announcement</span><input type="checkbox" checked={config.announcementEnabled} onChange={(event) => updateToggle("announcementEnabled", event.target.checked)} className="h-5 w-5 accent-cyan-300"/></label>
              <label className="mt-4 block text-sm font-semibold text-slate-300">Announcement text<input maxLength={180} value={config.announcementText} onChange={(event) => updateText("announcementText", event.target.value)} placeholder="Welcome to JEMBEE PLAY…" className="mt-2 min-h-12 w-full rounded-xl border border-white/10 bg-[#090d16] px-4 text-white outline-none focus:border-cyan-300"/></label>
              <p className="mt-2 text-right text-xs text-slate-500">{config.announcementText.length}/180</p>
            </section>
          </div>

          <aside className="space-y-5">
            <section className="sticky top-5 overflow-hidden rounded-3xl border border-white/10 bg-[#111827]">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4"><span className="flex items-center gap-2 text-sm font-bold"><Eye size={16} className="text-cyan-300"/> Live preview</span><span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">Draft</span></div>
              <div className="p-5" style={{ backgroundColor: config.pageColor }}>
                <div className="flex items-center justify-between gap-2"><div className="text-lg font-black tracking-tight">{config.siteName}<span className="ml-1 text-xs" style={{ color: config.primaryColor }}>▶</span></div><span className="rounded-full px-3 py-1 text-[10px] font-bold text-slate-950" style={{ backgroundColor: config.primaryColor }}>Explore</span></div>
                <p className="mt-1 text-[10px] text-slate-400">{config.tagline}</p>
                {config.announcementEnabled && config.announcementText ? <div className="mt-4 rounded-lg px-3 py-2 text-xs font-semibold text-slate-950" style={{ backgroundColor: config.primaryColor }}>{config.announcementText}</div> : null}
                {config.showLearningBanner ? <div className="mt-5 rounded-2xl border p-4" style={{ borderColor: config.primaryColor + "55", background: "linear-gradient(120deg, " + config.surfaceColor + ", " + config.accentColor + "22)" }}><p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: config.primaryColor }}>Learning</p><h3 className="mt-2 text-base font-black leading-snug">{config.heroTitle}</h3><p className="mt-2 text-[10px] leading-4 text-slate-300">{config.heroSubtitle}</p></div> : null}
                {config.showShorts ? <div className="mt-5"><p className="text-xs font-bold">Shorts</p><div className="mt-2 grid grid-cols-3 gap-2">{[1,2,3].map((item) => <div key={item} className="aspect-[3/4] rounded-xl" style={{ background: "linear-gradient(145deg, " + config.accentColor + "99, " + config.surfaceColor + ")" }}/>)}</div></div> : null}
                {config.showLongVideos ? <div className="mt-5"><p className="text-xs font-bold">Videos for you</p><div className="mt-2 aspect-video rounded-xl" style={{ background: "linear-gradient(120deg, " + config.surfaceColor + ", " + config.primaryColor + "44)" }}/></div> : null}
              </div>
              <p className="border-t border-white/10 px-5 py-3 text-[11px] leading-5 text-slate-500">Preview updates as you edit. Save changes to publish supported settings on the Home page.</p>
            </section>
            <div className="rounded-2xl border border-amber-300/20 bg-amber-300/5 p-4 text-xs leading-5 text-amber-100/80"><strong className="text-amber-100">Safety controls stay protected.</strong> This studio cannot enable payouts, bypass video moderation, approve paid checkout, or change payment verification rules.</div>
          </aside>
        </div>
      </div>
    </main>
  );
}
