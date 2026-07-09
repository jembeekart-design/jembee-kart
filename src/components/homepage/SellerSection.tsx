"use client";

interface SellerSectionProps {
  sellerTitle?: string;

  sellerDescription?: string;

  sellerButtonText?: string;

  resellerTitle?: string;

  resellerDescription?: string;

  resellerButtonText?: string;

  sellerBackgroundColor?: string;

  sellerGradientColor?: string;

  resellerBackgroundColor?: string;

  resellerGradientColor?: string;

  sellerButtonColor?: string;

  sellerButtonTextColor?: string;

  resellerButtonColor?: string;

  resellerButtonTextColor?: string;
}

export default function SellerSection({
  sellerTitle = "Become A Seller",

  sellerDescription = "Sell products with AI powered tools, analytics and advanced ecommerce automation.",

  sellerButtonText = "Start Selling",

  resellerTitle = "Reseller Program",

  resellerDescription = "Start reselling products without inventory and grow your online business easily.",

  resellerButtonText = "Join Now",

  sellerBackgroundColor = "#4f46e5",

  sellerGradientColor = "#7e22ce",

  resellerBackgroundColor = "#ec4899",

  resellerGradientColor = "#e11d48",

  sellerButtonColor = "#ffffff",

  sellerButtonTextColor = "#4338ca",

  resellerButtonColor = "#ffffff",

  resellerButtonTextColor = "#e11d48"
}: SellerSectionProps) {
  return (
    <section className="w-full overflow-hidden px-3 py-5 md:px-6">

      <div className="grid w-full gap-5 md:grid-cols-2">

        {/* SELLER CARD */}

        <div
          className="w-full overflow-hidden rounded-[24px] p-5 text-[var(--button-text-color)] shadow-2xl transition-all duration-300 hover:scale-[1.01] md:rounded-[50px] md:p-10"
          style={{
            background: `linear-gradient(135deg, ${sellerBackgroundColor}, ${sellerGradientColor})`
          }}
        >

          <div className="w-full min-w-0">

            <h2 className="break-words text-3xl font-black leading-tight md:text-6xl">
              {sellerTitle}
            </h2>

            <p className="mt-4 break-words text-base leading-relaxed text-[var(--button-text-color)]/90 md:mt-5 md:text-2xl">
              {sellerDescription}
            </p>

            <button
              className="mt-6 w-full rounded-2xl px-6 py-3 text-sm font-bold transition-all duration-300 hover:scale-[1.02] md:mt-8 md:w-auto md:px-12 md:py-5 md:text-base"
              style={{
                backgroundColor:
                  sellerButtonColor,

                color:
                  sellerButtonTextColor
              }}
            >
              {sellerButtonText}
            </button>

          </div>

        </div>

        {/* RESELLER CARD */}

        <div
          className="w-full overflow-hidden rounded-[24px] p-5 text-[var(--button-text-color)] shadow-2xl transition-all duration-300 hover:scale-[1.01] md:rounded-[50px] md:p-10"
          style={{
            background: `linear-gradient(135deg, ${resellerBackgroundColor}, ${resellerGradientColor})`
          }}
        >

          <div className="w-full min-w-0">

            <h2 className="break-words text-3xl font-black leading-tight md:text-6xl">
              {resellerTitle}
            </h2>

            <p className="mt-4 break-words text-base leading-relaxed text-[var(--button-text-color)]/90 md:mt-5 md:text-2xl">
              {resellerDescription}
            </p>

            <button
              className="mt-6 w-full rounded-2xl px-6 py-3 text-sm font-bold transition-all duration-300 hover:scale-[1.02] md:mt-8 md:w-auto md:px-12 md:py-5 md:text-base"
              style={{
                backgroundColor:
                  resellerButtonColor,

                color:
                  resellerButtonTextColor
              }}
            >
              {resellerButtonText}
            </button>

          </div>

        </div>

      </div>

    </section>
  );
}
