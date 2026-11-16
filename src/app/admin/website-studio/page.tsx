"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ArrowDown, ArrowUp, Check, Eye, Palette, RotateCcw, Save, Sparkles } from "lucide-react";
import { db } from "@/firebase/config";

type HomeSectionKey = "learning" | "shorts" | "longVideos";
type HomeCategory = { id: string; label: string; filter: string; enabled: boolean };
type FeaturedCreator = { creatorId: string; label: string; enabled: boolean };
type FeaturedPlaylist = { id: string; title: string; description: string; videoIds: string[]; enabled: boolean };
type NavigationKey = "home" | "shorts" | "explore" | "learning" | "history" | "liked";
const DEFAULT_HOME_CATEGORIES: HomeCategory[] = [
  { id: "education", label: "Education", filter: "education", enabled: true },
  { id: "music", label: "Music", filter: "music", enabled: true },
  { id: "science", label: "Science", filter: "science", enabled: true },
  { id: "technology", label: "Technology", filter: "technology", enabled: true },
  { id: "gaming", label: "Gaming", filter: "gaming", enabled: true },
  { id: "travel", label: "Travel", filter: "travel", enabled: true },
];
const DEFAULT_NAVIGATION_LABELS: Record<NavigationKey, string> = {
  home: "Home", shorts: "Shorts", explore: "Explore", learning: "School Learning",
  history: "History", liked: "Liked videos",
};
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
  sectionOrder: ["learning", "shorts", "longVideos"] as HomeSectionKey[],
  homeCategories: DEFAULT_HOME_CATEGORIES,
  navigationLabels: DEFAULT_NAVIGATION_LABELS,
  featuredCreators: [] as FeaturedCreator[],
  featuredPlaylists: [] as FeaturedPlaylist[],
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
  sectionOrder: HomeSectionKey[];
  homeCategories: HomeCategory[];
  navigationLabels: Record<NavigationKey, string>;
  featuredCreators: FeaturedCreator[];
  featuredPlaylists: FeaturedPlaylist[];
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
          const validOrder = Array.isArray(stored.sectionOrder) ? stored.sectionOrder.filter((item): item is HomeSectionKey => item === "learning" || item === "shorts" || item === "longVideos") : DEFAULT_CONFIG.sectionOrder;
          const sectionOrder = [...new Set(validOrder)];
          for (const item of DEFAULT_CONFIG.sectionOrder) if (!sectionOrder.includes(item)) sectionOrder.push(item);
          const homeCategories = Array.isArray(stored.homeCategories)
            ? stored.homeCategories.filter((item): item is HomeCategory => !!item && typeof item === "object" && typeof item.id === "string" && typeof item.label === "string" && typeof item.filter === "string" && typeof item.enabled === "boolean").slice(0, 12)
            : DEFAULT_HOME_CATEGORIES;
          const navigationLabels = { ...DEFAULT_NAVIGATION_LABELS, ...(stored.navigationLabels && typeof stored.navigationLabels === "object" ? stored.navigationLabels : {}) };
          const featuredCreators = Array.isArray(stored.featuredCreators) ? stored.featuredCreators.filter((item): item is FeaturedCreator => !!item && typeof item.creatorId === "string" && typeof item.label === "string" && typeof item.enabled === "boolean").slice(0, 8) : [];
          const featuredPlaylists = Array.isArray(stored.featuredPlaylists) ? stored.featuredPlaylists.filter((item): item is FeaturedPlaylist => !!item && typeof item.id === "string" && typeof item.title === "string" && typeof item.description === "string" && Array.isArray(item.videoIds) && item.videoIds.every((id) => typeof id === "string") && typeof item.enabled === "boolean").slice(0, 8) : [];
          const next = { ...DEFAULT_CONFIG, ...stored, sectionOrder, homeCategories, navigationLabels, featuredCreators, featuredPlaylists };
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

  const [newCategoryLabel, setNewCategoryLabel] = useState("");
  const [newCategoryFilter, setNewCategoryFilter] = useState("");
  const [newCreatorId, setNewCreatorId] = useState("");
  const [newCreatorLabel, setNewCreatorLabel] = useState("");
  const [newPlaylistTitle, setNewPlaylistTitle] = useState("");
  const [newPlaylistDescription, setNewPlaylistDescription] = useState("");
  const [newPlaylistVideoIds, setNewPlaylistVideoIds] = useState("");

  function updateCategory(id: string, patch: Partial<HomeCategory>) {
    setConfig((current) => ({ ...current, homeCategories: current.homeCategories.map((item) => item.id === id ? { ...item, ...patch } : item) }));
    setNotice("");
  }

  function addCategory() {
    const label = newCategoryLabel.trim().slice(0, 24);
    const filter = (newCategoryFilter.trim() || label).slice(0, 40);
    const slug = label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const id = slug || `category-${crypto.randomUUID().slice(0, 8)}`;
    if (!label || !filter || !id || config.homeCategories.length >= 12 || config.homeCategories.some((item) => item.id === id)) return;
    setConfig((current) => ({ ...current, homeCategories: [...current.homeCategories, { id, label, filter, enabled: true }] }));
    setNewCategoryLabel("");
    setNewCategoryFilter("");
    setNotice("");
  }

  function moveCategory(id: string, direction: -1 | 1) {
    setConfig((current) => {
      const index = current.homeCategories.findIndex((item) => item.id === id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= current.homeCategories.length) return current;
      const homeCategories = [...current.homeCategories];
      [homeCategories[index], homeCategories[target]] = [homeCategories[target], homeCategories[index]];
      return { ...current, homeCategories };
    });
    setNotice("");
  }

  function updateNavigationLabel(key: NavigationKey, value: string) {
    setConfig((current) => ({ ...current, navigationLabels: { ...current.navigationLabels, [key]: value.slice(0, 32) } }));
    setNotice("");
  }

  function addFeaturedCreator() {
    const creatorId = newCreatorId.trim().slice(0, 128);
    const label = newCreatorLabel.trim().slice(0, 48);
    if (!creatorId || !label || config.featuredCreators.length >= 8 || config.featuredCreators.some((item) => item.creatorId === creatorId)) return;
    setConfig((current) => ({ ...current, featuredCreators: [...current.featuredCreators, { creatorId, label, enabled: true }] }));
    setNewCreatorId("");
    setNewCreatorLabel("");
    setNotice("");
  }

  function updateFeaturedCreator(creatorId: string, patch: Partial<FeaturedCreator>) {
    setConfig((current) => ({ ...current, featuredCreators: current.featuredCreators.map((item) => item.creatorId === creatorId ? { ...item, ...patch } : item) }));
    setNotice("");
  }

  function addFeaturedPlaylist() {
    const title = newPlaylistTitle.trim().slice(0, 60);
    const description = newPlaylistDescription.trim().slice(0, 120);
    const videoIds = [...new Set(newPlaylistVideoIds.split(/[\\s,]+/).map((id) => id.trim()).filter(Boolean))].slice(0, 12);
    const id = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `playlist-${crypto.randomUUID().slice(0, 8)}`;
    if (!title || !videoIds.length || config.featuredPlaylists.length >= 8 || config.featuredPlaylists.some((item) => item.id === id)) return;
    setConfig((current) => ({ ...current, featuredPlaylists: [...current.featuredPlaylists, { id, title, description, videoIds, enabled: true }] }));
    setNewPlaylistTitle("");
    setNewPlaylistDescription("");
    setNewPlaylistVideoIds("");
    setNotice("");
  }

  function updateFeaturedPlaylist(id: string, patch: Partial<FeaturedPlaylist>) {
    setConfig((current) => ({ ...current, featuredPlaylists: current.featuredPlaylists.map((item) => item.id === id ? { ...item, ...patch } : item) }));
    setNotice("");
  }

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

            <section className="rounded-3xl border border-white/10 bg-[#111827] p-5 sm:p-7">
              <h2 className="text-lg font-bold">Category & Navigation Manager</h2>
              <p className="mt-1 text-xs text-slate-400">Home category chips का नाम, filter, क्रम और visibility नियंत्रित करें। अधिकतम 12 categories।</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="text-xs font-semibold text-slate-400">Category label<input value={newCategoryLabel} maxLength={24} onChange={(event) => setNewCategoryLabel(event.target.value)} placeholder="e.g. Mathematics" className="mt-1 min-h-11 w-full rounded-xl border border-white/10 bg-[#090d16] px-3 text-sm text-white"/></label>
                <label className="text-xs font-semibold text-slate-400">Video search filter<input value={newCategoryFilter} maxLength={40} onChange={(event) => setNewCategoryFilter(event.target.value)} placeholder="e.g. maths" className="mt-1 min-h-11 w-full rounded-xl border border-white/10 bg-[#090d16] px-3 text-sm text-white"/></label>
              </div>
              <button type="button" onClick={addCategory} disabled={config.homeCategories.length >= 12 || !newCategoryLabel.trim()} className="mt-3 rounded-xl bg-cyan-300 px-4 py-2 text-sm font-bold text-slate-950 disabled:opacity-40">Add category</button>
              <div className="mt-4 space-y-2">
                {config.homeCategories.map((item, index) => <div key={item.id} className="grid gap-2 rounded-xl border border-white/10 bg-[#090d16] p-3 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-center">
                  <input aria-label={`Category ${index + 1} label`} value={item.label} maxLength={24} onChange={(event) => updateCategory(item.id, { label: event.target.value })} className="min-h-10 min-w-0 rounded-lg border border-white/10 bg-[#111827] px-2 text-sm"/>
                  <input aria-label={`Category ${index + 1} filter`} value={item.filter} maxLength={40} onChange={(event) => updateCategory(item.id, { filter: event.target.value })} className="min-h-10 min-w-0 rounded-lg border border-white/10 bg-[#111827] px-2 text-sm"/>
                  <div className="flex items-center gap-1"><button type="button" aria-label={`Move category ${item.label} up`} disabled={index === 0} onClick={() => moveCategory(item.id, -1)} className="rounded-lg border border-white/10 p-2 disabled:opacity-30"><ArrowUp size={14}/></button><button type="button" aria-label={`Move category ${item.label} down`} disabled={index === config.homeCategories.length - 1} onClick={() => moveCategory(item.id, 1)} className="rounded-lg border border-white/10 p-2 disabled:opacity-30"><ArrowDown size={14}/></button></div>
                  <div className="flex items-center justify-between gap-3"><label className="flex items-center gap-2 text-xs text-slate-300"><input type="checkbox" checked={item.enabled} onChange={(event) => updateCategory(item.id, { enabled: event.target.checked })}/>Show</label><button type="button" onClick={() => setConfig((current) => ({ ...current, homeCategories: current.homeCategories.filter((category) => category.id !== item.id) }))} className="text-xs text-rose-300">Remove</button></div>
                </div>)}
              </div>
              <div className="mt-6 border-t border-white/10 pt-5">
                <h3 className="text-sm font-bold">Main navigation labels</h3>
                <p className="mt-1 text-xs text-slate-500">इन labels से मुख्य menu का text बदलेगा; सुरक्षित routes नहीं बदलेंगे।</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {(["home", "shorts", "explore", "learning", "history", "liked"] as NavigationKey[]).map((key) => <label key={key} className="text-xs font-semibold capitalize text-slate-400">{key}<input value={config.navigationLabels[key]} maxLength={32} onChange={(event) => updateNavigationLabel(key, event.target.value)} className="mt-1 min-h-10 w-full rounded-lg border border-white/10 bg-[#090d16] px-3 text-sm text-white"/></label>)}
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-[#111827] p-5 sm:p-7">
              <h2 className="text-lg font-bold">Featured Creators</h2>
              <p className="mt-1 text-xs text-slate-400">Creator का वास्तविक user ID डालें। Home पर उसी creator के उपलब्ध public videos दिखेंगे। अधिकतम 8 creators।</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <input value={newCreatorId} maxLength={128} onChange={(event) => setNewCreatorId(event.target.value)} placeholder="Creator user ID" aria-label="Creator user ID" className="min-h-11 rounded-xl border border-white/10 bg-[#090d16] px-3 text-sm"/>
                <input value={newCreatorLabel} maxLength={48} onChange={(event) => setNewCreatorLabel(event.target.value)} placeholder="Display label" aria-label="Creator display label" className="min-h-11 rounded-xl border border-white/10 bg-[#090d16] px-3 text-sm"/>
              </div>
              <button type="button" onClick={addFeaturedCreator} disabled={!newCreatorId.trim() || !newCreatorLabel.trim() || config.featuredCreators.length >= 8} className="mt-3 rounded-xl bg-cyan-300 px-4 py-2 text-sm font-bold text-slate-950 disabled:opacity-40">Add creator</button>
              <div className="mt-4 space-y-2">{config.featuredCreators.map((item) => <div key={item.creatorId} className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-[#090d16] p-3"><div className="min-w-0 flex-1"><p className="text-sm font-semibold">{item.label}</p><p className="truncate text-xs text-slate-500">{item.creatorId}</p></div><label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={item.enabled} onChange={(event) => updateFeaturedCreator(item.creatorId, { enabled: event.target.checked })}/>Show</label><button type="button" onClick={() => setConfig((current) => ({ ...current, featuredCreators: current.featuredCreators.filter((creator) => creator.creatorId !== item.creatorId) }))} className="text-xs text-rose-300">Remove</button></div>)}</div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-[#111827] p-5 sm:p-7">
              <h2 className="text-lg font-bold">Featured Playlists</h2>
              <p className="mt-1 text-xs text-slate-400">एक playlist में approved public video IDs जोड़ें। IDs comma या space से अलग करें; अधिकतम 12 videos और 8 playlists।</p>
              <div className="mt-4 grid gap-3">
                <input value={newPlaylistTitle} maxLength={60} onChange={(event) => setNewPlaylistTitle(event.target.value)} placeholder="Playlist title" aria-label="Playlist title" className="min-h-11 rounded-xl border border-white/10 bg-[#090d16] px-3 text-sm"/>
                <input value={newPlaylistDescription} maxLength={120} onChange={(event) => setNewPlaylistDescription(event.target.value)} placeholder="Short description (optional)" aria-label="Playlist description" className="min-h-11 rounded-xl border border-white/10 bg-[#090d16] px-3 text-sm"/>
                <textarea value={newPlaylistVideoIds} onChange={(event) => setNewPlaylistVideoIds(event.target.value)} rows={3} placeholder="Paste public video IDs, separated by commas" aria-label="Playlist video IDs" className="rounded-xl border border-white/10 bg-[#090d16] px-3 py-2 text-sm"/>
              </div>
              <button type="button" onClick={addFeaturedPlaylist} disabled={!newPlaylistTitle.trim() || !newPlaylistVideoIds.trim() || config.featuredPlaylists.length >= 8} className="mt-3 rounded-xl bg-cyan-300 px-4 py-2 text-sm font-bold text-slate-950 disabled:opacity-40">Add playlist</button>
              <div className="mt-4 space-y-2">{config.featuredPlaylists.map((item) => <div key={item.id} className="rounded-xl border border-white/10 bg-[#090d16] p-3"><div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold">{item.title}</p><div className="flex items-center gap-3"><label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={item.enabled} onChange={(event) => updateFeaturedPlaylist(item.id, { enabled: event.target.checked })}/>Show</label><button type="button" onClick={() => setConfig((current) => ({ ...current, featuredPlaylists: current.featuredPlaylists.filter((playlist) => playlist.id !== item.id) }))} className="text-xs text-rose-300">Remove</button></div></div><p className="mt-1 text-xs text-slate-500">{item.videoIds.length} video IDs · {item.description}</p></div>)}</div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-[#111827] p-5 sm:p-7">
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
                <div className="flex items-center justify-between gap-2"><div className="text-lg font-black tracking-tight">{config.siteName}<span className="ml-1 text-xs" style={{ color: config.primaryColor }}>▶</span></div><span className="rounded-full px-3 py-1 text-[10px] font-bold text-slate-950" style={{ backgroundColor: config.primaryColor }}>{config.navigationLabels.explore}</span></div>
                <p className="mt-1 text-[10px] text-slate-400">{config.tagline}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">{config.homeCategories.filter((item) => item.enabled).map((item) => <span key={item.id} className="rounded-full px-2.5 py-1 text-[9px] font-semibold" style={{ backgroundColor: config.surfaceColor }}>{item.label}</span>)}</div>
                {config.announcementEnabled && config.announcementText ? <div className="mt-4 rounded-lg px-3 py-2 text-xs font-semibold text-slate-950" style={{ backgroundColor: config.primaryColor }}>{config.announcementText}</div> : null}
                {config.sectionOrder.map((key) => {
                  if (key === "learning" && config.showLearningBanner) return <div key={key} className="mt-5 rounded-2xl border p-4" style={{ borderColor: config.primaryColor + "55", background: "linear-gradient(120deg, " + config.surfaceColor + ", " + config.accentColor + "22)" }}><p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: config.primaryColor }}>Learning</p><h3 className="mt-2 text-base font-black leading-snug">{config.heroTitle}</h3><p className="mt-2 text-[10px] leading-4 text-slate-300">{config.heroSubtitle}</p></div>;
                  if (key === "shorts" && config.showShorts) return <div key={key} className="mt-5"><p className="text-xs font-bold">Shorts</p><div className="mt-2 grid grid-cols-3 gap-2">{[1,2,3].map((item) => <div key={item} className="aspect-[3/4] rounded-xl" style={{ background: "linear-gradient(145deg, " + config.accentColor + "99, " + config.surfaceColor + ")" }}/>)}</div></div>;
                  if (key === "longVideos" && config.showLongVideos) return <div key={key} className="mt-5"><p className="text-xs font-bold">Videos for you</p><div className="mt-2 aspect-video rounded-xl" style={{ background: "linear-gradient(120deg, " + config.surfaceColor + ", " + config.primaryColor + "44)" }}/></div>;
                  return null;
                })}
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
