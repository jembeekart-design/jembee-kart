import type { Metadata } from "next";
import AppInstallActions from "@/components/download/AppInstallActions";

export const metadata: Metadata = {
  title: "Download JEMBEE PLAY",
  description: "Download JEMBEE PLAY for Android mobile, Android TV and Google TV, or install the web app on supported devices.",
  alternates: { canonical: "/download" },
};

export default function DownloadPage() {

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <section className="relative isolate overflow-hidden border-b border-slate-200 bg-gradient-to-br from-white via-sky-50 to-indigo-50">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-700">JEMBEE PLAY · DOWNLOAD CENTRE</p>
          <div className="mt-5 max-w-3xl">
            <h1 className="text-4xl font-black tracking-tight sm:text-6xl">Your videos. Your learning. Every screen.</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">Choose the JEMBEE PLAY experience built for your device. Mobile and TV apps are distributed separately so each gets the right navigation, playback controls and screen layout.</p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#android-mobile" className="rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-slate-900/10">Android Mobile</a>
            <a href="#android-tv" className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-800">Android TV / Google TV</a>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-5 py-12 sm:px-8 lg:grid-cols-2">
        <article id="android-mobile" className="scroll-mt-8 rounded-3xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-900/[0.04]">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-2xl">📱</div>
          <h2 className="mt-5 text-2xl font-extrabold">JEMBEE PLAY Mobile</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">A touch-first Android experience for Shorts, long videos, learning, creator tools and your personal library.</p>
          <ul className="mt-5 space-y-2 text-sm text-slate-700"><li>• Android phone and tablet layout</li><li>• Mobile video player and upload flow</li><li>• Light, dark and system theme support planned across app surfaces</li></ul>
          <div className="mt-7"><AppInstallActions platform="mobile"  /></div>
        </article>

        <article id="android-tv" className="scroll-mt-8 rounded-3xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-900/[0.04]">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-2xl">📺</div>
          <h2 className="mt-5 text-2xl font-extrabold">JEMBEE PLAY for TV</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">A separate ten-foot interface designed for Android TV and Google TV, with remote-first navigation and readable playback controls.</p>
          <ul className="mt-5 space-y-2 text-sm text-slate-700"><li>• D-pad and focus-state navigation</li><li>• TV-friendly discovery and learning rows</li><li>• Dedicated TV playback experience</li></ul>
          <div className="mt-7"><AppInstallActions platform="tv"  /></div>
        </article>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-12 sm:px-8">
        <div className="grid gap-5 rounded-3xl bg-slate-950 p-7 text-white sm:grid-cols-[1fr_auto] sm:items-center sm:p-9">
          <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">No app store required for the web app</p><h2 className="mt-2 text-2xl font-extrabold">Install the JEMBEE PLAY website</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">On supported browsers, install the website as an app. This uses the web experience and is separate from the native Android downloads.</p></div>
          <AppInstallActions platform="web" />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950">
          <strong>Release status:</strong> Native APK downloads will appear here only after signed release files, checksums, device compatibility and security tests are verified. No placeholder or unverified APK is offered. Google Play and Apple App Store publication are not enabled by this page.
        </div>
        <p className="mt-6 text-center text-xs text-slate-500">JEMBEE PLAY · Watch · Learn · Create · Share</p>
      </section>
    </main>
  );
}
