import { AdNetworkManager } from "@/components/admin/AdNetworkManager";

export const dynamic = "force-dynamic";

export default function AdsManagerPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] p-4 text-[var(--text-primary)] sm:p-6">
      <div className="mx-auto max-w-5xl space-y-3">
        <header>
          <h1 className="text-3xl font-black">Ads Manager</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">Monetag sponsored placements और Free/Paid Long Video ad schedules नियंत्रित करें।</p>
        </header>
        <AdNetworkManager />
      </div>
    </main>
  );
}
