import CategoryAdmin from "@/components/admin/CategoryAdmin";

export const dynamic =
  "force-dynamic";

export default function Page() {
  return (
    <main className="min-h-screen bg-[var(--color-card-background)]">

      <CategoryAdmin />

    </main>
  );
}
