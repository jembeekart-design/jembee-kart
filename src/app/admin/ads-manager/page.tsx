"use client";

import { useEffect, useMemo, useState } from "react";
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getFirestore,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import {
  Megaphone,
  Eye,
  MousePointerClick,
  TrendingUp,
  Search,
  Plus,
  BadgeDollarSign,
  Globe,
  Sparkles,
  PlayCircle,
  X,
  Trash2,
  Pause,
  Play,
} from "lucide-react";

export const dynamic = "force-dynamic";

type AdStatus = "Running" | "Paused" | "Completed";

interface Ad {
  id: string;
  title: string;
  platform: string;
  pricingModel: "CPC" | "CPM";
  rate: number;
  remainingBudget: number;
  budget: number;
  status: AdStatus;
  impressions: number;
  clicks: number;
  revenue: number;
  url?: string;
  createdAt?: unknown;
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const firebaseApp =
  getApps().length > 0
    ? getApp()
    : initializeApp(firebaseConfig);

const db = getFirestore(firebaseApp);

const adsCollection = collection(db, "ads");

function money(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

function number(value: number) {
  return value.toLocaleString("en-IN");
}

export default function AdsManagerPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showCreate, setShowCreate] = useState(false);

  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [platform, setPlatform] = useState("Google Ads");
  const [pricingModel, setPricingModel] = useState<"CPC" | "CPM">("CPC");
  const [rate, setRate] = useState("");
  const [budget, setBudget] = useState("");
  const [impressions, setImpressions] = useState("0");
  const [clicks, setClicks] = useState("0");
  const [revenue, setRevenue] = useState("0");
  const [saving, setSaving] = useState(false);

