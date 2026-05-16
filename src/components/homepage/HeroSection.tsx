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
    <section className="mx-auto max-w-7xl px-4 py-6 md:px-6">
      
      <div className="overflow-hidden rounded-[30px] bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 p-6 text-white shadow-2xl md:rounded-[40px] md:p-14">

        <div className="max-w-3xl">

          <h1 className="text-3xl font-black leading-tight md:text-6xl">
            {title}
          </h1>

          <p className="mt-5 text-base text-blue-100 md:text-xl">
            {subtitle}
          </p>

          <div className="mt-8 flex flex-wrap gap-4">

            <button className="rounded-2xl bg-white px-6 py-3 font-bold text-blue-700 shadow-xl transition-all duration-300 hover:scale-105">
              {buttonText}
            </button>

            <button className="rounded-2xl border border-white/30 bg-white/10 px-6 py-3 font-bold text-white backdrop-blur-xl transition-all duration-300 hover:bg-white/20">
              {secondaryButtonText}
            </button>

          </div>

        </div>

      </div>

    </section>
  );
}
