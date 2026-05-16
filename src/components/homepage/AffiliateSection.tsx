"use client";

interface AffiliateSectionProps {
  title?: string;

  description?: string;

  buttonText?: string;
}

export default function AffiliateSection({
  title = "Earn With Affiliate Marketing",

  description = "Share products, grow your network and earn passive income daily with JembeeKart affiliate ecosystem.",

  buttonText = "Join Affiliate Program"
}: AffiliateSectionProps) {
  return (
    <section className="w-full overflow-hidden px-4 py-6 md:px-6">

      <div className="mx-auto max-w-7xl overflow-hidden rounded-[30px] bg-gradient-to-r from-black to-gray-900 p-6 text-white shadow-2xl md:rounded-[50px] md:p-16">

        <div className="max-w-3xl">

          <h2 className="text-3xl font-black leading-tight md:text-6xl">
            {title}
          </h2>

          <p className="mt-5 text-lg leading-relaxed text-gray-300 md:text-2xl">
            {description}
          </p>

          <button className="mt-8 rounded-2xl bg-blue-600 px-6 py-3 font-bold text-white transition-all duration-300 hover:scale-105 hover:bg-blue-700 md:px-16 md:py-5">
            {buttonText}
          </button>

        </div>

      </div>

    </section>
  );
}
