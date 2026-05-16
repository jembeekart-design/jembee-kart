"use client";

interface HeroSectionProps {
  title?: string;

  subtitle?: string;

  buttonText?: string;

  secondaryButtonText?: string;
}

export default function HeroSection({
  title = "Build Your Ecommerce Empire",

  subtitle = "AI Powered Ecommerce, Affiliate Marketing, Reselling, MLM and Seller Ecosystem.",

  buttonText = "Start Shopping",

  secondaryButtonText = "Become Seller"
}: HeroSectionProps) {
  return (
    <section className="w-full overflow-hidden px-3 py-5 md:px-6">

      <div className="w-full overflow-hidden rounded-[24px] bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 p-5 text-white shadow-2xl md:rounded-[50px] md:p-16">

        <div className="w-full max-w-3xl min-w-0">

          <h1 className="break-words text-3xl font-black leading-tight sm:text-4xl md:text-7xl">
            {title}
          </h1>

          <p className="mt-4 break-words text-base leading-relaxed text-blue-100 md:mt-5 md:text-2xl">
            {subtitle}
          </p>

          <div className="mt-6 flex w-full flex-col gap-3 md:mt-8 md:flex-row md:gap-6">

            <button className="w-full rounded-2xl bg-white px-6 py-3 text-sm font-bold text-blue-700 shadow-xl transition-all duration-300 hover:scale-[1.02] md:w-auto md:px-16 md:py-5 md:text-base">
              {buttonText}
            </button>

            <button className="w-full rounded-2xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur-xl transition-all duration-300 hover:bg-white/20 md:w-auto md:px-16 md:py-5 md:text-base">
              {secondaryButtonText}
            </button>

          </div>

        </div>

      </div>

    </section>
  );
}
