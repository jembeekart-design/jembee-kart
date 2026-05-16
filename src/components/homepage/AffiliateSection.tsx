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
    <section className="w-full overflow-hidden px-3 py-5 md:px-6">

      <div className="w-full overflow-hidden rounded-[24px] bg-gradient-to-r from-black to-gray-900 p-5 text-white shadow-2xl md:rounded-[50px] md:p-16">

        <div className="w-full max-w-3xl min-w-0">

          <h2 className="break-words text-3xl font-black leading-tight md:text-6xl">
            {title}
          </h2>

          <p className="mt-4 break-words text-base leading-relaxed text-gray-300 md:mt-5 md:text-2xl">
            {description}
          </p>

          <button className="mt-6 w-full rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition-all duration-300 hover:bg-blue-700 md:mt-8 md:w-auto md:px-16 md:py-5 md:text-base">
            {buttonText}
          </button>

        </div>

      </div>

    </section>
  );
}
