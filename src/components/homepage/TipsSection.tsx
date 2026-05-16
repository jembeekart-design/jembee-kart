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
    <section className="mx-auto max-w-7xl px-4 py-6 md:px-6">

      <div className="rounded-[30px] bg-white p-5 shadow-xl md:rounded-[40px] md:p-8">

        <div className="mb-8">

          <h2 className="text-3xl font-black text-gray-800 md:text-5xl">
            AI Business Tips
          </h2>

          <p className="mt-3 text-gray-500">
            Grow faster with AI powered ecommerce strategies.
          </p>

        </div>

        <div className="grid gap-5 md:grid-cols-3">

          {tips.map((tip) => {
            return (
              <div
                key={tip}
                className="rounded-[25px] bg-gradient-to-br from-gray-900 to-black p-6 text-white shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
              >

                <div className="mb-5 text-4xl">
                  🚀
                </div>

                <h3 className="text-xl font-bold leading-relaxed">
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
