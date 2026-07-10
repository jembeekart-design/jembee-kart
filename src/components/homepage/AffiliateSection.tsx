"use client";

interface AffiliateSectionProps {
  title?: string;

  description?: string;

  buttonText?: string;

  backgroundColor?: string;

  gradientColor?: string;

  buttonColor?: string;

  buttonTextColor?: string;

  textColor?: string;

  borderRadius?: string;

  sectionPadding?: string;
}

export default function AffiliateSection({
  title = "Earn With Affiliate Marketing",

  description = "Share products, grow your network and earn passive income daily with JembeeKart affiliate ecosystem.",

  buttonText = "Join Affiliate Program",

  backgroundColor = "var(--primary-color)",

  gradientColor = "var(--primary-color)",

  buttonColor = "var(--primary-color)",

  buttonTextColor = "var(--primary-color)",

  textColor = "var(--primary-color)",

  borderRadius = "24px",

  sectionPadding = "20px"
}: AffiliateSectionProps) {
  return (
    <section className="w-full overflow-hidden px-3 py-5 md:px-6">

      <div
        className="w-full overflow-hidden shadow-2xl transition-all duration-300 hover:scale-[1.01]"
        style={{
          background: `linear-gradient(135deg, ${backgroundColor}, ${gradientColor})`,

          borderRadius: borderRadius,

          padding: sectionPadding,

          color: textColor
        }}
      >

        <div className="w-full max-w-3xl min-w-0">

          <h2
            className="break-words text-3xl font-black leading-tight md:text-6xl"
            style={{
              color: textColor
            }}
          >
            {title}
          </h2>

          <p
            className="mt-4 break-words text-base leading-relaxed md:mt-5 md:text-2xl"
            style={{
              color: textColor
            }}
          >
            {description}
          </p>

          <button
            className="mt-6 w-full rounded-2xl px-5 py-3 text-sm font-bold transition-all duration-300 hover:scale-[1.02] md:mt-8 md:w-auto md:px-16 md:py-5 md:text-base"
            style={{
              backgroundColor:
                buttonColor,

              color:
                buttonTextColor
            }}
          >
            {buttonText}
          </button>

        </div>

      </div>

    </section>
  );
}
