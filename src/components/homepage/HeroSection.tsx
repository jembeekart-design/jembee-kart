"use client";

interface HeroSectionProps {
  title?: string;

  subtitle?: string;

  buttonText?: string;

  secondaryButtonText?: string;

  titleSize?: string;

  subtitleSize?: string;

  backgroundColor?: string;

  textColor?: string;

  buttonColor?: string;

  buttonTextColor?: string;

  sectionPadding?: string;

  borderRadius?: string;

  sectionHeight?: string;
}

export default function HeroSection({
  title = "Build Your Ecommerce Empire",

  subtitle =
    "AI Powered Ecommerce, Affiliate Marketing, Reselling, MLM and Seller Ecosystem.",

  buttonText = "Start Shopping",

  secondaryButtonText = "Become Seller",

  titleSize = "48px",

  subtitleSize = "22px",

  backgroundColor =
    "linear-gradient(90deg,#2563eb,#7c3aed)",

  textColor = "#ffffff",

  buttonColor = "#ffffff",

  buttonTextColor = "#1d4ed8",

  sectionPadding = "24px",

  borderRadius = "24px",

  sectionHeight = "320px"
}: HeroSectionProps) {
  return (
    <section className="w-full overflow-hidden px-3 py-5 md:px-6">

      <div
        className="w-full overflow-hidden shadow-2xl"
        style={{
          background: backgroundColor,

          color: textColor,

          padding: sectionPadding,

          borderRadius: borderRadius,

          height: sectionHeight
        }}
      >

        <div className="w-full max-w-3xl min-w-0">

          <h1
            className="break-words font-black leading-tight"
            style={{
              fontSize: titleSize,

              lineHeight: "1.1"
            }}
          >
            {title}
          </h1>

          <p
            className="mt-4 break-words leading-relaxed opacity-90"
            style={{
              fontSize: subtitleSize
            }}
          >
            {subtitle}
          </p>

          <div className="mt-6 flex w-full flex-col gap-3 md:flex-row md:gap-6">

            <button
              className="w-full rounded-2xl px-6 py-3 text-sm font-bold shadow-xl transition-all duration-300 hover:scale-[1.02] md:w-auto md:px-16 md:py-5 md:text-base"
              style={{
                background: buttonColor,

                color: buttonTextColor
              }}
            >
              {buttonText}
            </button>

            <button
              className="w-full rounded-2xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur-xl transition-all duration-300 hover:bg-white/20 md:w-auto md:px-16 md:py-5 md:text-base"
            >
              {secondaryButtonText}
            </button>

          </div>

        </div>

      </div>

    </section>
  );
}
