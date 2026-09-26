import type { Metadata } from "next";
import { getPublishedFAQs } from "@/lib/content/faqService";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "Find answers to common questions about shopping, orders, rewards, payments, delivery and JembeeKart.",
};

export default async function FAQPage() {
  const faqs = await getPublishedFAQs();

  return (
    <main className="min-h-screen bg-[var(--background-color)] text-[var(--text-color)]">
      <div className="mx-auto max-w-4xl px-5 py-12 md:px-8">
        <h1 className="text-3xl font-bold md:text-4xl">
          Frequently Asked Questions
        </h1>

        <p className="mt-4 leading-7 opacity-80">
          Find answers to common questions about shopping, orders, payments,
          delivery and JembeeKart services.
        </p>

        <div className="mt-8 space-y-4">
          {faqs.length === 0 ? (
            <p className="opacity-70">
              FAQs are currently being updated.
            </p>
          ) : (
            faqs.map((faq) => (
              <article
                key={faq.id}
                className="rounded-2xl bg-[var(--card-color)] p-5"
              >
                <h2 className="text-lg font-bold">
                  {faq.question}
                </h2>

                <p className="mt-3 leading-7 opacity-80">
                  {faq.answer}
                </p>
              </article>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
