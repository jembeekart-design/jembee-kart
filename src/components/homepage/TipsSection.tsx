"use client";

interface TipsSectionProps {
  tips?: string[];
}

export default function TipsSection({
  tips = [
    "Use trending products daily",
    "Share products on WhatsApp",
    "Build passive affiliate income"
  ]
}: TipsSectionProps) {
  return (
    <section className="w-full overflow-hidden px-3 py-5 md:px-6">

      <div className="w-full overflow-hidden rounded-[24px] bg-[var(--card-color)] p-4 shadow-xl md:rounded-[40px] md:p-8">

        <div className="mb-6 w-full min-w-0">

          <h2 className="break-words text-3xl font-black leading-tight text-gray-800 md:text-5xl">
            AI Business Tips
          </h2>

          <p className="mt-3 break-words text-sm text-[var(--muted-text-color)] md:text-lg">
            Grow faster with AI powered ecommerce strategies.
          </p>

        </div>

        <div className="grid gap-4 md:grid-cols-3">

          {tips.map((tip) => {
            return (
              <div
                key={tip}
                className="w-full min-w-0 overflow-hidden rounded-[24px] bg-gradient-to-br from-gray-900 to-black p-5 text-[var(--button-text-color)] shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
              >

                <div className="mb-4 text-4xl">
                  🚀
                </div>

                <h3 className="break-words text-lg font-bold leading-relaxed md:text-2xl">
                  {tip}
                </h3>

              </div>
            );
          })}

        </div>

      </div>

    </section>
  );
}