  /*
   * REAL-TIME FIRESTORE CONNECTION
   *
   * Collection:
   * ads
   */
  useEffect(() => {
    setLoading(true);

    const unsubscribe = onSnapshot(
      adsCollection,
      (snapshot) => {
        const data: Ad[] = snapshot.docs.map((item) => {
          const raw = item.data();

          return {
            id: item.id,
            title: String(raw.title ?? ""),
            platform: String(raw.platform ?? ""),
            budget: Number(raw.budget ?? 0),
            status:
              raw.status === "Paused"
                ? "Paused"
                : raw.status === "Completed"
                ? "Completed"
                : "Running",
            impressions: Number(raw.impressions ?? 0),
            clicks: Number(raw.clicks ?? 0),
            revenue: Number(raw.revenue ?? 0),
            pricingModel:
              raw.pricingModel === "CPM" ? "CPM" : "CPC",
            rate: Number(raw.rate ?? 0),
            remainingBudget: Number(
              raw.remainingBudget ?? raw.budget ?? 0
            ),
            url: String(raw.url ?? ""),
            createdAt: raw.createdAt,
          };
        });

        setAds(data);
        setError("");
        setLoading(false);
      },
      (err) => {
        console.error("Ads Firestore error:", err);
        setError(
          "Ads collection connect nahi ho pa rahi. Firebase configuration / Firestore rules check karein."
        );
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const filteredAds = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return ads;

    return ads.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.platform.toLowerCase().includes(q) ||
        item.status.toLowerCase().includes(q)
    );
  }, [ads, search]);

  const activeAds = ads.filter(
    (item) => item.status === "Running"
  ).length;

  const totalImpressions = ads.reduce(
    (sum, item) => sum + item.impressions,
    0
  );

  const totalClicks = ads.reduce(
    (sum, item) => sum + item.clicks,
    0
  );

  const totalRevenue = ads.reduce(
    (sum, item) => sum + item.revenue,
    0
  );

  async function createAd() {
    if (!title.trim()) {
      alert("Ad title required hai.");
      return;
    }

    if (!url.trim()) {
      alert("Destination URL required hai.");
      return;
    }

    if (Number(rate) <= 0) {
      alert("CPC/CPM rate required hai.");
      return;
    }

    if (Number(budget) <= 0) {
      alert("Budget required hai.");
      return;
    }

    setSaving(true);

    try {
      await addDoc(adsCollection, {
        title: title.trim(),
        url: url.trim(),
        platform,
        budget: Number(budget) || 0,
        status: "Running",
        impressions: Number(impressions) || 0,
        clicks: Number(clicks) || 0,
        revenue: Number(revenue) || 0,
        pricingModel,
        rate: Number(rate) || 0,
        remainingBudget: Number(budget) || 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setTitle("");
      setUrl("");
      setPricingModel("CPC");
      setRate("");
      setBudget("");
      setImpressions("0");
      setClicks("0");
      setRevenue("0");
      setPlatform("Google Ads");
      setShowCreate(false);
    } catch (err) {
      console.error(err);
      alert("Ad create nahi hua. Firestore rules check karein.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(ad: Ad) {
    const nextStatus: AdStatus =
      ad.status === "Running" ? "Paused" : "Running";

    try {
      await updateDoc(doc(db, "ads", ad.id), {
        status: nextStatus,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error(err);
      alert("Status update nahi hua.");
    }
  }

  async function completeAd(ad: Ad) {
    try {
      await updateDoc(doc(db, "ads", ad.id), {
        status: "Completed",
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error(err);
      alert("Ad update nahi hua.");
    }
  }

  async function deleteAd(ad: Ad) {
    const ok = confirm(
      `"${ad.title}" ko permanently delete karna hai?`
    );

    if (!ok) return;

    try {
      await deleteDoc(doc(db, "ads", ad.id));
    } catch (err) {
      console.error(err);
      alert("Ad delete nahi hua.");
    }
  }

  return (
    <main className="min-h-screen bg-[var(--color-primary-button)] p-4 text-[var(--button-text-color)]">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

          <div className="flex items-center gap-4">

            <div className="flex h-16 w-16 items-center justify-center rounded-[28px] bg-[var(--color-secondary-button)]">
              <Megaphone
                size={30}
                className="text-[var(--text-primary)]"
              />
            </div>

            <div>
              <h1 className="text-3xl font-black">
                Ads Manager
              </h1>

              <p className="mt-1 text-sm text-[var(--text-muted)]">
                Real Firestore advertisement management
              </p>
            </div>

          </div>

          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center justify-center gap-2 rounded-2xl bg-[var(--color-secondary-button)] px-5 py-3 font-bold text-[var(--text-primary)]"
          >
            <Plus size={18} />
            Create Ad
          </button>

        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-2xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 p-4">
            <p className="font-bold">
              Firebase / Firestore Error
            </p>

            <p className="mt-1 text-sm">
              {error}
            </p>
          </div>
        )}

        {/* STATS */}

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

          <StatCard
            title="Active Ads"
            value={number(activeAds)}
            icon={<Megaphone size={22} />}
          />

          <StatCard
            title="Impressions"
            value={number(totalImpressions)}
            icon={<Eye size={22} />}
          />

          <StatCard
            title="Clicks"
            value={number(totalClicks)}
            icon={<MousePointerClick size={22} />}
          />

          <StatCard
            title="Revenue"
            value={money(totalRevenue)}
            icon={<TrendingUp size={22} />}
          />

        </div>

        {/* SEARCH */}

        <div className="mt-6 flex items-center gap-3 rounded-[24px] border border-[var(--color-border)]/10 bg-[var(--color-primary-button)] px-4 py-3">

          <Search
            size={20}
            className="text-[var(--text-muted)]"
          />

          <input
            type="text"
            placeholder="Search ads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent outline-none placeholder:text-[var(--text-muted)]"
          />

        </div>

        {/* ADS */}

        <div className="mt-6 space-y-4">

          {loading ? (
            <div className="rounded-[28px] border border-[var(--color-border)]/10 bg-[var(--color-primary-button)] p-8 text-center">
              Loading real ads from Firestore...
            </div>
          ) : filteredAds.length === 0 ? (
            <div className="rounded-[28px] border border-[var(--color-border)]/10 bg-[var(--color-primary-button)] p-8 text-center">

              <Megaphone
                size={40}
                className="mx-auto opacity-50"
              />

              <h2 className="mt-4 text-xl font-bold">
                No Ads Found
              </h2>

              <p className="mt-2 text-sm text-[var(--text-muted)]">
                Abhi Firestore ki ads collection me koi ad nahi hai.
              </p>

              <button
                onClick={() => setShowCreate(true)}
                className="mt-5 rounded-2xl bg-[var(--color-secondary-button)] px-5 py-3 font-bold text-[var(--text-primary)]"
              >
                Create First Ad
              </button>

            </div>
          ) : (
            filteredAds.map((item) => (

              <div
                key={item.id}
                className="rounded-[28px] border border-[var(--color-border)]/10 bg-[var(--color-primary-button)] p-5"
              >

                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">

                  <div>

                    <h2 className="text-2xl font-black">
                      {item.title}
                    </h2>

                    <div className="mt-2 flex items-center gap-2 text-sm text-[var(--text-muted)]">
                      <Globe size={15} />
                      {item.platform}
                    </div>

                  </div>

                  <div
                    className={`w-fit rounded-full px-4 py-1 text-sm font-bold ${
                      item.status === "Running"
                        ? "bg-[var(--color-success)]/20 text-[var(--color-success)]"
                        : item.status === "Paused"
                        ? "bg-[var(--color-warning)]/20 text-[var(--color-warning)]"
                        : "bg-[var(--color-card-background)]/20 text-[var(--text-primary)]"
                    }`}
                  >
                    {item.status}
                  </div>

                </div>

                {/* METRICS */}

                <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">

                  <MiniMetric
                    label="Budget"
                    value={money(item.budget)}
                  />

                  <MiniMetric
                    label="Impressions"
                    value={number(item.impressions)}
                  />

                  <MiniMetric
                    label="Clicks"
                    value={number(item.clicks)}
                  />

                  <MiniMetric
                    label="Revenue"
                    value={money(item.revenue)}
                  />

                </div>

                {/* ACTIONS */}

                <div className="mt-5 flex flex-wrap gap-2">

                  <button
                    onClick={() => toggleStatus(item)}
                    className="flex items-center gap-2 rounded-2xl bg-[var(--color-secondary-button)] px-4 py-2 font-bold text-[var(--text-primary)]"
                  >
                    {item.status === "Running" ? (
                      <>
                        <Pause size={16} />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play size={16} />
                        Start
                      </>
                    )}
                  </button>

                  {item.status !== "Completed" && (
                    <button
                      onClick={() => completeAd(item)}
                      className="rounded-2xl bg-[var(--color-success)]/20 px-4 py-2 font-bold text-[var(--color-success)]"
                    >
                      Complete
                    </button>
                  )}

                  <button
                    onClick={() => deleteAd(item)}
                    className="flex items-center gap-2 rounded-2xl bg-[var(--color-danger)]/20 px-4 py-2 font-bold text-[var(--color-danger)]"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>

                </div>

              </div>

            ))
          )}

        </div>

        {/* AI ADS */}

        <div className="mt-6 rounded-[30px] bg-gradient-to-r from-[var(--color-primary-button)] to-[var(--color-primary-button)] p-6">

          <div className="flex items-center gap-3">
            <Sparkles size={26} />

            <h2 className="text-3xl font-black">
              AI Ads Generator
            </h2>
          </div>

          <p className="mt-3 max-w-2xl text-sm text-[var(--button-text-color)]/90">
            AI creative generation ko baad me real AI service se connect
            kiya ja sakta hai.
          </p>

          <button
            type="button"
            disabled
            className="mt-6 flex cursor-not-allowed items-center gap-2 rounded-2xl bg-[var(--color-card-background)] px-6 py-3 font-bold text-[var(--button-text-color)] opacity-60"
          >
            <PlayCircle size={18} />
            AI Generator — Not Connected
          </button>

        </div>

      </div>

      {/* CREATE MODAL */}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">

          <div className="w-full max-w-lg rounded-[30px] bg-[var(--color-card-background)] p-6 text-[var(--text-primary)]">

            <div className="flex items-center justify-between">

              <h2 className="text-2xl font-black">
                Create Ad
              </h2>

              <button
                onClick={() => setShowCreate(false)}
                className="rounded-full p-2"
              >
                <X size={22} />
              </button>

            </div>

            <div className="mt-5 space-y-4">

              <Input
                label="Ad Title"
                value={title}
                onChange={setTitle}
                placeholder="Example: Homepage Banner"
              />

              <Input
                label="Destination URL"
                value={url}
                onChange={setUrl}
                placeholder="https://example.com"
                type="url"
              />

              <div>
                <label className="text-sm font-bold">
                  Platform
                </label>

                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-input-background)] p-3 outline-none"
                >
                  <optgroup label="Publisher / Ad Network">
                    <option>Google AdSense</option>
                    <option>Google Ad Manager</option>
                    <option>Meta Audience Network</option>
                    <option>Amazon Publisher Services</option>
                  </optgroup>

                  <optgroup label="Campaign / Direct">
                    <option>Google Ads</option>
                    <option>Meta Ads</option>
                    <option>YouTube Ads</option>
                    <option>JembeeKart Ads</option>
                    <option>Direct Sponsor</option>
                    <option>Other</option>
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="text-sm font-bold">
                  Pricing Model
                </label>

                <select
                  value={pricingModel}
                  onChange={(e) =>
                    setPricingModel(e.target.value as "CPC" | "CPM")
                  }
                  className="mt-2 w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-input-background)] p-3 outline-none"
                >
                  <option value="CPC">CPC — Cost Per Click</option>
                  <option value="CPM">CPM — Cost Per 1,000 Impressions</option>
                </select>
              </div>

              <Input
                label={pricingModel === "CPC" ? "CPC Rate (₹)" : "CPM Rate (₹)"}
                value={rate}
                onChange={setRate}
                placeholder="Enter rate"
                type="number"
              />

              <Input
                label="Budget"
                value={budget}
                onChange={setBudget}
                placeholder="12000"
                type="number"
              />

              <div className="grid grid-cols-2 gap-3">

                <Input
                  label="Impressions"
                  value={impressions}
                  onChange={setImpressions}
                  type="number"
                />

                <Input
                  label="Clicks"
                  value={clicks}
                  onChange={setClicks}
                  type="number"
                />

              </div>

              <Input
                label="Revenue"
                value={revenue}
                onChange={setRevenue}
                type="number"
              />

              <button
                onClick={createAd}
                disabled={saving}
                className="w-full rounded-2xl bg-[var(--color-primary-button)] px-5 py-3 font-bold text-[var(--button-text-color)] disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Ad"}
              </button>

            </div>

          </div>

        </div>
      )}

    </main>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-[28px] border border-[var(--color-border)]/10 bg-[var(--color-primary-button)] p-5">

      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-secondary-button)] text-[var(--text-primary)]">
        {icon}
      </div>

      <p className="mt-4 text-sm text-[var(--text-muted)]">
        {title}
      </p>

      <h2 className="mt-2 text-3xl font-black">
        {value}
      </h2>

    </div>
  );
}

function MiniMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)]/10 bg-[var(--color-card-background)]/20 p-3">
      <p className="text-xs text-[var(--text-muted)]">
        {label}
      </p>

      <p className="mt-1 font-black">
        {value}
      </p>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="text-sm font-bold">
        {label}
      </label>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-input-background)] p-3 outline-none"
      />
    </div>
  );
}
