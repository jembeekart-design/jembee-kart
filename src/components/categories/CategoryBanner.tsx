"use client";

interface CategoryBannerProps {
  title?: string;

  subtitle?: string;

  buttonText?: string;

  image?: string;

  backgroundColor?: string;

  gradientColor?: string;

  textColor?: string;
}

export default function CategoryBanner({
  title = "Fashion Mega Sale",

  subtitle =
    "Discover trending fashion styles with huge discounts and premium collections.",

  buttonText = "Shop Now",

  image =
    "https://images.unsplash.com/photo-1445205170230-053b83016050",

  backgroundColor = "#2563eb",

  gradientColor = "#7c3aed",

  textColor = "#ffffff"
}: CategoryBannerProps) {
  return (
    <section className="w-full overflow-hidden px-3 py-5 md:px-6">

      <div
        className="relative overflow-hidden rounded-[32px] p-6 shadow-2xl md:p-10"
        style={{
          background: `linear-gradient(135deg, ${backgroundColor}, ${gradientColor})`
        }}
      >

        {/* BACKGROUND IMAGE */}

        <div className="absolute right-0 top-0 h-full w-1/2 overflow-hidden opacity-20">

          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover"
          />

        </div>

        {/* CONTENT */}

        <div className="relative z-10 max-w-2xl">

          <h2
            className="text-3xl font-black leading-tight md:text-6xl"
            style={{
              color: textColor
            }}
          >
            {title}
          </h2>

          <p
            className="mt-4 text-base leading-relaxed opacity-90 md:mt-6 md:text-2xl"
            style={{
              color: textColor
            }}
          >
            {subtitle}
          </p>

          <button className="mt-6 rounded-2xl bg-white px-6 py-3 text-sm font-black text-blue-700 shadow-xl transition-all duration-300 hover:scale-[1.03] md:mt-8 md:px-10 md:py-5 md:text-lg">
            {buttonText}
          </button>

        </div>

      </div>

    </section>
  );
}
