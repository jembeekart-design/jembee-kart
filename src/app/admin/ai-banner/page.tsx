"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase/config";
import { AIBannerService } from "@/firestore/services/AIBannerService";
import { AIBannerDraft } from "@/types/aiBanner";

import {
  Sparkles,
  Wand2,
  Save,
  LayoutTemplate,
  ImageIcon
} from "lucide-react";

const bannerService = new AIBannerService();

export default function AIBannerPage() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedBanner, setGeneratedBanner] = useState("");
  const [drafts, setDrafts] = useState<(AIBannerDraft & { id: string })[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const data = await bannerService.query([]);
        setDrafts(data);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  async function generateBanner() {
    if (!prompt || !user) return;
    try {
      setLoading(true);
      // Placeholder AI Generation (To be replaced by real API)
      await new Promise(resolve => setTimeout(resolve, 1000));
      setGeneratedBanner("https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1200");
    } catch (error) {
      console.error(error);
      alert("Failed to generate (Placeholder)");
    } finally {
      setLoading(false);
    }
  }

  async function saveBanner() {
    if (!generatedBanner || !user) return;
    try {
      setLoading(true);
      const draft: AIBannerDraft = { prompt, imageUrl: generatedBanner };
      const id = Date.now().toString();
      await bannerService.create(id, draft);
      setDrafts(prev => [...prev, { id, ...draft }]);
      alert("Banner Saved to Firestore");
    } catch (error) {
      console.error(error);
      alert("Failed to save banner");
    } finally {
      setLoading(false);
    }
  }

  if (!user) return <main className="p-4">Please log in to access this admin module.</main>;

  return (
    <main className="min-h-screen bg-[var(--color-page-background)] p-4 text-[var(--button-text-color)]">
      {/* HEADER */}
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-[30px] bg-[var(--color-primary-button)]">
          <Sparkles size={30} className="text-[var(--text-primary)]" />
        </div>
        <div>
          <h1 className="text-4xl font-black">AI Banner Generator</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">Create beautiful AI banners instantly</p>
        </div>
      </div>

      {/* PROMPT SECTION */}
      <div className="rounded-[30px] border border-[var(--color-border)]/10 bg-[var(--color-primary-button)] p-6">
        <div className="flex items-center gap-3">
          <Wand2 className="text-[var(--color-primary-button)]" />
          <h2 className="text-2xl font-black">Banner Prompt</h2>
        </div>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Example: Create modern ecommerce fashion sale banner with neon effects..."
          className="mt-5 h-40 w-full rounded-3xl border border-[var(--color-border)]/10 bg-[var(--color-card-background)]/40 p-5 text-[var(--button-text-color)] outline-none"
        />

        <div className="mt-5 flex flex-wrap gap-4">
          <button
            onClick={generateBanner}
            disabled={loading}
            className="flex items-center gap-2 rounded-2xl bg-[var(--color-primary-button)] px-6 py-4 font-bold text-[var(--text-primary)] transition-all hover:scale-[1.03]"
          >
            <Sparkles size={20} />
            {loading ? "Generating..." : "Generate Banner"}
          </button>
        </div>
      </div>

      {/* GENERATED BANNER */}
      {generatedBanner && (
        <div className="mt-6 rounded-[30px] border border-[var(--color-border)]/10 bg-[var(--color-primary-button)] p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ImageIcon className="text-[var(--color-primary-button)]" />
              <h2 className="text-2xl font-black">Generated Banner</h2>
            </div>
            <div className="flex gap-3">
              <button onClick={saveBanner} className="flex items-center gap-2 rounded-2xl bg-[var(--color-success)] px-4 py-3 font-black text-[var(--text-primary)]">
                <Save size={18} />
                Save to Firestore
              </button>
            </div>
          </div>
          <div className="mt-6 overflow-hidden rounded-[30px] border border-[var(--color-border)]/10">
            <img src={generatedBanner} alt="Banner" className="h-full w-full object-cover" />
          </div>
        </div>
      )}

      {/* SAVED BANNERS */}
      <div className="mt-6 rounded-[30px] border border-[var(--color-border)]/10 bg-[var(--color-primary-button)] p-6">
        <h2 className="text-2xl font-black">Saved Banners</h2>
        <div className="grid grid-cols-3 gap-4 mt-4">
          {drafts.map(d => <img key={d.id} src={d.imageUrl} alt={d.prompt} className="rounded-lg"/>)}
        </div>
      </div>
    </main>
  );
}
