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
    <section className="mx-auto max-w-7xl px-4 py-6 md:px-6">

      <div className="rounded-[30px] bg-gradient-to-r from-black to-gray-900 p-6 text-white shadow-2xl md:rounded-[40px] md:p-12">

        <div className="max-w-3xl">

          <h2 className="text-3xl font-black leading-tight md:text-5xl">
            {title}
          </h2>

          <p className="mt-5 text-base text-gray-300 md:text-lg">
            {description}
          </p>

          <button className="mt-8 rounded-2xl bg-blue-600 px-8 py-4 font-bold text-white transition-all duration-300 hover:scale-105 hover:bg-blue-700">
            {buttonText}
          </button>

        </div>

      </div>

    </section>
  );
}
