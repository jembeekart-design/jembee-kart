import { getFirestoreDocument } from "@/lib/firestore/getFirestoreDocument";

export const dynamic = "force-dynamic";

export default async function ShippingPage() {
  const result = await getFirestoreDocument("dynamic_pages", "shipping");

  if (!result.success || !result.data || result.data.visible === false) {
    return (
      <main className="min-h-screen bg-[var(--background-color)] text-[var(--text-color)]">
        <div className="mx-auto max-w-4xl px-5 py-12 md:px-8">
          <h1 className="text-3xl font-bold">
            Shipping &amp; Delivery Policy
          </h1>

          <p className="mt-4 opacity-70">
            Shipping &amp; Delivery Policy is currently unavailable.
          </p>
        </div>
      </main>
    );
  }

  const title =
    typeof result.data.title === "string"
      ? result.data.title
      : "Shipping & Delivery Policy";

  const content =
    typeof result.data.content === "string"
      ? result.data.content
      : "";

  return (
    <main className="min-h-screen bg-[var(--background-color)] text-[var(--text-color)]">
      <div className="mx-auto max-w-4xl px-5 py-12 md:px-8">
        <h1 className="mb-3 text-3xl font-bold md:text-4xl">
          {title}
        </h1>

        <div
          className="space-y-5 leading-7"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </main>
  );
}
