import CategoryAdmin from "@/components/admin/CategoryAdmin";

export const dynamic =
  "force-dynamic";

export default function Page() {
  return (
    <main className="min-h-screen bg-slate-100">

      <CategoryAdmin />

    </main>
  );
}
