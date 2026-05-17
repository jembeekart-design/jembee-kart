"use client";

interface HeroSectionProps {
  title?: string;

  subtitle?: string;

  buttonText?: string;

  secondaryButtonText?: string;

  titleSize?: string;

  subtitleSize?: string;

  buttonSize?: string;

  backgroundColor?: string;

  gradientColor?: string;

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

  buttonSize = "20px",

  backgroundColor = "#2563eb",

  gradientColor = "#7c3aed",

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
        className="w-full overflow-hidden shadow-2xl flex flex-col justify-center"
        style={{
          background: `linear-gradient(90deg, ${backgroundColor}, ${gradientColor})`,

          color: textColor,

          padding: sectionPadding,

          borderRadius: borderRadius,

          minHeight: sectionHeight
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
              className="w-full rounded-2xl px-6 py-3 font-bold shadow-xl transition-all duration-300 hover:scale-[1.02] md:w-auto"
              style={{
                background: buttonColor,

                color: buttonTextColor,

                fontSize: buttonSize
              }}
            >
              {buttonText}
            </button>

            <button
              className="w-full rounded-2xl border border-white/30 bg-white/10 px-6 py-3 font-bold text-white backdrop-blur-xl transition-all duration-300 hover:bg-white/20 md:w-auto"
              style={{
                fontSize: buttonSize
              }}
            >
              {secondaryButtonText}
            </button>

          </div>

        </div>

      </div>

    </section>
  );
}
